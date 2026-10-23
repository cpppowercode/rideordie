import type { Metadata } from "next";
import { LESSON_PHOTOS, SITE_URL } from "@/lib/site";

export const DEFAULT_OG_IMAGE = `${SITE_URL}${LESSON_PHOTOS.hero}`;
export const DEFAULT_OG_ALT = "라이드올다이 스키·보드 강습";

export function languageAlternates(url: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: url,
    languages: {
      "ko-KR": url,
      "x-default": url,
    },
  };
}

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_ALT,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  image?: string;
  imageAlt?: string;
}): Metadata {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: languageAlternates(url),
    openGraph: {
      title,
      description,
      url,
      locale: "ko_KR",
      type: "website",
      siteName: "라이드올다이",
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
