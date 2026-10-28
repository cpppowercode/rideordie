import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResortLandingView } from "@/components/seo/ResortLandingView";
import {
  faqPageJsonLd,
  resortServiceJsonLd,
} from "@/lib/jsonld";
import { priceCopy, RESORT_LANDINGS, resortCanonical, resortLandingBySlug } from "@/lib/resort-landings";
import { pageAlternates } from "@/lib/seo";
import { kstToday, periodFor } from "@/lib/pricing";
import { getSeasonSettings } from "@/lib/season-settings";
import { LESSON_PHOTOS, SITE_URL } from "@/lib/site";

export const dynamicParams = false;
// 요금 기간(얼리버드/일반/시즌말)이 날짜에 따라 바뀌므로 5분마다 다시 만든다(ISR).
export const revalidate = 300;

async function currentPeriod() {
  return periodFor(kstToday(), await getSeasonSettings());
}

export function generateStaticParams() {
  return RESORT_LANDINGS.map((row) => ({ slug: row.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const landing = resortLandingBySlug(slug);
  if (!landing) return {};

  const url = resortCanonical(landing.slug);
  const description = priceCopy(landing.description, await currentPeriod());
  const ogImage = `${SITE_URL}${landing.image || LESSON_PHOTOS.hero}`;

  return {
    title: { absolute: landing.title },
    description,
    keywords: landing.keywords,
    alternates: pageAlternates(url),
    openGraph: {
      title: landing.ogTitle,
      description,
      url,
      locale: "ko_KR",
      type: "website",
      siteName: "라이드올다이",
      images: [{ url: ogImage, alt: landing.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: landing.ogTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function ResortLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const landing = resortLandingBySlug(slug);
  if (!landing) notFound();
  const period = await currentPeriod();

  return (
    <>
      <JsonLd data={resortServiceJsonLd(landing, period)} />
      <JsonLd data={faqPageJsonLd(landing.faqs)} />
      <ResortLandingView landing={landing} period={period} />
    </>
  );
}
