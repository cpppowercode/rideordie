import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-secondary/30 mt-auto">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <span className="text-lg font-bold tracking-tighter uppercase bg-black text-white px-2 py-1">
                            RideOrDie
                        </span>
                        <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                            하이원 리조트 기반 프리미엄 스키·스노보드 강습. <br />
                            스키를 가르치는 게 아니라, 라이딩을 가르칩니다.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">고객센터</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>1833-8226</li>
                            <li>연중 무휴</li>
                            <li>
                                <a href="mailto:contact@rideordie.kr" className="hover:underline">contact@rideordie.kr</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">회사 정보</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>대표: 김대일 (Daeil Kim)</li>
                            <li>사업자등록번호: 8218603636</li>
                            <li>주소: 강원특별자치도 태백시 (하이원 리조트)</li>
                            <li>
                                <Link href="/service-policy" className="hover:underline">서비스 이용약관</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} RideOrDie. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
