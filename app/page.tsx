'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionByCode, joinSession } from '../lib/db';
import { playClickSound, playSuccessSound, isSoundEnabled, setSoundEnabled } from '../lib/audio';

export default function StudentEntrance() {
  const router = useRouter();
  const [entryCode, setEntryCode] = useState('');
  const [name, setName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [soundOn, setSoundOn] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');



  // Sync sound settings from storage (Force sound off by default as requested)
  useEffect(() => {
    setSoundEnabled(false);
    setSoundOn(false);
  }, []);

  const handleSoundToggle = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
    
    if (newState) {
      // @ts-ignore
      if (typeof window !== 'undefined') {
        const ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (ctx) {
          const dummy = new ctx();
          if (dummy.state === 'suspended') {
            dummy.resume();
          }
        }
      }
      setTimeout(() => {
        playSuccessSound();
      }, 50);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    playClickSound();

    try {
      const code = entryCode.trim();
      if (!code) {
        setErrorMsg('입장 코드를 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!/^\d{4}$/.test(code)) {
        setErrorMsg('입장 코드는 숫자 4자리(0000~9999)입니다.');
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setErrorMsg('이름을 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!affiliation.trim()) {
        setErrorMsg('소속을 입력해주세요.');
        setLoading(false);
        return;
      }
      const parsedTeam = parseInt(teamNumber);
      if (isNaN(parsedTeam) || parsedTeam <= 0) {
        setErrorMsg('올바른 조 번호를 입력해주세요 (예: 1)');
        setLoading(false);
        return;
      }

      // Check if session exists
      const session = await getSessionByCode(code);
      if (!session) {
        setErrorMsg('존재하지 않거나 만료된 입장 코드입니다.');
        setLoading(false);
        return;
      }

      // Join the session
      const participant = await joinSession(session.id, name, affiliation, parsedTeam);
      // Store identification in storage
      sessionStorage.setItem('team_party_participant_id', participant.id);
      sessionStorage.setItem('team_party_session_id', session.id);
      sessionStorage.setItem('team_party_team_number', parsedTeam.toString());

      playSuccessSound();

      // 재접속(Reconnection) 시 진행 상태에 따른 스마트 라우팅
      if (participant.character_key) {
        if (participant.assigned_role) {
          // 역할 배정까지 끝난 경우 결과 화면으로 이동
          router.push('/party');
        } else {
          // 캐릭터 진단만 끝난 경우 대기실로 이동
          router.push('/lobby');
        }
      } else {
        // 진단을 진행하지 않은 경우 진단지 페이지로 이동
        router.push('/diagnose');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('입장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none relative pb-16">
      <div className="w-full max-w-lg cozy-float">
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="absolute -inset-2 bg-rose-200 rounded-3xl blur opacity-30"></div>
            <div className="relative cozy-card bg-[#fffdfa]/95 py-5 px-8 text-center border-4 border-[#6b5b52]">
              <span className="absolute -top-4 -left-4 text-3xl">🎮</span>
              <span className="absolute -bottom-4 -right-4 text-3xl">☁️</span>
              <h1 className="text-4xl md:text-5xl font-black tracking-wide text-[#3e2f27] drop-shadow-[0_2px_0_#fef08a]">
                TEAM PARTY
              </h1>
              <p className="text-sm text-[#6b5b52] font-black mt-2 tracking-widest uppercase">
                ✨ 말랑말랑 팀빌딩 진단 게임 ✨
              </p>
            </div>
          </div>
        </div>

        {/* Entry Form Container */}
        <div className="cozy-card p-6 md:p-8 bg-[#fffdfa]/95">
          <h2 className="text-xl font-black text-[#3e2f27] text-center mb-6 border-b-4 border-dashed border-[#fbcfe8]/40 pb-4 tracking-wider">
            🛡️ 모험가 파티 가입하기 🛡️
          </h2>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-[#6b5b52] mb-2">
                🔑 입장 코드 (숫자 4자리)
              </label>
              <input
                type="text"
                pattern="\d*"
                maxLength={4}
                value={entryCode}
                onChange={(e) => setEntryCode(e.target.value.replace(/\D/g, ''))}
                placeholder="예: 1234"
                className="w-full cozy-input text-lg tracking-widest text-center font-black"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-[#6b5b52] mb-2">
                  👤 모험가 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full cozy-input text-base font-bold"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-[#6b5b52] mb-2">
                  🏢 소속 길드
                </label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="예: 회사/학교명"
                  className="w-full cozy-input text-base font-bold"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-[#6b5b52] mb-2">
                👥 내 배정 조 (숫자만)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={teamNumber}
                onChange={(e) => setTeamNumber(e.target.value)}
                placeholder="예: 3"
                className="w-full cozy-input text-base font-bold"
                disabled={loading}
              />
            </div>

            {errorMsg && (
              <div className="p-3 border-2 border-rose-300 bg-rose-50 text-rose-800 text-sm text-center font-bold rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                className="w-full pixel-btn text-lg"
                disabled={loading}
              >
                {loading ? '입장하는 중...' : '파티 들어가기 ⚔️'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Admin Shortcut */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              playClickSound();
              router.push('/instructor/login');
            }}
            className="text-sm text-[#6b5b52] hover:text-[#3e2f27] underline transition duration-150 cursor-pointer font-black"
          >
            강사이신가요? 관리자 콘솔 바로가기 🔭
          </button>
        </div>
      </div>
    </div>
  );
}
