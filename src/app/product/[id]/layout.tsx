import type { Metadata } from "next";
import { PRODUCT_DATA } from "@/lib/mockData";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: PRODUCT_DATA.title },
  description: `${PRODUCT_DATA.description} 1:1 2시간 정가 15만원. 숙소·리프트권·장비 별도.`,
  alternates: { canonical: `${SITE_URL}/product/${PRODUCT_DATA.id}` },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
