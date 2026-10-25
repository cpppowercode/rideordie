import type { ReactNode } from "react";
import { PRODUCT_DATA } from "@/lib/mockData";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PRODUCT_DATA.title,
  description: `${PRODUCT_DATA.description} 1:1 2시간 정가 15만원.`,
  path: `/product/${PRODUCT_DATA.id}`,
  absoluteTitle: true,
});

export default function ProductLayout({ children }: { children: ReactNode }) {
  return children;
}
