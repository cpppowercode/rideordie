import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResortLandingView } from "@/components/seo/ResortLandingView";
import {
  faqPageJsonLd,
  resortServiceJsonLd,
} from "@/lib/jsonld";
import { RESORT_LANDINGS, resortCanonical, resortLandingBySlug } from "@/lib/resort-landings";
import { LESSON_PHOTOS, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

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
  const ogImage = `${SITE_URL}${landing.image || LESSON_PHOTOS.hero}`;

  return {
    title: { absolute: landing.title },
    description: landing.description,
    keywords: landing.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: landing.ogTitle,
      description: landing.description,
      url,
      locale: "ko_KR",
      type: "website",
      siteName: "라이드올다이",
      images: [{ url: ogImage, alt: landing.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: landing.ogTitle,
      description: landing.description,
      images: [ogImage],
    },
  };
}

export default async function ResortLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const landing = resortLandingBySlug(slug);
  if (!landing) notFound();

  return (
    <>
      <JsonLd data={resortServiceJsonLd(landing)} />
      <JsonLd data={faqPageJsonLd(landing.faqs)} />
      <ResortLandingView landing={landing} />
    </>
  );
}
