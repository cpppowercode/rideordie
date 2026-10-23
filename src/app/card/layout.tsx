import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "명함",
  description: "라이드올다이 디지털 명함.",
  path: "/card",
});

export default function CardLayout({ children }: { children: ReactNode }) {
  return children;
}
