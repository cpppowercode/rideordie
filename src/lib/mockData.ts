import { INSTAGRAM_URL, LESSON_PHOTOS } from "@/lib/site";

export const PRODUCT_DATA = {
    id: "ski-lesson-premium",
    title: "라이드올다이 프리미엄 1:1 스키·보드 강습",
    price: 150000,
    description: "공인 강사와 함께하는 스키·스노보드 강습. 입문부터 상급까지 레벨에 맞춰 진행합니다.",
    images: {
        hero: LESSON_PHOTOS.hero,
        heroMobile: LESSON_PHOTOS.heroMobile,
        main: "/assets/mainThumb.png",
        sub: [
            LESSON_PHOTOS.kids,
            LESSON_PHOTOS.night,
            LESSON_PHOTOS.skiKids,
            LESSON_PHOTOS.carve,
            LESSON_PHOTOS.liftKid,
            LESSON_PHOTOS.lift,
            LESSON_PHOTOS.jump,
            LESSON_PHOTOS.coach,
        ],
        detail: [
            LESSON_PHOTOS.lesson,
            LESSON_PHOTOS.kids,
            LESSON_PHOTOS.night,
            LESSON_PHOTOS.nightLift,
            LESSON_PHOTOS.carve,
            LESSON_PHOTOS.jump,
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
            name: "강습 시간",
            values: ["2시간", "3시간", "4시간"],
        },
        {
            id: "opt-level",
            name: "실력 수준",
            values: ["입문 (첫 스키)", "초급 (턴 가능)", "중급 (패럴럴)", "상급 (캐빙)"],
        },
    ],
};

export { INSTAGRAM_URL };
