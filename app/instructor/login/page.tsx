'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_PASSWORD } from '../../../lib/constants';
import { playClickSound, playSuccessSound } from '../../../lib/audio';

export default function InstructorLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('team_party_instructor_logged_in') === 'true') {
      router.push('/instructor/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    playClickSound();

    try {
      if (!password.trim()) {
        setErrorMsg('비밀번호를 입력해주세요.');
        setLoading(false);
        return;
      }

      if (password.trim() === ADMIN_PASSWORD) {
        sessionStorage.setItem('team_party_instructor_logged_in', 'true');
        // 세션 테이블의 instructor_id에 외래키 위반이 나지 않도록 instructor_id로 null을 저장하기 위해 빈 문자열 설정
        sessionStorage.setItem('team_party_instructor_id', '');
        
        playSuccessSound();
        router.push('/instructor/dashboard');
      } else {
        setErrorMsg('비밀번호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none">
      <div className="w-full max-w-md cozy-float">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <div className="absolute -inset-1.5 bg-rose-200 rounded-2xl blur opacity-25"></div>
            <div className="relative pixel-box bg-rose-50/95 py-3 px-6 text-center border-4 border-rose-300 rounded-2xl">
              <h1 className="text-2xl md:text-3xl font-black text-rose-900 drop-shadow-[0_2px_0_#fef08a]">
                INSTRUCTOR CABINET
              </h1>
              <p className="text-[10px] text-rose-800 font-extrabold mt-1 tracking-widest uppercase">
                🔬 강사 관리용 콘솔
              </p>
            </div>
          </div>
        </div>

        {/* Login Box */}
        <div className="pixel-box p-6 md:p-8 bg-amber-50/95 border-4 border-amber-900/60 rounded-2xl">
          <h2 className="text-sm font-extrabold text-amber-950 text-center mb-6 border-b-4 border-dashed border-amber-200 pb-3 tracking-widest uppercase">
            🔑 관리자 패스워드 입력 🔑
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-amber-800 mb-1.5">
                🔒 비밀번호 (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-3 py-2 text-sm bg-white/80 border-2 border-amber-800/40 text-amber-950 rounded-lg focus:outline-none focus:border-amber-700 font-bold text-center tracking-widest"
                disabled={loading}
              />
            </div>

            {errorMsg && (
              <div className="p-2 border-2 border-rose-300 bg-rose-100 text-rose-800 text-xs text-center font-bold rounded-lg">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full pixel-btn pixel-btn-purple"
                disabled={loading}
              >
                {loading ? '관리자 인증 중...' : '콘솔 시스템 접속 🔬'}
              </button>
            </div>
          </form>
        </div>

        {/* Back button */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              playClickSound();
              router.push('/');
            }}
            className="text-xs text-stone-500 hover:text-stone-700 underline font-bold cursor-pointer"
          >
            학생용 첫 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
