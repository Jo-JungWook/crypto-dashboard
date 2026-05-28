import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 📌 이 부분을 수정하면 브라우저 탭 이름과 링크 공유 미리보기가 모두 바뀝니다!
export const metadata: Metadata = {
  title: "전업코인부자 대시보드",
  description: "실시간 암호화폐 도미넌스 및 글로벌 매크로 지표 트레이딩 대시보드",
  openGraph: {
    title: "전업코인부자 대시보드",
    description: "실시간 암호화폐 도미넌스 및 글로벌 매크로 지표 트레이딩 대시보드",
    images: [
      {
        url: "/logo.png", // 공유할 때 뜰 이미지 경로 (이미 로고가 잘 나오는 상태라면 그대로 유지됩니다)
        width: 800,
        height: 600,
        alt: "전업코인부자 로고",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}