import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "결제",
  description: "라이드올다이 강습 결제. 1:1 2시간 정가 15만원.",
  path: "/checkout",
});

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
