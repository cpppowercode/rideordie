import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { DEFAULT_OG_ALT, DEFAULT_OG_IMAGE, pageAlternates } from "@/lib/seo";
import {
  SITE_URL,
  TEACHING_RESORTS_COPY,
} from "@/lib/site";

const SITE_TITLE = `라이드올다이 | ${TEACHING_RESORTS_COPY} 스키·보드 강습`;
const SITE_DESCRIPTION = "전국 5개 스키장(하이원·비발디·웰리힐리·용평·지산) 어린이 스키·보드 강습. 1:1 2시간 15만원부터. 카카오톡 상담과 온라인 예약.";

const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  "-dxgX2pXvxn7gFzrjemFR2bvnwf2HXykuWUm4VgMiwo";
const naverVerification =
  process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ||
  "9b5ce8c7c8abb0844e6f9eb4f3150b73486acc23";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | 라이드올다이",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "어린이 스키강습",
    "하이원 스키강습 어린이",
    "지산 스키강습 가격",
    "용평 스키강습 유아",
    "비발디 스키강습 비용",
    "웰리힐리 스키강습 가격",
  ],
  alternates: pageAlternates(SITE_URL),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "라이드올다이",
    locale: "ko_KR",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, alt: DEFAULT_OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  verification: {
    google: googleVerification,
    other: {
      "naver-site-verification": naverVerification,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <JsonLd data={organizationJsonLd()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
