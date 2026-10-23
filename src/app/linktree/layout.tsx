import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "링크",
  description: "라이드올다이 강습 예약·인스타그램·카톡 상담 링크.",
  path: "/linktree",
});

export default function LinktreeLayout({ children }: { children: ReactNode }) {
  return children;
}
