'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CHARACTER_PROFILES, STAT_METADATA } from '../../lib/constants';
import { getParticipantById } from '../../lib/db';
import { playSlotTickSound, playSuccessSound } from '../../lib/audio';

export default function ResultPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<any>(null);
  const [isRolling, setIsRolling] = useState(true);
  const [displayedKey, setDisplayedKey] = useState('navigator');
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  // Load participant data
  useEffect(() => {
    const pid = sessionStorage.getItem('team_party_participant_id');
    if (!pid) {
      router.push('/');
      return;
    }

    async function loadData() {
      try {
        const p = await getParticipantById(pid!);
        if (!p || !p.character_key) {
          setErrorMsg('성향 진단 결과가 존재하지 않습니다.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        setParticipant(p);
        startSlotMachine(p.character_key);
      } catch (err) {
        console.error(err);
        setErrorMsg('결과 데이터를 불러오는 데 실패했습니다.');
      }
    }
    loadData();
  }, [router]);

  const startSlotMachine = (targetKey: string) => {
    const keys = Object.keys(CHARACTER_PROFILES);
    let step = 0;
    const totalSteps = 28;

    const tick = () => {
      if (step >= totalSteps) {
        setDisplayedKey(targetKey);
        setIsRolling(false);
        playSuccessSound();
        return;
      }

      setDisplayedKey(keys[step % keys.length]);
      playSlotTickSound();

      step++;
      
      let delay = 60;
      if (step > 24) delay = 450;
      else if (step > 20) delay = 280;
      else if (step > 15) delay = 160;
      else if (step > 8) delay = 100;

      setTimeout(tick, delay);
    };

    tick();
  };

  const renderStarBar = (score: number) => {
    const rounded = Math.round(score * 2) / 2; // Round to nearest 0.5
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      let fill = '#e2e8f0'; // Empty star fill
      if (i <= Math.floor(rounded)) {
        fill = '#f59e0b'; // Full star fill
      } else if (i === Math.ceil(rounded) && rounded % 1 !== 0) {
        fill = 'url(#half-star-grad-result-v2)'; // Half star gradient fill
      }
      
      stars.push(
        <svg key={i} className="w-5 h-5 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="half-star-grad-result-v2">
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <path
            d="M12 1.5l3.09 6.3 6.91.95-5 4.86 1.18 6.88L12 17.25l-6.18 3.25L7 13.61 2 8.75l6.91-.95L12 1.5z"
            fill={fill}
            stroke="#6b5b52"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    
    return (
      <div className="flex gap-[3px]" title={`스탯 수치: ${score.toFixed(1)}/5.0`}>
        {stars}
      </div>
    );
  };

  if (errorMsg) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div className="cozy-card bg-[#fffdfa] border-4 border-rose-300 p-6">
          <p className="text-rose-700 font-black">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-amber-900 font-black">진단 결과 분석 중...</p>
      </div>
    );
  }

  const currentProfile = CHARACTER_PROFILES[displayedKey];

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto select-none pt-8 pb-12">
      {/* Slot Machine Phase */}
      {isRolling ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <h2 className="text-xl text-amber-900 font-black text-center mb-6 tracking-wider">
            당신의 성향 카드 소환 중...
          </h2>
          
          <div className="cozy-card-pink w-full py-16 px-6 text-center pulse-glow-purple max-w-sm">
            <div className="w-32 h-32 mb-6 mx-auto flex items-center justify-center animate-bounce">
              {!imgError[currentProfile.key] ? (
                <img
                  src={`/characters/${currentProfile.key}.png`}
                  alt={currentProfile.name}
                  onError={() => {
                    setImgError(prev => ({ ...prev, [currentProfile.key]: true }));
                  }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-8xl">{currentProfile.emoji}</div>
              )}
            </div>
            <div className="inline-block px-5 py-2.5 border-4 border-dashed border-rose-300 bg-white/90 text-2xl font-black text-rose-800 rounded-2xl tracking-wider">
              {currentProfile.name}
            </div>
            <p className="text-xs text-rose-500 font-black mt-5 tracking-widest animate-pulse">
              ✨ 성향 카드 매칭 중 ✨
            </p>
          </div>
        </div>
      ) : (
        /* Result Revealed Phase */
        <div className="space-y-5">
          <div className="text-center">
            <h1 className="text-sm font-black text-amber-900 tracking-widest uppercase mb-1">
              ✨ 성향 진단 완료 ✨
            </h1>
            <p className="text-base font-bold text-stone-600">
              {participant.name}님의 성향 카드가 소환되었습니다!
            </p>
          </div>

          {/* Core Stat Card */}
          <div className="cozy-card-pink bg-[#fffdfa]/95 p-6 shadow-sm rounded-2xl relative">
            <span className="absolute top-2 right-2 text-2xl">⭐</span>
            <span className="absolute bottom-2 left-2 text-2xl">☁️</span>

            {/* Header: Emoji & Name */}
            <div className="flex items-center gap-3 border-b-4 border-dashed border-rose-200 pb-3 mb-4">
              <div className="text-3xl p-1.5 bg-rose-50 border-2 border-rose-300 rounded-xl">
                {currentProfile.emoji}
              </div>
              <div>
                <span className="text-[9px] bg-rose-100 border border-rose-300 text-rose-800 font-black px-1.5 py-0.5 rounded">
                  나의 대표 성향
                </span>
                <h2 className="text-2xl font-black text-rose-950 mt-1 tracking-wide">
                  {currentProfile.name}
                </h2>
              </div>
            </div>

            {/* Profile Description */}
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-black text-amber-800">
                &quot;{currentProfile.title}&quot;
              </h3>
              <p className="text-sm font-bold text-stone-700 leading-relaxed">
                {currentProfile.desc}
              </p>
            </div>

            {/* Split Layout: Image on Left, Stats on Right (stacked on mobile) */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch mb-5">
              {/* Left Side: Large Character Image */}
              <div className="w-full sm:w-2/5 flex flex-col items-center justify-center bg-[#fcfaf2]/40 border-2 border-rose-200/40 rounded-2xl p-4 shrink-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center overflow-hidden">
                  {!imgError[currentProfile.key] ? (
                    <img
                      src={`/characters/${currentProfile.key}.png`}
                      alt={currentProfile.name}
                      onError={() => {
                        setImgError(prev => ({ ...prev, [currentProfile.key]: true }));
                      }}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-7xl">{currentProfile.emoji}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-xs font-black text-rose-800 bg-rose-100/60 px-2 py-0.5 rounded-md border border-rose-200/50">
                    {currentProfile.name}
                  </span>
                </div>
              </div>

              {/* Right Side: 5-Axis Dot Stat Bars */}
              <div className="w-full sm:w-3/5 bg-[#fcfaf2]/50 p-4 border-2 border-rose-200/50 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-rose-800 border-b border-rose-200 pb-1.5 uppercase tracking-wider mb-3">
                    📊 성향 별점 스탯
                  </h4>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-700 font-extrabold w-20 shrink-0">{STAT_METADATA.O.name}</span>
                      {currentProfile.scores && renderStarBar(currentProfile.scores.O)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-700 font-extrabold w-20 shrink-0">{STAT_METADATA.C.name}</span>
                      {currentProfile.scores && renderStarBar(currentProfile.scores.C)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-700 font-extrabold w-20 shrink-0">{STAT_METADATA.E.name}</span>
                      {currentProfile.scores && renderStarBar(currentProfile.scores.E)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-700 font-extrabold w-20 shrink-0">{STAT_METADATA.A.name}</span>
                      {currentProfile.scores && renderStarBar(currentProfile.scores.A)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-700 font-extrabold w-20 shrink-0">{STAT_METADATA.N.name}</span>
                      {currentProfile.scores && renderStarBar(currentProfile.scores.N)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="cozy-card-mint p-3 shadow-none border-2">
                <h5 className="text-xs font-black text-emerald-950 mb-2 uppercase">
                  💪 나의 강점
                </h5>
                <ul className="text-sm text-emerald-900 font-bold space-y-1 list-disc pl-3">
                  {currentProfile.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="cozy-card-pink p-3 shadow-none border-2">
                <h5 className="text-xs font-black text-rose-950 mb-2 uppercase">
                  ⚠️ 주의할 점
                </h5>
                <ul className="text-sm text-rose-900 font-bold space-y-1 list-disc pl-3">
                  {currentProfile.weaknesses.map((weak, idx) => (
                    <li key={idx}>{weak}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Chemistry Section */}
            <div className="bg-[#fcfaf2]/60 p-3.5 border-2 border-stone-200/50 rounded-2xl mb-4">
              <h5 className="text-sm font-black text-[#5c4e46] mb-2.5 uppercase">
                🤝 캐릭터 환상의 조합
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-extrabold">BEST:</span>
                  {(() => {
                    const bestKey = currentProfile.chemistry.best;
                    const bestProf = CHARACTER_PROFILES[bestKey];
                    return (
                      <span className="text-sm font-black text-emerald-700">
                        {bestProf.emoji} {bestProf.name}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-extrabold">WORST:</span>
                  {(() => {
                    const worstKey = currentProfile.chemistry.worst;
                    const worstProf = CHARACTER_PROFILES[worstKey];
                    return (
                      <span className="text-sm font-black text-rose-700">
                        {worstProf.emoji} {worstProf.name}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Role tips */}
            <div className="bg-amber-50/70 p-3.5 border-2 border-amber-200/70 rounded-2xl">
              <h5 className="text-sm font-black text-amber-900 mb-1.5 uppercase">
                👑 팀빌딩 추천 역할
              </h5>
              <p className="text-sm text-stone-700 font-bold leading-relaxed">
                {currentProfile.roleTips}
              </p>
            </div>
          </div>

          {/* Lobby Entry Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                playSuccessSound();
                router.push('/report');
              }}
              className="w-full pixel-btn pixel-btn-purple text-lg animate-pulse"
            >
              상세 성격 검사 보고서 보기 📊
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
