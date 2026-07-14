'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '../../lib/constants';
import { calculateScores, rankCharacters } from '../../lib/scoring';
import { updateParticipant } from '../../lib/db';
import { playClickSound, playSuccessSound } from '../../lib/audio';

const ITEMS_PER_PAGE = 5;
const TOTAL_PAGES = Math.ceil(QUESTIONS.length / ITEMS_PER_PAGE);

export default function DiagnosePage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Validate session/participant on load
  useEffect(() => {
    const pid = sessionStorage.getItem('team_party_participant_id');
    if (!pid) {
      router.push('/');
    } else {
      setParticipantId(pid);
    }
  }, [router]);

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const pageQuestions = QUESTIONS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSelectAnswer = (qId: number, value: number) => {
    playClickSound();
    setAnswers(prev => ({
      ...prev,
      [qId]: value
    }));
  };

  const handleNext = () => {
    playClickSound();
    const unansweredOnPage = pageQuestions.filter(q => !answers[q.id]);
    if (unansweredOnPage.length > 0) {
      setErrorMsg('현재 페이지의 모든 질문에 답변해주세요!');
      return;
    }
    setErrorMsg('');
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    playClickSound();
    setErrorMsg('');
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    playClickSound();
    setErrorMsg('');

    const unanswered = QUESTIONS.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setErrorMsg(`답변하지 않은 질문이 있습니다. (남은 질문: ${unanswered.length}개)`);
      return;
    }

    if (!participantId) return;

    setLoading(true);
    try {
      const answerArray = QUESTIONS.map(q => answers[q.id]);
      const scores = calculateScores(answerArray);
      const characterRanks = rankCharacters(scores);
      const primaryCharacter = characterRanks[0];

      await updateParticipant(participantId, {
        answers: answerArray,
        scores: scores,
        character_key: primaryCharacter,
        character_ranks: characterRanks
      });

      playSuccessSound();
      router.push('/result');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('진단 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const isPageComplete = pageQuestions.every(q => answers[q.id]);
  const isLastPage = currentPage === TOTAL_PAGES - 1;
  const completedCount = QUESTIONS.filter(q => answers[q.id]).length;
  const progressPercent = (completedCount / QUESTIONS.length) * 100;

  if (!participantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-amber-900 font-black">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-2xl mx-auto select-none pt-8">
      {/* Progress Box using cozy-card */}
      <div className="cozy-card p-5 mb-6 bg-[#fffdfa]/95">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-black text-[#3e2f27]">🔍 진행도: {completedCount} / 40 문항</span>
          <span className="text-sm font-black text-[#6b5b52]">페이지 {currentPage + 1} / {TOTAL_PAGES}</span>
        </div>

        {/* Cozy Progress Bar */}
        <div className="w-full bg-[#f5efe6] h-6 border-4 border-[#6b5b52] rounded-full relative overflow-hidden flex p-[2px]">
          <div
            className="bg-[#bae6fd] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Cozy Dots Indicator */}
        <div className="grid grid-cols-10 gap-1.5 mt-4">
          {QUESTIONS.map((q) => {
            const isAnswered = !!answers[q.id];
            const isCurrentPage = q.id >= startIndex + 1 && q.id <= startIndex + ITEMS_PER_PAGE;
            
            let bgClass = 'bg-stone-200 border-stone-300';
            if (isAnswered) {
              bgClass = 'bg-[#bbf7d0] border-[#8ca695] shadow-sm';
            } else if (isCurrentPage) {
              bgClass = 'bg-[#bae6fd] border-[#7ea0b5] animate-pulse';
            }

            return (
              <div
                key={q.id}
                className={`h-3 border-2 rounded-sm ${bgClass}`}
                title={`Q${q.id}`}
              />
            );
          })}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6 flex-grow">
        {pageQuestions.map((q) => {
          const selectedVal = answers[q.id];
          return (
            <div
              key={q.id}
              className={`cozy-card p-6 bg-[#fffdfa]/95 transition-all ${
                selectedVal ? 'border-[#8ca695] bg-[#f0fdf4]/50' : 'border-[#6b5b52]'
              }`}
            >
              <div className="flex gap-3 mb-4.5">
                <span className="text-[#3e2f27] font-black text-base min-w-[32px]">
                  Q{q.id}.
                </span>
                <p className="text-base font-black text-[#3e2f27] leading-relaxed">
                  {q.text}
                </p>
              </div>

              {/* Standardized choices */}
              <div className="grid grid-cols-5 gap-1.5 md:gap-3">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isActive = selectedVal === val;
                  const optionLabels = ['전혀 아니다', '그렇지 않다', '보통이다', '그렇다', '매우 그렇다'];
                  
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelectAnswer(q.id, val)}
                      className={`pixel-btn ${
                        isActive 
                          ? 'likert-active-choice text-[#213f2b]' 
                          : 'bg-white border-[#b3a7a0] text-stone-700 hover:bg-[#fffdfa]'
                      } text-xs md:text-sm py-2 px-1 text-center flex flex-col items-center justify-center min-h-[96px] h-full w-full`}
                      type="button"
                    >
                      <span className="font-black text-sm md:text-base mb-1.5">
                        {isActive ? `⭐ ${val}` : val}
                      </span>
                      <span className="text-[10px] md:text-xs font-black leading-tight text-center break-keep">
                        {optionLabels[val-1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="my-5 p-3 border-2 border-rose-300 bg-rose-50 text-rose-800 text-sm text-center font-bold rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center my-8 gap-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0 || loading}
          className="pixel-btn pixel-btn-gray w-32 text-sm py-2.5"
        >
          ◀ 이전
        </button>

        {isLastPage ? (
          <button
            onClick={handleSubmit}
            disabled={!isPageComplete || loading}
            className="pixel-btn pixel-btn-purple w-44 text-sm py-2.5"
          >
            {loading ? '제출 중...' : '결과 분석하기 🔭'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isPageComplete || loading}
            className="pixel-btn w-32 text-sm py-2.5"
          >
            다음 ▶
          </button>
        )}
      </div>
    </div>
  );
}
