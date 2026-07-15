'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getParticipantById, Participant } from '../../lib/db';
import { convertTo100PointScale, getDifferenceFromAverage } from '../../lib/utils';
import { BIG5_REPORT_TEXTS, CHARACTER_PROFILES, STAT_METADATA } from '../../lib/constants';
import { playClickSound, playSuccessSound } from '../../lib/audio';
import CharacterImage from '../../components/CharacterImage';

export default function ReportPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [teamNumber, setTeamNumber] = useState<string | null>(null);

  const [me, setMe] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const pid = sessionStorage.getItem('team_party_participant_id');
    const sid = sessionStorage.getItem('team_party_session_id');
    const team = sessionStorage.getItem('team_party_team_number');

    if (!pid || !sid) {
      router.push('/');
      return;
    }

    setParticipantId(pid);
    setSessionId(sid);
    setTeamNumber(team);

    // Fetch participant
    getParticipantById(pid)
      .then((data) => {
        if (!data || !data.scores) {
          setErrorMsg('성격 진단 완료 데이터를 찾을 수 없습니다.');
        } else {
          setMe(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('데이터를 조회하는 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-amber-900 font-black">보고서 작성 중...</p>
      </div>
    );
  }

  if (errorMsg || !me || !me.scores) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="cozy-card bg-[#fffdfa] border-4 border-rose-300 p-6 rounded-2xl max-w-sm">
          <p className="text-rose-750 font-black mb-4">{errorMsg || '진단을 먼저 진행해주세요.'}</p>
          <button
            onClick={() => router.push('/')}
            className="pixel-btn text-xs py-2 bg-stone-100"
          >
            메인 화면으로
          </button>
        </div>
      </div>
    );
  }

  const scores = me.scores;
  const characterProfile = me.character_key ? CHARACTER_PROFILES[me.character_key] : null;

  const factorsList = [
    { key: 'O', ...BIG5_REPORT_TEXTS.factors.O },
    { key: 'C', ...BIG5_REPORT_TEXTS.factors.C },
    { key: 'E', ...BIG5_REPORT_TEXTS.factors.E },
    { key: 'A', ...BIG5_REPORT_TEXTS.factors.A },
    { key: 'N', ...BIG5_REPORT_TEXTS.factors.N }
  ] as const;

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-xl mx-auto select-none pt-8 pb-12 relative">
      <div className="text-center mb-6">
        <span className="text-xs bg-rose-100 border border-rose-300 text-rose-800 font-black px-2 py-0.5 rounded">
          성격 진단 종합 리포트
        </span>
        <h1 className="text-3xl font-black text-amber-950 mt-2 tracking-wide">
          {BIG5_REPORT_TEXTS.introTitle}
        </h1>
      </div>

      {/* Intro Background Card */}
      <div className="cozy-card bg-[#fffdfa]/95 p-5 mb-6 border-4 border-[#6b5b52] rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-amber-900 border-b-2 border-amber-200 pb-1.5 uppercase mb-3">
          📖 검사 학술 배경 및 철학
        </h3>
        <p className="text-xs text-stone-600 font-bold leading-relaxed whitespace-pre-line">
          {BIG5_REPORT_TEXTS.introDescription}
        </p>
      </div>

      {/* Scores Chart Card */}
      <div className="cozy-card bg-[#fffdfa]/95 p-5 mb-6 border-4 border-[#6b5b52] rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-amber-900 border-b-2 border-amber-200 pb-1.5 uppercase mb-3">
          📊 나의 5대 요약 지표 (100점 만점)
        </h3>
        <p className="text-[10px] text-stone-500 font-bold mb-4">
          * 서울대학교 행복연구센터 2025년 한국인 표준 평균값과 비교한 지표입니다.
        </p>

        <div className="space-y-6">
          {factorsList.map((factor) => {
            const rawScore = scores[factor.key as keyof typeof scores] || 3;
            const score100 = convertTo100PointScale(rawScore);
            const diff = getDifferenceFromAverage(score100, factor.avgValue);

            return (
              <div key={factor.key} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-[#3e2f27] text-sm">{factor.title}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-900">나: {score100}점</span>
                    <span className="text-stone-400">/</span>
                    <span className="text-stone-500">평균: {factor.avgValue}점</span>
                  </div>
                </div>

                {/* Gauge Bar */}
                <div className="relative w-full h-8 bg-stone-100 border-4 border-[#6b5b52] rounded-full flex items-center p-[2px] overflow-hidden">
                  {/* User Score Fill */}
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-rose-200"
                    style={{ width: `${score100}%` }}
                  ></div>

                  {/* Average Marker Line */}
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-stone-500/80"
                    style={{ left: `${factor.avgValue}%` }}
                    title={`한국인 평균: ${factor.avgValue}점`}
                  >
                    <span className="absolute bottom-[-16px] left-[-14px] text-[8px] font-black text-stone-500 bg-white px-1 border border-stone-300 rounded">
                      평균
                    </span>
                  </div>
                </div>

                {/* Comparison description */}
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-500 pt-0.5">
                  <span>최소 0점</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                    diff > 0 
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' 
                      : diff < 0 
                      ? 'bg-rose-50 border border-rose-300 text-rose-800' 
                      : 'bg-stone-50 border border-stone-300 text-stone-600'
                  }`}>
                    평균보다 {Math.abs(diff)}점 {diff > 0 ? '높음 📈' : diff < 0 ? '낮음 📉' : '동일 🤝'}
                  </span>
                  <span>최대 100점</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factor Descriptions Detail */}
      <div className="cozy-card bg-[#fffdfa]/95 p-5 mb-6 border-4 border-[#6b5b52] rounded-2xl space-y-5 shadow-sm">
        <h3 className="text-sm font-black text-amber-900 border-b-2 border-amber-200 pb-1.5 uppercase">
          🔍 요소별 상세 성향 진단
        </h3>

        {factorsList.map((factor) => {
          const rawScore = scores[factor.key as keyof typeof scores] || 3;
          const score100 = convertTo100PointScale(rawScore);
          const isHigh = score100 >= factor.avgValue;

          return (
            <div key={factor.key} className="space-y-1.5 border-b border-stone-200/60 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-stone-850">
                  {factor.title}
                </h4>
                <span className={`text-[9px] font-black px-1.5 py-0.5 border rounded ${
                  isHigh 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                    : 'bg-amber-100 border-amber-300 text-amber-800'
                }`}>
                  {isHigh ? '상대적 높음' : '상대적 낮음'}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-extrabold">
                {factor.coreDesc}
              </p>
              <p className="text-xs text-stone-650 font-bold leading-relaxed">
                {isHigh ? factor.highDesc : factor.lowDesc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Connecting Character Card */}
      {characterProfile && (
        <div className="cozy-card-pink p-5 mb-6 relative">
          <h3 className="text-sm font-black text-[#613e47] border-b-2 border-rose-200 pb-1.5 uppercase mb-4 text-center">
            🏆 종합 매칭 결과
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="w-24 h-24 bg-white/60 border-2 border-rose-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              <CharacterImage
                characterKey={characterProfile.key}
                fallbackEmoji={characterProfile.emoji}
                alt={characterProfile.name}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <p className="text-xs text-stone-500 font-extrabold">
                이 5가지 점수의 조합이 닮아있는 당신의 캐릭터는
              </p>
              <h4 className="text-xl font-black text-[#613e47]">
                &quot;{characterProfile.name}&quot; ({characterProfile.title})
              </h4>
              <p className="text-[10px] text-rose-800 font-bold">
                * 성향의 핵심 장점: {characterProfile.strengths.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Go to Lobby CTA */}
      <div className="pt-2">
        <button
          onClick={() => {
            playSuccessSound();
            router.push('/lobby');
          }}
          className="w-full pixel-btn pixel-btn-purple text-lg animate-pulse"
        >
          대기실로 입장하기 ➡️
        </button>
      </div>
    </div>
  );
}
