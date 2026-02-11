export const PRODUCT_DATA = {
    id: "ski-lesson-premium",
    title: "[RideOrDie] Premium 1:1 Ski Lesson | Professional Coaching",
    price: 150000,
    originalPrice: 200000,
    discountRate: 25,
    description: "Experience the best ski coaching with our certified instructors. Beginner to Advanced levels available.",
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
            name: "Course Type",
            values: ["1:1 Private Lesson", "2:1 Partner Lesson", "Group Lesson (Max 4)"],
        },
        {
            id: "opt-duration",
            name: "Duration",
            values: ["2 Hours (Morning)", "2 Hours (Afternoon)", "4 Hours (Full Day)"],
        },
        {
            id: "opt-level",
            name: "Skill Level",
            values: ["Beginner (First Time)", "Novice (Can Turn)", "Intermediate (Parallel)", "Advanced (Carving)"],
        },
    ],
};

export const REVIEWS = [
    {
        id: 1,
        user: "rider_01",
        rating: 5,
        date: "2024-01-15",
        content: "Absolutely the best lesson I've ever had. The instructor was super patient and detailed.",
        image: null,
    },
    {
        id: 2,
        user: "snow_lover",
        rating: 4,
        date: "2024-01-10",
        content: "Great technical advice, but the weather was a bit harsh. Still learned a lot!",
        image: null,
    },
    {
        id: 3,
        user: "beginner_kim",
        rating: 5,
        date: "2024-01-05",
        content: "From falling every 5 seconds to linking turns in one session. Highly recommend!",
        image: null,
    },
];
