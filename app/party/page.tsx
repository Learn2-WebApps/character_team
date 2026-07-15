'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getParticipantById, subscribeToParticipants, Participant } from '../../lib/db';
import { ROLES, CHARACTER_PROFILES, STAT_METADATA } from '../../lib/constants';
import { playSlotTickSound, playSuccessSound, playClickSound } from '../../lib/audio';
import CharacterImage from '../../components/CharacterImage';

export default function PartyPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [teamNumber, setTeamNumber] = useState<number | null>(null);

  const [me, setMe] = useState<Participant | null>(null);
  const [teamMembers, setTeamMembers] = useState<Participant[]>([]);
  const [isRolling, setIsRolling] = useState(true);
  const [displayedRoleKey, setDisplayedRoleKey] = useState('leader');
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  // Modal State for teammate detail character cards
  const [selectedDetailMember, setSelectedDetailMember] = useState<{
    name: string;
    characterKey: string;
    characterName: string;
    emoji: string;
    isMe: boolean;
    scores: { O: number; C: number; E: number; A: number; N: number } | null;
  } | null>(null);

  // 1. Initial configuration load
  useEffect(() => {
    const pid = sessionStorage.getItem('team_party_participant_id');
    const sid = sessionStorage.getItem('team_party_session_id');
    const team = sessionStorage.getItem('team_party_team_number');

    if (!pid || !sid || !team) {
      router.push('/');
      return;
    }

    setParticipantId(pid);
    setSessionId(sid);
    setTeamNumber(parseInt(team));

    // 이미 한번 슬롯머신이 노출되었다면 애니메이션 롤링을 스킵
    if (sessionStorage.getItem('team_party_role_revealed_' + pid) === 'true') {
      setIsRolling(false);
    }
  }, [router]);

  // 2. Database Real-time subscription to get team member roles
  useEffect(() => {
    if (!sessionId || !teamNumber || !participantId) return;

    const unsubscribe = subscribeToParticipants(sessionId, (allParticipants) => {
      const myTeam = allParticipants.filter(p => p.team_number === teamNumber);
      setTeamMembers(myTeam);

      const myRecord = myTeam.find(p => p.id === participantId);
      if (myRecord) {
        setMe(myRecord);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, teamNumber, participantId]);

  // 3. Start role slot machine once my role is loaded from database
  useEffect(() => {
    if (me && me.assigned_role && isRolling) {
      startRoleSlotMachine(me.assigned_role);
    }
  }, [me, isRolling]);

  // 슬롯머신이 돌지 않을 때 (또는 이미 완료되었을 때) 노출할 역할을 DB의 배정된 역할로 동기화
  useEffect(() => {
    if (me && me.assigned_role && !isRolling) {
      setDisplayedRoleKey(me.assigned_role);
    }
  }, [me, isRolling]);

  const startRoleSlotMachine = (targetRoleKey: string) => {
    const keys = Object.keys(ROLES).filter(k => k !== 'housekeeper');
    if (targetRoleKey === 'housekeeper' && !keys.includes('housekeeper')) {
      keys.push('housekeeper');
    }
    
    let step = 0;
    const totalSteps = 25;

    const tick = () => {
      if (step >= totalSteps) {
        setDisplayedRoleKey(targetRoleKey);
        setIsRolling(false);
        if (typeof window !== 'undefined') {
          const pid = sessionStorage.getItem('team_party_participant_id');
          if (pid) {
            sessionStorage.setItem('team_party_role_revealed_' + pid, 'true');
          }
        }
        playSuccessSound();
        return;
      }

      setDisplayedRoleKey(keys[step % keys.length]);
      playSlotTickSound();

      step++;

      let delay = 60;
      if (step > 20) delay = 450;
      else if (step > 16) delay = 260;
      else if (step > 10) delay = 140;
      else if (step > 5) delay = 90;

      setTimeout(tick, delay);
    };

    tick();
  };

  const handleOpenDetailModal = (member: Participant) => {
    if (!member.character_key) return;
    const profile = CHARACTER_PROFILES[member.character_key];
    if (!profile) return;

    playClickSound();
    setSelectedDetailMember({
      name: member.name,
      characterKey: member.character_key,
      characterName: profile.name,
      emoji: profile.emoji,
      isMe: member.id === participantId,
      scores: member.scores
    });
  };

  const renderModalStarBar = (score: number) => {
    const rounded = Math.round(score * 2) / 2; // Round to nearest 0.5
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      let fill = '#e2e8f0'; // Empty star fill
      if (i <= Math.floor(rounded)) {
        fill = '#f59e0b'; // Full star fill
      } else if (i === Math.ceil(rounded) && rounded % 1 !== 0) {
        fill = 'url(#half-star-grad-party-modal-v2)'; // Half star gradient fill
      }
      
      stars.push(
        <svg key={i} className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="half-star-grad-party-modal-v2">
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
      <div className="flex gap-[2px]">
        {stars}
      </div>
    );
  };

  if (errorMsg) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div className="cozy-card bg-[#fffdfa] border-4 border-rose-300 p-6 rounded-2xl">
          <p className="text-rose-750 font-black">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const sortedTeamMembers = [...teamMembers].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  if (!me || (me.assigned_role && isRolling)) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow min-h-screen">
        <h2 className="text-xl text-rose-900 font-black text-center mb-6 tracking-wider animate-pulse">
          파티 역할을 배정받는 중...
        </h2>
        {me && me.assigned_role && (
          <div className="cozy-card-pink w-full py-16 px-6 text-center pulse-glow-purple max-w-sm">
            <div className="text-8xl mb-6 animate-bounce">
              🎲
            </div>
            <div className="inline-block px-5 py-2.5 border-4 border-dashed border-rose-300 bg-white/90 text-xl font-black text-rose-800 rounded-xl tracking-wider animate-pulse">
              {ROLES[displayedRoleKey]?.name || '역할 슬롯'}
            </div>
            <p className="text-xs text-rose-500 font-black mt-5 tracking-widest">
              ✨ 역할 슬롯머신 가동 중 ✨
            </p>
          </div>
        )}
      </div>
    );
  }

  const myRole = ROLES[me.assigned_role || 'leader'] || ROLES.leader;

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-lg mx-auto select-none pt-8 pb-12">
      {/* Character Profile Modal */}
      {selectedDetailMember && (() => {
        const profile = CHARACTER_PROFILES[selectedDetailMember.characterKey];
        return (
          <div className="fixed inset-0 bg-[#3e2f27]/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="cozy-card-pink w-full max-w-md bg-[#fffdfa] p-6 relative max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={() => setSelectedDetailMember(null)}
                className="absolute top-3 right-3 text-2xl font-black text-stone-500 hover:text-stone-850 cursor-pointer"
              >
                ✕
              </button>

              {/* Header: Image & Name */}
              <div className="flex items-center gap-3 border-b-4 border-dashed border-rose-200 pb-3 mb-4 mt-2">
                <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-rose-50 border-2 border-rose-300 rounded-xl overflow-hidden">
                  <CharacterImage
                    characterKey={selectedDetailMember.characterKey}
                    fallbackEmoji={selectedDetailMember.emoji}
                    alt={selectedDetailMember.characterName}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] bg-rose-100 border border-rose-300 text-rose-800 font-black px-1.5 py-0.5 rounded">
                      {selectedDetailMember.isMe ? '나 (ME)' : '조원 카드'}
                    </span>
                    <span className="text-xs text-stone-500 font-extrabold">
                      {selectedDetailMember.name}님의 성향
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-rose-950 mt-0.5">
                    {selectedDetailMember.characterName}
                  </h2>
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-2 mb-4">
                <h3 className="text-xs font-black text-amber-800">
                  &quot;{profile.title}&quot;
                </h3>
                <p className="text-xs text-stone-600 font-bold leading-normal">
                  {profile.desc}
                </p>
              </div>

              {/* Split Layout: Image on Left, Stats on Right (stacked on mobile) */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch mb-4">
                {/* Left Side: Large Character Image */}
                <div className="w-full sm:w-2/5 flex flex-col items-center justify-center bg-[#fcfaf2]/40 border-2 border-rose-100 rounded-xl p-3 shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center overflow-hidden">
                    <CharacterImage
                      characterKey={selectedDetailMember.characterKey}
                      fallbackEmoji={selectedDetailMember.emoji}
                      alt={selectedDetailMember.characterName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Right Side: Stats dot bars */}
                <div className="w-full sm:w-3/5 bg-[#fcfaf2]/60 p-3 border-2 border-rose-100 rounded-xl flex flex-col justify-center space-y-2">
                  <h4 className="text-xs font-black text-rose-800 border-b border-rose-200 pb-1 uppercase tracking-wider mb-1">
                    📊 성향 별점 스탯
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-650 font-extrabold w-20 shrink-0">{STAT_METADATA.O.name}</span>
                      {renderModalStarBar(profile.scores.O)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-650 font-extrabold w-20 shrink-0">{STAT_METADATA.C.name}</span>
                      {renderModalStarBar(profile.scores.C)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-650 font-extrabold w-20 shrink-0">{STAT_METADATA.E.name}</span>
                      {renderModalStarBar(profile.scores.E)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-650 font-extrabold w-20 shrink-0">{STAT_METADATA.A.name}</span>
                      {renderModalStarBar(profile.scores.A)}
                    </div>
                    <div className="flex items-center gap-2 justify-between text-xs">
                      <span className="text-stone-650 font-extrabold w-20 shrink-0">{STAT_METADATA.N.name}</span>
                      {renderModalStarBar(profile.scores.N)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 gap-2.5 mb-4">
                <div className="bg-emerald-50/60 p-2.5 border border-emerald-200 rounded-xl">
                  <h5 className="text-xs font-black text-emerald-800 mb-1 uppercase">💪 강점</h5>
                  <ul className="text-sm text-stone-700 font-bold space-y-0.5 list-disc pl-3.5">
                    {profile.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                  </ul>
                </div>
                <div className="bg-rose-50/60 p-2.5 border border-rose-200 rounded-xl">
                  <h5 className="text-xs font-black text-rose-800 mb-1 uppercase">⚠️ 주의할 점</h5>
                  <ul className="text-sm text-stone-700 font-bold space-y-0.5 list-disc pl-3.5">
                    {profile.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
                  </ul>
                </div>
              </div>

              {/* Chemistry */}
              <div className="bg-stone-50/80 p-2.5 border border-stone-200/50 rounded-xl mb-4">
                <h5 className="text-xs font-black text-stone-500 mb-1.5 uppercase">🤝 환상의 조합</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-stone-400 font-extrabold">BEST:</span>{' '}
                    <span className="font-black text-emerald-600">
                      {CHARACTER_PROFILES[profile.chemistry.best]?.emoji} {CHARACTER_PROFILES[profile.chemistry.best]?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 font-extrabold">WORST:</span>{' '}
                    <span className="font-black text-rose-600">
                      {CHARACTER_PROFILES[profile.chemistry.worst]?.emoji} {CHARACTER_PROFILES[profile.chemistry.worst]?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50/60 p-2.5 border border-amber-200 rounded-xl mb-4">
                <h5 className="text-xs font-black text-amber-800 mb-1 uppercase">👑 팀빌딩 추천 역할</h5>
                <p className="text-sm text-stone-700 font-bold leading-normal">
                  {profile.roleTips}
                </p>
              </div>

              {/* Close CTA */}
              <button
                onClick={() => setSelectedDetailMember(null)}
                className="w-full pixel-btn text-xs py-2 bg-stone-100 hover:bg-stone-200"
              >
                창 닫기 ✕
              </button>
            </div>
          </div>
        );
      })()}

      {/* Header Info */}
      <div className="text-center mb-6">
        <h1 className="text-sm font-black text-rose-800 tracking-widest uppercase mb-1">
          ✨ 파티 구성 완료 ✨
        </h1>
        <h2 className="text-3xl font-black text-amber-900 tracking-wide">
          ⚔️ {teamNumber}조 파티 편성 결과
        </h2>
      </div>

      {/* Main Assigned Role Details Card */}
      <div className="cozy-card-pink p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 border-b-4 border-dashed border-rose-200 pb-4 mb-4">
          <div className="text-6xl p-2 bg-rose-50 border-2 border-rose-300 rounded-2xl">
            {myRole.emoji}
          </div>
          <div>
            <span className="text-[10px] bg-rose-100 border border-rose-300 text-rose-800 font-black px-2 py-0.5 rounded-md">
              나의 모험 역할
            </span>
            <h3 className="text-2xl font-black text-rose-950 mt-1.5 tracking-wide">
              {myRole.name}
            </h3>
          </div>
        </div>

        {/* Role Desc */}
        <div className="space-y-3 mb-5">
          <h4 className="text-sm font-bold text-amber-800 leading-normal">
            &quot;{myRole.desc}&quot;
          </h4>
        </div>

        {/* Responsibilities list */}
        <div className="bg-amber-50/40 p-4 border-2 border-rose-200/50 rounded-2xl space-y-2.5">
          <h4 className="text-xs font-black text-rose-800 border-b border-rose-200 pb-1.5 uppercase tracking-wider">
            📋 내가 조에서 담당할 활동
          </h4>
          <ul className="text-sm text-stone-700 font-bold space-y-2 list-none">
            {myRole.responsibilities.map((resp, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="text-rose-500 font-black">✨</span>
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Teammates List - Party List */}
      <div className="cozy-card bg-[#fffdfa]/95 p-5 border-4 border-amber-900/60 rounded-2xl mb-6">
        <h3 className="text-sm font-black text-amber-900 border-b-2 border-amber-200 pb-1.5 uppercase tracking-widest text-center">
          🛡️ 조원 전체 역할 분담 리스트 🛡️
        </h3>
        <p className="text-[10px] text-stone-500 font-bold text-center mb-3.5">
          💡 조원 항목을 클릭하면 상세 성향 리포트를 볼 수 있습니다.
        </p>

        <div className="space-y-3">
          {sortedTeamMembers.map((member) => {
            const charProfile = member.character_key ? CHARACTER_PROFILES[member.character_key] : null;
            const memberRole = member.assigned_role ? ROLES[member.assigned_role] : null;
            const isMe = member.id === me.id;

            return (
              <div
                key={member.id}
                onClick={() => handleOpenDetailModal(member)}
                className={`p-3 border-2 flex items-center justify-between text-sm rounded-xl transition-all cursor-pointer hover:scale-[1.015] active:scale-[0.98] ${
                  isMe
                    ? 'border-rose-300 bg-rose-50/40 shadow-none'
                    : 'border-stone-200 bg-stone-50/40 hover:bg-[#fffdfa]'
                }`}
              >
                {/* Member Identity & Character */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-stone-50 border border-stone-200 rounded-lg overflow-hidden" title={charProfile ? charProfile.name : ''}>
                    <CharacterImage
                      characterKey={charProfile?.key}
                      fallbackEmoji={charProfile?.emoji || '❓'}
                      alt={charProfile?.name}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-stone-850">{member.name}</span>
                      {isMe && <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 font-extrabold border border-rose-300 rounded-md">나</span>}
                    </div>
                    <span className="text-xs text-stone-500 font-bold">
                      {charProfile ? charProfile.name : '진단 중'}
                    </span>
                  </div>
                </div>

                {/* Assigned Role */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 rounded-xl">
                  {memberRole ? (
                    <>
                      <span className="text-sm">{memberRole.emoji}</span>
                      <span className="font-extrabold text-stone-700 text-xs">
                        {memberRole.name}
                      </span>
                    </>
                  ) : member.assigned_role === 'supporter' ? (
                    <>
                      <span className="text-sm">🍉</span>
                      <span className="font-extrabold text-stone-700 text-xs">
                        서포터
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-stone-400 font-bold">배정 중...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        <button
          onClick={() => {
            playClickSound();
            router.push('/lobby');
          }}
          className="w-full pixel-btn pixel-btn-purple text-lg"
        >
          대기실로 돌아가기 🏕️
        </button>
      </div>
    </div>
  );
}
