'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSession, getSessionByCode, subscribeToParticipants, Participant, deleteSession } from '../../../lib/db';
import { CHARACTER_PROFILES, ROLES } from '../../../lib/constants';
import { playClickSound, playSuccessSound } from '../../../lib/audio';

export default function InstructorDashboard() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState<string | null>(null);
  
  const [sessions, setSessions] = useState<{ id: string; entry_code: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Validate login on load
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('team_party_instructor_logged_in') === 'true';
    const instId = sessionStorage.getItem('team_party_instructor_id');
    
    if (!isLoggedIn) {
      router.push('/instructor/login');
    } else {
      setInstructorId(instId);
      const saved = localStorage.getItem('team_party_instructor_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setSelectedSessionId(parsed[0].id);
        }
      }
    }
  }, [router]);

  // 2. Real-time Subscription to selected session
  useEffect(() => {
    if (!selectedSessionId) {
      setParticipants([]);
      return;
    }

    const unsubscribe = subscribeToParticipants(selectedSessionId, (updatedList) => {
      setParticipants(updatedList);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedSessionId]);

  // Generate a random 4-digit entry code (0000-9999) with collision avoidance
  const handleCreateSession = async () => {
    setLoading(true);
    setErrorMsg('');
    playClickSound();

    try {
      let entryCode = '';
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 100) {
        attempts++;
        const candidateCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        const existing = await getSessionByCode(candidateCode);
        if (!existing) {
          entryCode = candidateCode;
          isUnique = true;
        }
      }

      if (!entryCode) {
        throw new Error('고유 세션 코드 생성에 실패했습니다. 다시 시도해 주세요.');
      }

      const newSession = await createSession(entryCode, instructorId);
      
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('team_party_instructor_sessions', JSON.stringify(updatedSessions));
      
      setSelectedSessionId(newSession.id);
      playSuccessSound();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '세션 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSessionId) return;
    if (!confirm('정말로 이 세션을 삭제하시겠습니까? 세션 내의 모든 참가자 정보도 영구 삭제됩니다.')) {
      return;
    }

    setLoading(true);
    setErrorMsg('');
    playClickSound();

    try {
      await deleteSession(selectedSessionId);
      
      const updatedSessions = sessions.filter(s => s.id !== selectedSessionId);
      setSessions(updatedSessions);
      localStorage.setItem('team_party_instructor_sessions', JSON.stringify(updatedSessions));
      
      if (updatedSessions.length > 0) {
        setSelectedSessionId(updatedSessions[0].id);
      } else {
        setSelectedSessionId('');
      }
      playSuccessSound();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('세션 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    playClickSound();
    sessionStorage.removeItem('team_party_instructor_logged_in');
    sessionStorage.removeItem('team_party_instructor_id');
    router.push('/instructor/login');
  };

  const groupedParticipants: Record<number, Participant[]> = {};
  participants.forEach(p => {
    if (!groupedParticipants[p.team_number]) {
      groupedParticipants[p.team_number] = [];
    }
    groupedParticipants[p.team_number].push(p);
  });

  const sortedTeamNumbers = Object.keys(groupedParticipants)
    .map(Number)
    .sort((a, b) => a - b);

  const totalCount = participants.length;
  const completedCount = participants.filter(p => p.character_key).length;
  const readyCount = participants.filter(p => p.is_ready).length;
  const roleAssignedCount = participants.filter(p => p.assigned_role).length;

  const currentSessionCode = sessions.find(s => s.id === selectedSessionId)?.entry_code || '';

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-5xl mx-auto select-none pt-8 pb-16">
      {/* Dashboard Top Header */}
      <div className="flex justify-between items-center border-b-4 border-stone-300 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-stone-850">🔭 강사 콘솔 실시간 대시보드</h1>
          <p className="text-[10px] text-stone-500 font-extrabold mt-1 uppercase tracking-wider">REAL-TIME MANAGEMENT PANEL</p>
        </div>
        <button
          onClick={handleLogout}
          className="pixel-btn pixel-btn-gray text-xs py-1.5 px-3"
        >
          로그아웃 🚪
        </button>
      </div>

      {/* Control Panel: Session generation & selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Sky-blue themed session control */}
        <div className="pixel-box p-5 bg-sky-50/85 col-span-1 border-4 border-sky-300 shadow-sm rounded-2xl text-sky-950">
          <h3 className="text-xs font-black text-sky-950 mb-3 uppercase tracking-wider">세션 관리</h3>
          
          <button
            onClick={handleCreateSession}
            disabled={loading}
            className="w-full pixel-btn bg-sky-200 border-4 border-[#6b5b52] hover:bg-sky-300 text-sky-950 text-xs py-2 mb-4 rounded-xl shadow-sm leading-tight flex flex-col items-center justify-center gap-0.5"
          >
            {loading ? (
              <span>코드 생성 중...</span>
            ) : (
              <>
                <span>새로운 세션 생성</span>
                <span className="text-[10px] text-sky-900/80 font-bold font-sans">(4자리 숫자)</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-2 border-2 border-rose-300 bg-rose-50 text-rose-800 text-[10px] text-center font-bold rounded-lg mb-3">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-sky-900 mb-1.5 font-bold">세션 선택:</label>
            {sessions.length === 0 ? (
              <p className="text-[10px] text-sky-800/70 italic">생성된 세션이 없습니다. 위 버튼을 누르세요.</p>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="flex-grow px-2 py-1.5 text-xs bg-white border-2 border-sky-200 text-stone-850 rounded-lg focus:outline-none focus:border-sky-400 font-bold"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      코드: {s.entry_code}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDeleteSession}
                  disabled={loading}
                  className="pixel-btn bg-rose-200 hover:bg-rose-300 text-rose-950 text-xs px-3 border-4 border-[#6b5b52] rounded-xl font-black shrink-0"
                  title="선택된 세션 삭제"
                >
                  삭제 🗑️
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mint-green themed Global Statistics */}
        <div className="pixel-box p-5 bg-emerald-50/85 col-span-2 border-4 border-emerald-300 shadow-sm rounded-2xl text-emerald-950">
          <h3 className="text-xs font-black text-emerald-950 mb-3 uppercase tracking-wider">
            세션 진행 현황 (코드: <span className="underline font-black">{currentSessionCode || '없음'}</span>)
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2.5 border-2 border-emerald-200 rounded-xl">
              <span className="block text-[9px] text-stone-500 font-bold uppercase">총 가입</span>
              <span className="text-xl font-black text-stone-900">{totalCount}명</span>
            </div>
            <div className="bg-white p-2.5 border-2 border-emerald-200 rounded-xl">
              <span className="block text-[9px] text-stone-500 font-bold uppercase">진단 완료</span>
              <span className="text-xl font-black text-emerald-800">{completedCount}명</span>
            </div>
            <div className="bg-white p-2.5 border-2 border-emerald-200 rounded-xl">
              <span className="block text-[9px] text-stone-500 font-bold uppercase">READY</span>
              <span className="text-xl font-black text-amber-800">{readyCount}명</span>
            </div>
            <div className="bg-white p-2.5 border-2 border-emerald-200 rounded-xl">
              <span className="block text-[9px] text-stone-500 font-bold uppercase">역할 배정</span>
              <span className="text-xl font-black text-indigo-800">{roleAssignedCount}명</span>
            </div>
          </div>

          <div className="mt-4.5">
            <div className="w-full bg-white h-4 border-2 border-emerald-300 rounded-full flex p-[2px]">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[8px] text-stone-500 text-right mt-1 font-bold">전체 진단 완성률 진행바</p>
          </div>
        </div>
      </div>

      {/* Real-time Teams List */}
      <div>
        <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">
          조별 실시간 진단 상태 및 역할 결과
        </h3>

        {sessions.length === 0 ? (
          <div className="pixel-box p-10 text-center text-xs text-stone-400 rounded-2xl italic border-2 border-dashed border-stone-300">
            세션을 생성하고 학생들에게 입장 코드를 알려주면 조별 결과가 실시간 업데이트됩니다.
          </div>
        ) : participants.length === 0 ? (
          <div className="pixel-box p-10 text-center text-xs text-stone-500 rounded-2xl italic border-2 border-dashed border-stone-200">
            대기 중... 학생들이 입장 코드 <span className="font-black text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">{currentSessionCode}</span>로 입장하는 즉시 조원들이 노출됩니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedTeamNumbers.map(teamNo => {
              const members = groupedParticipants[teamNo];
              const total = members.length;
              const completed = members.filter(m => m.character_key).length;
              const readied = members.filter(m => m.is_ready).length;
              const allRolesAssigned = members.every(m => m.assigned_role);

              return (
                <div key={teamNo} className="pixel-box bg-white/95 p-5 border-4 border-sky-300/80 shadow-sm rounded-2xl">
                  {/* Team Title Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-sky-100 pb-2 mb-3 gap-2">
                    <h4 className="text-sm font-black text-stone-850 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-black rounded-lg">
                        {teamNo}조
                      </span>
                      <span>({total}명 합류)</span>
                    </h4>
                    
                    {/* Progression Indicators */}
                    <div className="flex gap-4 text-[10px] font-extrabold text-stone-500">
                      <span>진단 진행: <strong className="text-emerald-800">{completed}/{total}</strong></span>
                      <span>READY: <strong className="text-amber-800">{readied}/{total}</strong></span>
                      <span>
                        역할 매칭: {' '}
                        {allRolesAssigned && total >= 3 ? (
                          <strong className="text-indigo-800">배정 완료 ✨</strong>
                        ) : (
                          <strong className="text-stone-400">대기 중</strong>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Team Members Details Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-[9px] text-stone-400 uppercase font-black">
                          <th className="py-2 pr-2">이름</th>
                          <th className="py-2 pr-2">소속</th>
                          <th className="py-2 pr-2">진단 상태</th>
                          <th className="py-2 pr-2">대표 성향 (1순위)</th>
                          <th className="py-2 pr-2">READY</th>
                          <th className="py-2">배정 역할</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-bold text-stone-700">
                        {members.map(m => {
                          const charProfile = m.character_key ? CHARACTER_PROFILES[m.character_key] : null;
                          const roleProfile = m.assigned_role ? ROLES[m.assigned_role] : null;

                          return (
                            <tr key={m.id} className="hover:bg-sky-50/40">
                              <td className="py-2 pr-2 text-stone-900">{m.name}</td>
                              <td className="py-2 pr-2 text-stone-500">{m.affiliation}</td>
                              <td className="py-2 pr-2">
                                {m.character_key ? (
                                  <span className="text-emerald-800">완료</span>
                                ) : (
                                  <span className="text-stone-400 font-normal">진행 중</span>
                                )}
                              </td>
                              <td className="py-2 pr-2">
                                {charProfile ? (
                                  <span>{charProfile.emoji} {charProfile.name}</span>
                                ) : (
                                  <span className="text-stone-400 font-normal">-</span>
                                )}
                              </td>
                              <td className="py-2 pr-2">
                                {m.is_ready ? (
                                  <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 border-2 border-emerald-400 text-[9px] font-black rounded-lg">READY 👍</span>
                                ) : (
                                  <span className="text-stone-500 bg-stone-100 px-2 py-0.5 border border-stone-300 text-[9px] rounded-lg">대기</span>
                                )}
                              </td>
                              <td className="py-2">
                                {roleProfile ? (
                                  <span className="text-indigo-900 bg-indigo-100/80 px-2.5 py-1 border-2 border-indigo-300 text-[10px] font-black rounded-lg">
                                    {roleProfile.emoji} {roleProfile.name}
                                  </span>
                                ) : m.assigned_role === 'supporter' ? (
                                  <span className="text-stone-750 bg-stone-100 px-2 py-0.5 border border-stone-300 text-[10px] font-black rounded-lg">
                                    🍉 서포터
                                  </span>
                                ) : (
                                  <span className="text-stone-400 font-normal">미배정</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
