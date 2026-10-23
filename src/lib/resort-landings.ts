import { KAKAO_CONSULT_URL, LESSON_PHOTOS, SITE_URL, SKI_RESORTS } from "@/lib/site";

export const REGULAR_PRICE_TABLE = {
  ratios: ["1:1", "2:1", "3:1"] as const,
  hours: [2, 3, 4] as const,
  amounts: {
    "1:1": { 2: 150_000, 3: 220_000, 4: 290_000 },
    "2:1": { 2: 180_000, 3: 270_000, 4: 350_000 },
    "3:1": { 2: 210_000, 3: 310_000, 4: 400_000 },
  },
} as const;

export type ResortLandingSlug = "high1" | "welli-hilli" | "vivaldi" | "jisan" | "yongpyong";

export type ResortFaq = { q: string; a: string };

export type ResortLanding = {
  slug: ResortLandingSlug;
  bookingValue: (typeof SKI_RESORTS)[number]["value"];
  shortName: string;
  placeName: string;
  title: string;
  h1: string;
  description: string;
  ogTitle: string;
  keywords: string;
  layout: "full" | "standard" | "minimal";
  mentionBadgeFee: boolean;
  image: string;
  imageAlt: string;
  intro: string[];
  sections?: {
    heading: string;
    body: string[];
  }[];
  faqs: ResortFaq[];
};

export const TERMS_REFUND_HREF = "/service-policy#article-9";

export const EARLY_BIRD_COPY =
  "1:1 2시간 정가 15만원, 각 리조트 개장 후 첫 2주 안에 예약하거나 2월 중순 이후 강습은 특가 14만원";

const SHARED_FACTS_FAQ: ResortFaq[] = [
  {
    q: "강습비는 얼마인가요?",
    a: "1:1 2시간 정가는 15만원입니다. 1:1·2:1·3:1 구성이 있고, 숙소·리프트권·장비는 별도입니다.",
  },
  {
    q: "얼리버드 할인이 있나요?",
    a: `${EARLY_BIRD_COPY}입니다.`,
  },
  {
    q: "숙소나 리프트권도 포함인가요?",
    a: "아닙니다. 강습비만 받으며 숙소·리프트권·장비는 별도입니다.",
  },
  {
    q: "강사는 어떤 사람인가요?",
    a: "공인 강사가 진행합니다. 응급처치 교육을 이수했으며 강습보험이 적용됩니다.",
  },
  {
    q: "환불은 어떻게 되나요?",
    a: "환불은 이용약관 제9조를 따릅니다.",
  },
];

export const SITE_FAQ: ResortFaq[] = [
  {
    q: "상담 없이 바로 예약할 수 있나요?",
    a: "네. 홈페이지에서 스키장과 강습 시간을 고르면 바로 접수됩니다. 카톡 상담으로도 일정을 잡을 수 있습니다.",
  },
  {
    q: "강습은 어디서 진행하나요?",
    a: "하이원, 비발디, 웰리힐리, 용평, 지산에서 강습합니다. 예약할 때 스키장을 고릅니다.",
  },
  {
    q: "강습비는 얼마인가요?",
    a: "1:1 2시간 정가는 15만원입니다. 1:1·2:1·3:1 구성이 있으며, 숙소·리프트권·장비는 별도입니다.",
  },
  {
    q: "얼리버드 할인이 있나요?",
    a: `${EARLY_BIRD_COPY}입니다.`,
  },
  {
    q: "강사는 공인 자격인가요?",
    a: "공인 강사가 진행하고, 응급처치 교육을 이수했으며 강습보험이 적용됩니다.",
  },
  {
    q: "일정을 바꾸거나 취소하고 싶어요.",
    a: "환불·변경은 이용약관 제9조를 따릅니다. 자세한 내용은 약관을 확인해 주세요.",
  },
];

