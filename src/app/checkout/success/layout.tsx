import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "결제 완료",
  description: "라이드올다이 강습 결제가 완료되었습니다.",
  path: "/checkout/success",
});

export default function CheckoutSuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
