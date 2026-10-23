import { INSTAGRAM_URL } from "@/lib/site";

export const PRODUCT_DATA = {
    id: "ski-lesson-premium",
    title: "라이드올다이 프리미엄 1:1 스키·보드 강습",
    price: 150000,
    description: "공인 강사와 함께하는 스키·스노보드 강습. 입문부터 상급까지 레벨에 맞춰 진행합니다.",
    images: {
        hero: "/images/lessons/hero.png",
        main: "/assets/mainThumb.png",
        sub: [
            "/images/lessons/gallery-1.jpg",
            "/assets/subImage/1.png",
            "/images/lessons/gallery-6.jpg",
            "/assets/subImage/2.png",
            "/images/lessons/gallery-3.jpg",
            "/assets/subImage/3.png",
            "/images/lessons/gallery-2.jpg",
            "/images/lessons/gallery-4.jpg",
        ],
        detail: [
            "/images/lessons/hero.png",
            "/assets/subImage/1.png",
            "/images/lessons/gallery-1.jpg",
            "/assets/subImage/3.png",
            "/images/lessons/gallery-6.jpg",
            "/assets/mainThumb.png",
        ],
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
            values: ["2시간 (오전)", "2시간 (오후)", "4시간 (종일)", "2시간 (야간)"],
        },
        {
            id: "opt-level",
            name: "실력 수준",
            values: ["입문 (첫 스키)", "초급 (턴 가능)", "중급 (패럴럴)", "상급 (캐빙)"],
        },
    ],
};

export { INSTAGRAM_URL };