export const RESORT_LANDINGS: ResortLanding[] = [
  {
    slug: "high1",
    bookingValue: "하이원리조트",
    shortName: "하이원",
    placeName: "하이원리조트",
    title: "하이원 어린이 스키강습·보드강습 1:1 | 라이드올다이",
    h1: "하이원 어린이 스키·보드강습",
    description:
      "하이원 어린이 스키강습·보드강습 1:1. 1:1·2:1·3:1 구성, 1:1 2시간 15만원부터. 숙소·리프트권·장비 별도. 카톡 상담과 온라인 예약으로 바로 접수합니다.",
    ogTitle: "하이원 어린이 스키강습 1:1 | 라이드올다이",
    keywords: "하이원 스키강습 어린이, 하이원 보드강습, 어린이 스키강습",
    layout: "full",
    mentionBadgeFee: false,
    image: LESSON_PHOTOS.lesson,
    imageAlt: "하이원 슬로프에서 진행하는 어린이 스키·보드 강습",
    intro: [
      "정선 하이원 슬로프에서 아이와 나란히 서는 강습입니다. 첫 미끄러짐부터 턴이 붙을 때까지, 공인 강사가 한 아이 페이스에 맞춰 옆에서 붙습니다.",
      "고원 리조트 특유의 넓은 초급 지형을 이용해, 사람이 몰린 가장자리를 피하고 아이가 시야를 확보한 채로 서게 자리를 고릅니다. 스키와 보드 모두 같은 방식으로 진행합니다.",
    ],
    sections: [
      {
        heading: "강습 구성",
        body: [
          "1:1·2:1·3:1 현장 강습입니다. 아이만, 또는 보호자와 함께 서는 일정도 상담으로 맞춥니다.",
          "시간은 2·3·4시간 중에서 고릅니다. 공인 강사가 진행하고, 응급처치 교육을 이수했으며 강습보험이 적용됩니다.",
        ],
      },
      {
        heading: "이런 아이에게 맞아요",
        body: [
          "하이원을 처음 오거나, 슬로프에서 혼자 서 본 적은 있지만 아직 리프트를 무서워하는 초보 아이에게 맞춰 진행합니다.",
          "이미 턴이 되는 아이는 같은 슬로프에서 리듬과 에지를 다듬습니다. 당일 컨디션만 보고 코스를 정합니다.",
        ],
      },
      {
        heading: "진행 방식",
        body: [
          "예약한 시간에 하이원 약속 지점에서 만납니다. 장비 착용을 확인하고, 평지에서 멈춤부터 다시 맞춘 뒤 슬로프로 올라갑니다.",
          "강습 도중 쉬는 간격은 아이 컨디션을 보고 조절합니다. 리프트권·숙소·장비는 포함되지 않으니 미리 준비해 주세요.",
        ],
      },
      {
        heading: "준비물",
        body: [
          "리프트권·장비·숙소는 강습비에 들어 있지 않습니다. 헬멧과 장갑은 슬로프에서 쓸 수 있게 챙겨 주세요.",
          "강습 당일 만날 위치는 예약 확인 때 안내합니다.",
        ],
      },
      {
        heading: "환불",
        body: [
          "환불은 이용약관 제9조를 따릅니다. 예약 전에 약관을 확인해 주세요.",
        ],
      },
    ],
    faqs: [
      {
        q: "하이원에서만 강습하나요?",
        a: "하이원뿐 아니라 비발디, 웰리힐리, 용평, 지산에서도 강습합니다. 이 페이지는 하이원 일정용입니다.",
      },
      ...SHARED_FACTS_FAQ,
    ],
  },
  {
    slug: "welli-hilli",
    bookingValue: "웰리힐리파크",
    shortName: "웰리힐리",
    placeName: "웰리힐리파크",
    title: "웰리힐리 어린이 스키강습·보드강습 1:1 | 라이드올다이",
    h1: "웰리힐리 어린이 스키·보드강습",
    description:
      "웰리힐리 스키강습 가격과 어린이 보드강습. 1:1·2:1·3:1 구성, 1:1 2시간 15만원부터. 숙소·리프트권·장비는 별도입니다. 카톡 상담과 온라인 예약.",
    ogTitle: "웰리힐리 스키강습 가격 | 어린이 1:1 강습",
    keywords: "웰리힐리 스키강습 가격, 웰리힐리 어린이 스키, 어린이 스키강습",
    layout: "full",
    mentionBadgeFee: false,
    image: LESSON_PHOTOS.carve,
    imageAlt: "웰리힐리파크에서 진행하는 어린이 스키·보드 강습",
    intro: [
      "홍천 웰리힐리파크는 서울에서 당일로 오기 쉬운 슬로프입니다. 주말에 아이와 잠깐 다녀오기 좋은 리듬으로 강습을 짭니다.",
      "초급 지형이 완만해 첫 스키·보드를 붙이기 좋습니다. 공인 강사가 아이 키와 걷는 속도에 맞춰 리프트와 슬로프를 고릅니다.",
    ],
    sections: [
      {
        heading: "강습 구성",
        body: [
          "1:1·2:1·3:1로 진행합니다. 형제나 친구와 같은 강습에 서는 경우 2:1·3:1을 고르면 됩니다.",
          "2·3·4시간 단위입니다. 강사는 공인 자격과 응급처치 교육을 갖추었고, 강습보험이 적용됩니다.",
        ],
      },
      {
        heading: "이런 아이에게 맞아요",
        body: [
          "차를 오래 타기 부담스러운 초보 아이, 주말에만 슬로프에 나오는 아이에게 웰리힐리 일정을 많이 씁니다.",
          "이미 활강이 되는 아이는 짧은 시간 안에 턴 각만 다듬고 내려오는 식으로 진행합니다.",
        ],
      },
      {
        heading: "진행 방식",
        body: [
          "웰리힐리 약속 지점에서 만나 장비와 헬멧을 확인한 뒤 평지 연습으로 시작합니다.",
          "숙소·리프트권·장비는 강습비에 들어 있지 않습니다. 당일 권으로 오셔도 되고, 숙박은 따로 잡으시면 됩니다.",
        ],
      },
      {
        heading: "준비물",
        body: [
          "리프트권과 장비는 직접 준비해 주세요. 강습비에는 포함되지 않습니다.",
          "당일 만날 장소는 예약 확인 안내로 보내 드립니다.",
        ],
      },
      {
        heading: "환불",
        body: [
          "환불은 이용약관 제9조를 따릅니다. 예약 전에 약관을 확인해 주세요.",
        ],
      },
    ],
    faqs: [
      {
        q: "웰리힐리만 가나요?",
        a: "하이원, 비발디, 용평, 지산에서도 강습합니다. 이 페이지는 웰리힐리 예약용입니다.",
      },
      ...SHARED_FACTS_FAQ,
    ],
  },
  {
    slug: "vivaldi",
    bookingValue: "비발디파크",
    shortName: "비발디",
    placeName: "비발디파크",
    title: "비발디 어린이 스키강습·보드강습 1:1 | 라이드올다이",
    h1: "비발디파크 어린이 스키·보드강습",
    description:
      "비발디 스키강습 비용 안내. 1:1·2:1·3:1, 1:1 2시간 15만원부터. 패찰비와 숙소·리프트권·장비는 별도입니다. 카톡 상담과 온라인 예약.",
    ogTitle: "비발디 스키강습 비용 | 어린이 1:1",
    keywords: "비발디 스키강습 비용, 비발디파크 어린이 스키, 어린이 스키강습",
    layout: "standard",
    mentionBadgeFee: true,
    image: LESSON_PHOTOS.slope,
    imageAlt: "비발디파크에서 진행하는 어린이 스키·보드 강습",
    intro: [
      "홍천 비발디파크는 숙박·식음이 한 단지에 모여 있어, 아이가 슬로프와 숙소를 오가며 지치기 전에 강습을 넣기 좋습니다.",
      "라이드올다이 공인 강사가 비발디 슬로프에서 1:1·2:1·3:1 어린이 스키·보드강습을 진행합니다. 응급처치 교육을 이수했고 강습보험이 적용됩니다.",
      "강습비 외에 패찰비가 별도입니다. 숙소·리프트권·장비도 포함되지 않습니다.",
    ],
    faqs: SHARED_FACTS_FAQ.map((item) =>
      item.q.includes("숙소")
        ? {
            ...item,
            a: "강습비만 받습니다. 비발디는 패찰비가 별도이며, 숙소·리프트권·장비도 포함되지 않습니다.",
          }
        : item
    ),
  },
  {
    slug: "jisan",
    bookingValue: "지산포레스트",
    shortName: "지산",
    placeName: "지산포레스트",
    title: "지산 어린이 스키강습·보드강습 1:1 | 라이드올다이",
    h1: "지산 어린이 스키·보드강습",
    description:
      "지산 스키강습 가격. 1:1·2:1·3:1 어린이 스키·보드강습, 1:1 2시간 15만원부터. 패찰비·숙소·리프트권·장비 별도. 카톡 상담과 온라인 예약.",
    ogTitle: "지산 스키강습 가격 | 어린이 1:1",
    keywords: "지산 스키강습 가격, 지산 어린이 스키, 어린이 스키강습",
    layout: "standard",
    mentionBadgeFee: true,
    image: LESSON_PHOTOS.lift,
    imageAlt: "지산에서 진행하는 어린이 스키·보드 강습",
    intro: [
      "이천 지산은 수도권에서 오전에 출발해 오후에 강습을 마치고 돌아오기 쉬운 스케줄입니다. 당일 아이 강습을 잡을 때 자주 씁니다.",
      "공인 강사가 지산 슬로프에서 어린이 스키·보드를 1:1·2:1·3:1로 진행합니다. 응급처치 교육을 이수했으며 강습보험이 적용됩니다.",
      "지산 강습은 패찰비가 별도입니다. 리프트권·숙소·장비도 강습비에 들어 있지 않습니다.",
    ],
    faqs: SHARED_FACTS_FAQ.map((item) =>
      item.q.includes("숙소")
        ? {
            ...item,
            a: "강습비만 받습니다. 지산은 패찰비가 별도이며, 숙소·리프트권·장비도 포함되지 않습니다.",
          }
        : item
    ),
  },
  {
    slug: "yongpyong",
    bookingValue: "용평리조트",
    shortName: "용평",
    placeName: "용평리조트",
    title: "용평 어린이 스키강습·보드강습 1:1 | 라이드올다이",
    h1: "용평 어린이 스키·보드강습",
    description:
      "용평 스키강습 유아·어린이 1:1. 1:1·2:1·3:1, 1:1 2시간 15만원부터. 숙소·리프트권·장비 별도. 카톡 상담과 온라인 예약.",
    ogTitle: "용평 스키강습 유아 | 라이드올다이",
    keywords: "용평 스키강습 유아, 용평 어린이 스키, 어린이 스키강습",
    layout: "minimal",
    mentionBadgeFee: false,
    image: LESSON_PHOTOS.air,
    imageAlt: "용평에서 진행하는 어린이 스키·보드 강습",
    intro: [
      "평창 용평에서 어린이 스키·보드 강습을 진행합니다. 1:1·2:1·3:1, 공인 강사, 응급처치 교육 이수, 강습보험 적용.",
      "1:1 2시간 정가는 15만원입니다. 숙소·리프트권·장비는 별도입니다. 환불은 약관 제9조를 따릅니다.",
    ],
    faqs: SHARED_FACTS_FAQ.slice(0, 3),
  },
];

export function resortLandingBySlug(slug: string): ResortLanding | undefined {
  return RESORT_LANDINGS.find((row) => row.slug === slug);
}

export function bookingValueFromResortQuery(raw: string | null | undefined): string {
  const value = (raw || "").trim();
  if (!value) return SKI_RESORTS[0].value;
  const bySlug = RESORT_LANDINGS.find((row) => row.slug === value);
  if (bySlug) return bySlug.bookingValue;
  const byBooking = SKI_RESORTS.find((row) => row.value === value);
  if (byBooking) return byBooking.value;
  const byLabel = SKI_RESORTS.find(
    (row) => row.label === value || row.label.replace("파크", "") === value
  );
  if (byLabel) return byLabel.value;
  return SKI_RESORTS[0].value;
}

export function bookHref(slug: ResortLandingSlug): string {
  return `/book?resort=${slug}`;
}

export function kakaoHref(): string {
  return KAKAO_CONSULT_URL;
}

export function resortCanonical(slug: ResortLandingSlug): string {
  return `${SITE_URL}/resorts/${slug}`;
}

export function earlyBirdCopy(): string {
  return EARLY_BIRD_COPY;
}

export function formatManwon(amount: number): string {
  return `${amount / 10_000}만원`;
}
