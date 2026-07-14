'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getParticipantById, subscribeToParticipants, updateParticipant, Participant } from '../../lib/db';
import { assignRoles } from '../../lib/roleAssignment';
import { CHARACTER_PROFILES, ROLES, STAT_METADATA } from '../../lib/constants';
import { playClickSound, playCountdownTone, playSuccessSound } from '../../lib/audio';

export default function LobbyPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [teamNumber, setTeamNumber] = useState<number | null>(null);
  
  const [me, setMe] = useState<Participant | null>(null);
  const [teamMembers, setTeamMembers] = useState<Participant[]>([]);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State for teammate detail character cards
  const [selectedDetailMember, setSelectedDetailMember] = useState<{
    name: string;
    characterKey: string;
    characterName: string;
    emoji: string;
    isMe: boolean;
    scores: { O: number; C: number; E: number; A: number; N: number } | null;
  } | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  }, [router]);

  // 2. Database Real-time subscription
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

  // Check if roles have already been assigned to the team
  const isTeamRoleAssigned = teamMembers.length >= 3 && teamMembers.some(p => p.assigned_role !== null);

  // 3. Monitor ready states and trigger countdown
  const allReady = teamMembers.length >= 3 && teamMembers.every(p => p.is_ready);

  useEffect(() => {
    if (isTeamRoleAssigned) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setCountdown(null);
      return;
    }

    if (allReady) {
      if (countdown === null && !isAssigning) {
        setCountdown(3);
        playCountdownTone(false);
      }
    } else {
      if (countdown !== null) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setCountdown(null);
      }
    }
  }, [allReady, countdown, isAssigning, isTeamRoleAssigned]);

  // 4. Countdown timer ticker
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        const nextCount = countdown - 1;
        setCountdown(nextCount);
        if (nextCount > 0) {
          playCountdownTone(false);
        } else {
          playCountdownTone(true);
        }
      }, 1000);
    } else if (countdown === 0) {
      handleCountdownComplete();
    }

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown]);

  // 5. Lobby page auto transition to party reveal
  useEffect(() => {
    if (me && me.assigned_role && countdown === 0) {
      router.push('/party');
    }
  }, [me, countdown, router]);

  const handleCountdownComplete = async () => {
    if (!me || teamMembers.length < 3) return;
    setIsAssigning(true);

    const sortedMembers = [...teamMembers].sort((a, b) => a.id.localeCompare(b.id));
    const isInitiator = sortedMembers[0].id === me.id;

    if (isInitiator) {
      console.log("I am the coordinator. Assigning roles for the team...");
      try {
        const formattedMembers = teamMembers.map(m => ({
          id: m.id,
          name: m.name,
          character_ranks: m.character_ranks || []
        }));

        const roleMapping = assignRoles(formattedMembers);

        for (const member of teamMembers) {
          await updateParticipant(member.id, {
            assigned_role: roleMapping[member.id]
          });
        }
      } catch (err) {
        console.error("Error during role assignment coordinator run:", err);
        setErrorMsg('역할 매칭 중 오류가 발생했습니다. 강제 진행합니다.');
      }
    }

    setTimeout(() => {
      router.push('/party');
    }, 400);
  };

  const handleToggleReady = async () => {
    if (!me) return;
    playClickSound();
    
    try {
      await updateParticipant(me.id, {
        is_ready: !me.is_ready
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('상태 변경에 실패했습니다.');
    }
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
        fill = 'url(#half-star-grad-lobby-modal-v2)'; // Half star gradient fill
      }
      
      stars.push(
        <svg key={i} className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="half-star-grad-lobby-modal-v2">
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

  const totalMembers = teamMembers.length;
  const readyMembersCount = teamMembers.filter(p => p.is_ready).length;
  const readyPercent = totalMembers > 0 ? (readyMembersCount / totalMembers) * 100 : 0;

  if (!me) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-amber-900 font-black">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-lg mx-auto select-none pt-8 pb-12 relative">
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

              {/* Header: Emoji & Name */}
              <div className="flex items-center gap-3.5 border-b-4 border-dashed border-rose-200 pb-3 mb-4 mt-2">
                <div className="text-5xl p-2 bg-rose-50 border-2 border-rose-300 rounded-xl">
                  {selectedDetailMember.emoji}
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
                  <h2 className="text-2xl font-black text-rose-950 mt-1">
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

              {/* Stats dot bars */}
              <div className="bg-[#fcfaf2]/60 p-3 border-2 border-rose-100 rounded-xl space-y-2 mb-4">
                <h4 className="text-xs font-black text-rose-800 border-b border-rose-200 pb-1.5 uppercase tracking-wider">
                  📊 성향 별점 스탯
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex items-center gap-2 justify-start text-xs">
                    <span className="text-stone-650 font-extrabold w-36 shrink-0">{STAT_METADATA.O.name}</span>
                    {renderModalStarBar(profile.scores.O)}
                  </div>
                  <div className="flex items-center gap-2 justify-start text-xs">
                    <span className="text-stone-650 font-extrabold w-36 shrink-0">{STAT_METADATA.C.name}</span>
                    {renderModalStarBar(profile.scores.C)}
                  </div>
                  <div className="flex items-center gap-2 justify-start text-xs">
                    <span className="text-stone-650 font-extrabold w-36 shrink-0">{STAT_METADATA.E.name}</span>
                    {renderModalStarBar(profile.scores.E)}
                  </div>
                  <div className="flex items-center gap-2 justify-start text-xs">
                    <span className="text-stone-650 font-extrabold w-36 shrink-0">{STAT_METADATA.A.name}</span>
                    {renderModalStarBar(profile.scores.A)}
                  </div>
                  <div className="flex items-center gap-2 justify-start text-xs">
                    <span className="text-stone-650 font-extrabold w-36 shrink-0">{STAT_METADATA.N.name}</span>
                    {renderModalStarBar(profile.scores.N)}
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

      {/* 3-2-1 Cozy Countdown Overlay (Only when in waiting state) */}
      {countdown !== null && !isTeamRoleAssigned && (
        <div className="fixed inset-0 bg-amber-50/95 z-50 flex flex-col items-center justify-center animate-fade-in">
          <div className="text-center space-y-4">
            <span className="text-4xl animate-bounce inline-block">🎈</span>
            <h3 className="text-amber-900 text-base font-black tracking-widest uppercase">
              모든 파티원 준비 완료!
            </h3>
            <p className="text-sm text-stone-600 font-bold">곧 역할 공개 페이지로 이동합니다.</p>
            <div className="text-9xl font-black text-rose-400 drop-shadow-[0_4px_0_#fbcfe8] animate-ping">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="text-[10px] text-stone-400 font-extrabold tracking-widest mt-6">
              ✨ 역할 슬롯머신 로딩 중 ✨
            </p>
          </div>
        </div>
      )}

      {isTeamRoleAssigned ? (
        /* --- Case A: Role Assignment Complete Result Screen --- */
        <div className="space-y-6 flex-grow flex flex-col justify-center">
          <div className="text-center">
            <span className="text-5xl animate-pulse inline-block">🎉</span>
            <h1 className="text-3xl font-black text-[#3e2f27] mt-3 tracking-wide">
              우리 조 역할 배정 완료!
            </h1>
            <p className="text-sm text-stone-600 font-bold mt-1.5">
              조원들이 모험에서 담당할 역할이 결정되었습니다.
            </p>
          </div>

          <div className="cozy-card bg-[#fffdfa]/95 p-5 border-4 border-amber-900/60 rounded-2xl shadow-sm">
            <h3 className="text-sm font-black text-amber-900 border-b-2 border-amber-200 pb-1.5 uppercase tracking-widest text-center">
              🛡️ {teamNumber}조 역할 분담 결과표 🛡️
            </h3>
            <p className="text-[10px] text-stone-500 font-bold text-center mb-3">
              💡 조원 항목을 클릭하면 상세 성향 리포트를 볼 수 있습니다.
            </p>

            <div className="space-y-3">
              {teamMembers.map((member) => {
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
                      <span className="text-xl" title={charProfile ? charProfile.name : ''}>
                        {charProfile ? charProfile.emoji : '❓'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-stone-850">{member.name}</span>
                          {isMe && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 font-extrabold border border-rose-300 rounded-md">
                              나
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-500 font-bold">
                          {charProfile ? charProfile.name : '진단 중'}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Role Badge */}
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

          <div className="pt-4">
            <button
              onClick={() => {
                playClickSound();
                router.push('/party');
              }}
              className="w-full pixel-btn pixel-btn-purple text-lg"
            >
              내 상세 역할 카드 보기 👑
            </button>
          </div>
        </div>
      ) : (
        /* --- Case B: Standard Lobby Waiting Screen --- */
        <>
          {/* Lobby Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-amber-900 tracking-wide">
              🏕️ {teamNumber}조 파티 대기실
            </h1>
            <p className="text-sm text-stone-500 font-bold mt-1.5">
              모든 조원이 준비를 완료하면 역할 배정이 시작됩니다!
            </p>
          </div>

          {/* Progress Bar (N/M Ready) */}
          <div className="cozy-card bg-[#fffdfa]/95 p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-black text-amber-950">준비 인원</span>
              <span className="text-sm font-black text-amber-800">
                {readyMembersCount} / {totalMembers} Ready
              </span>
            </div>
            
            {/* Cozy Progress Bar */}
            <div className="w-full bg-[#f5efe6] h-6 border-4 border-[#6b5b52] rounded-full relative overflow-hidden flex p-[2px]">
              <div
                className="bg-[#bae6fd] h-full rounded-full transition-all duration-300"
                style={{ width: `${readyPercent}%` }}
              ></div>
            </div>
            
            {totalMembers < 3 && (
              <p className="text-[10px] text-rose-700 font-extrabold text-center mt-3">
                ⚠️ 최소 3명의 파티원이 입장해야 배정이 가능합니다. (현재: {totalMembers}명)
              </p>
            )}
          </div>

          {/* Team Members List */}
          <div className="space-y-4 flex-grow">
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-1.5">
              합류한 모험가 목록
            </h3>

            {teamMembers.length === 0 ? (
              <div className="cozy-card bg-white p-6 text-center text-sm text-stone-400 border-2 border-dashed border-stone-300 rounded-2xl">
                조원이 아직 보이지 않습니다.
              </div>
            ) : (
              teamMembers.map((member) => {
                const charProfile = member.character_key ? CHARACTER_PROFILES[member.character_key] : null;
                const isMe = member.id === me.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => handleOpenDetailModal(member)}
                    className={`cozy-card p-4 flex items-center justify-between transition-all rounded-2xl cursor-pointer hover:scale-[1.015] active:scale-[0.98] ${
                      isMe ? 'border-rose-300 bg-rose-50/40 shadow-none' : 'bg-[#fffdfa]/95'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-4xl p-1 bg-amber-50 border-2 border-amber-200 rounded-xl">
                        {charProfile ? charProfile.emoji : '❓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-base font-black text-stone-850">
                            {member.name}
                          </span>
                          {isMe && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 font-extrabold border border-rose-300 rounded-md">
                              나
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 font-extrabold mt-0.5">
                          {member.affiliation} | {charProfile ? charProfile.name : '진단 중...'}
                        </p>
                      </div>
                    </div>

                    {/* Ready Status Badge */}
                    <div>
                      {member.is_ready ? (
                        <span className="text-xs bg-emerald-50 border-2 border-emerald-300 text-emerald-800 px-3 py-1 font-black rounded-xl shadow-sm">
                          READY 👍
                        </span>
                      ) : (
                        <span className="text-xs bg-stone-50 border border-stone-300 text-stone-400 px-2.5 py-1 font-bold rounded-xl">
                          준비 중...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {errorMsg && (
            <div className="my-4 p-3 border-2 border-rose-300 bg-rose-50 text-rose-800 text-sm text-center font-bold rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Ready Button */}
          <div className="pt-6">
            <button
              onClick={handleToggleReady}
              className={`w-full pixel-btn text-lg ${me.is_ready ? 'pixel-btn-purple' : ''}`}
              disabled={isAssigning}
            >
              {me.is_ready ? '준비 해제하기 ✋' : '준비 완료 (READY) 👍'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
