export const PRODUCT_DATA = {
    id: "ski-lesson-premium",
    title: "라이드올다이 프리미엄 1:1 스키·보드 강습",
    price: 150000,
    description: "공인 강사와 함께하는 하이원 스키·스노보드 강습. 입문부터 상급까지 레벨에 맞춰 진행합니다.",
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
