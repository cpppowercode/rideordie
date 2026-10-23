import type { MetadataRoute } from "next";
import { PRODUCT_DATA } from "@/lib/mockData";
import { RESORT_LANDINGS } from "@/lib/resort-landings";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/book`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${SITE_URL}/product/${PRODUCT_DATA.id}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/service-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...RESORT_LANDINGS.map((row) => ({
      url: `${SITE_URL}/resorts/${row.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
  return pages;
}
