import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "라이드올다이 강습 피드백" },
  description: "라이드올다이 강습 피드백을 확인합니다.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "라이드올다이 강습 피드백",
    description: "예약 정보로 강습 피드백을 확인하세요.",
    siteName: "라이드올다이",
    locale: "ko_KR",
    type: "website",
  },
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
