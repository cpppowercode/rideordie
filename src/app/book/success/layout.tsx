import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "예약 접수 완료",
  description: "라이드올다이 강습 예약이 접수되었습니다.",
  path: "/book/success",
});

export default function BookSuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
