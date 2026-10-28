import { tableFor, type PricePeriod } from "@/lib/pricing";
import {
  INSTAGRAM_URL,
  KAKAO_CONSULT_URL,
  SITE_URL,
} from "@/lib/site";
import {
  bookHref,
  priceCopy,
  type ResortFaq,
  type ResortLanding,
} from "@/lib/resort-landings";

export const ORGANIZATION_NAME = "라이드올다이";
export const ORGANIZATION_LOGO = `${SITE_URL}/logo.svg`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: ORGANIZATION_LOGO,
    sameAs: [INSTAGRAM_URL, KAKAO_CONSULT_URL],
  };
}

export function faqPageJsonLd(faqs: ResortFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function resortServiceJsonLd(landing: ResortLanding, period: PricePeriod = "regular") {
  const regular = tableFor(period)["1:1"][2];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: landing.h1,
    description: priceCopy(landing.description, period),
    url: `${SITE_URL}/resorts/${landing.slug}`,
    provider: {
      "@type": "Organization",
      name: ORGANIZATION_NAME,
      url: SITE_URL,
    },
    areaServed: landing.placeName,
    offers: {
      "@type": "Offer",
      price: String(regular),
      priceCurrency: "KRW",
      url: `${SITE_URL}${bookHref(landing.slug)}`,
      availability: "https://schema.org/InStock",
    },
  };
}
