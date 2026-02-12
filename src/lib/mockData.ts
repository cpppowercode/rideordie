export const PRODUCT_DATA = {
    id: "ski-lesson-premium",
    title: "[RideOrDie] 프리미엄 1:1 스키 강습 | 전문 코칭",
    price: 150000,
    originalPrice: 200000,
    discountRate: 25,
    description: "공인 강사와 함께하는 최고의 스키 코칭. 입문부터 상급까지 모든 레벨 수강 가능.",
    rating: 4.8,
    reviewCount: 124,
    images: {
        main: "/assets/mainThumb.png",
        sub: [
            "/assets/subImage/1.png",
            "/assets/subImage/2.png",
            "/assets/subImage/3.png",
            "/assets/subImage/4.png",
            "/assets/subImage/5.png",
            "/assets/subImage/6.png",
            "/assets/subImage/9.png",
        ],
        detail: "/assets/detailPage.png",
    },
    options: [
        {
            id: "opt-course",
            name: "강습 유형",
            values: ["1:1 프라이빗 강습", "2:1 파트너 강습", "그룹 강습 (최대 4명)"],
        },
        {
            id: "opt-duration",
            name: "시간대",
            values: ["2시간 (오전)", "2시간 (오후)", "4시간 (종일)"],
        },
        {
            id: "opt-level",
            name: "실력 수준",
            values: ["입문 (첫 스키)", "초급 (턴 가능)", "중급 (패럴럴)", "상급 (캐빙)"],
        },
    ],
};

export const REVIEWS = [
    {
        id: 1,
        user: "rider_01",
        rating: 5,
        date: "2024-01-15",
        content: "지금까지 받은 강습 중 최고였어요. 강사님이 매우 친절하고 꼼꼼하게 알려주셨어요.",
        image: null,
    },
    {
        id: 2,
        user: "snow_lover",
        rating: 4,
        date: "2024-01-10",
        content: "기술적으로 많은 도움이 됐어요. 날씨가 조금 험했지만 많이 배웠습니다!",
        image: null,
    },
    {
        id: 3,
        user: "beginner_kim",
        rating: 5,
        date: "2024-01-05",
        content: "5초마다 넘어지던 제가 한 강습 만에 턴을 연결하게 됐어요. 강추합니다!",
        image: null,
    },
];
