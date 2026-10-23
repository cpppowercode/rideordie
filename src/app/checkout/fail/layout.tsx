import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "결제 실패",
  description: "라이드올다이 강습 결제에 실패했습니다. 카톡 상담으로 도움을 받을 수 있습니다.",
  path: "/checkout/fail",
});

export default function CheckoutFailLayout({ children }: { children: ReactNode }) {
  return children;
}
