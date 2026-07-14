import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Party | 팀빌딩 성향 진단 게임",
  description: "빅5 기반 캐릭터 매핑 & 실시간 역할 매칭 팀빌딩 솔루션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col crt-overlay antialiased">
        {children}
      </body>
    </html>
  );
}
