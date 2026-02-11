'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main 
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#F5F5F8' }}
    >
      {/* 데스크톱 배경 효과 */}
      <div className="fixed inset-0 z-[-50] hidden tablet:block" style={{ backgroundColor: '#BFBFCA' }}></div>
      
      {/* 메인 컨테이너 */}
      <div className="relative flex justify-center overflow-x-hidden">
        <div className="flex w-full max-w-[473px] flex-col tablet:mt-[14px] tablet:rounded-t-[60px] tablet:ring-[14px] tablet:ring-[#F6F6F9] tablet:shadow-[0_10px_24px_0_rgba(0,0,0,0.08)]">
          <div className="m-auto flex min-h-screen w-full max-w-full flex-col overflow-hidden tablet:min-h-[calc(100dvh_-_14px)]">
            {/* 배경 블러 효과 */}
            <div className="fixed z-0 h-[150px] w-full -rotate-45 bg-white/10 blur-[50px] hidden tablet:block" style={{ left: '25%', top: '120%' }}></div>
            <div className="fixed z-0 h-[150px] w-full -rotate-45 bg-white/5 blur-[50px] hidden tablet:block" style={{ left: '25%', top: '120%' }}></div>
            
            {/* 메인 배경 */}
            <div className="fixed inset-0 z-[-2] mx-auto w-full max-w-full bg-cover bg-top" style={{ backgroundColor: '#F5F5F8' }}></div>
            
            {/* 콘텐츠 영역 */}
            <div className="relative flex h-full flex-1 flex-col">
              {/* 프로필 섹션 */}
              <div className="flex flex-col items-center space-y-5 pt-[63px] pb-5">
                <div className="relative flex w-full justify-center">
                  <div className="pt-[63px]">
                    <Image
                      src="https://cdn.litt.ly/images/HFIFx2gY5TZQmHi3Gl7ZN23jXgyUOjHi?s=180x180&f=webp"
                      alt="프로필"
                      width={100}
                      height={100}
                      className="h-[90px] w-[90px] tablet:h-[100px] tablet:w-[100px] rounded-full object-cover"
                    />
                  </div>
                </div>
                
                {/* 제목 및 서브타이틀 */}
                <div className="flex flex-col items-center space-y-2 px-5" style={{ color: '#000000' }}>
                  <div className="break-all">
                    <h1 className="text-lg font-semibold inline align-middle">스키강습 라이드올다이</h1>
                    <span className="ml-[3px] inline-flex align-middle">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5">
                        <path d="M17.915 9.99688L19.7112 8.23887C20.2467 7.73196 19.997 6.8311 19.2947 6.66314L16.8474 6.03853L17.5373 3.61607C17.7323 2.91927 17.0752 2.26205 16.3787 2.45705L13.957 3.14716L13.3326 0.699079C13.1674 0.00771269 12.2565 -0.245139 11.7574 0.282361L10 2.09259L8.24263 0.2824C7.74927 -0.239123 6.83454 -0.000178003 6.66743 0.699118L6.04306 3.1472L3.62137 2.45708C2.92461 2.26201 2.26782 2.91947 2.46274 3.61611L3.15262 6.03857L0.705352 6.66317C0.00269399 6.83118 -0.246486 7.7322 0.288749 8.23887L2.08504 9.99688L0.288749 11.7548C-0.246721 12.2618 0.00296751 13.1626 0.705313 13.3306L3.15258 13.9552L2.4627 16.3777C2.26774 17.0745 2.92477 17.7317 3.62133 17.5367L6.04298 16.8466L6.66736 19.2946C6.84076 20.0202 7.74923 20.2328 8.24255 19.7114L10 17.9144L11.7574 19.7114C12.2457 20.2382 13.1632 20.0038 13.3326 19.2946L13.957 16.8466L16.3786 17.5367C17.0753 17.7318 17.7322 17.0743 17.5373 16.3777L16.8474 13.9552L19.2946 13.3306C19.9973 13.1625 20.2464 12.2616 19.7112 11.7548L17.915 9.99688Z" fill="#4881F7"/>
                        <path d="M8.58888 13.4774L5.72887 10.6881C5.55705 10.5206 5.55705 10.2489 5.72887 10.0813L6.35111 9.4744C6.52294 9.30681 6.80155 9.30681 6.97337 9.4744L8.90001 11.3534L13.0267 7.32881C13.1985 7.16123 13.4771 7.16123 13.6489 7.32881L14.2712 7.93568C14.443 8.10325 14.443 8.37495 14.2712 8.54254L9.21114 13.4774C9.0393 13.645 8.76071 13.645 8.58888 13.4774Z" fill="white"/>
                      </svg>
                    </span>
                  </div>
                  <h2 className="inline whitespace-pre-wrap break-all text-center text-sm font-medium">
                    상위 1% 프리미엄 퀄리티 스키 · 보드강습
                  </h2>
                </div>
              </div>

              {/* 버튼 및 콘텐츠 섹션 */}
              <div className="flex flex-col">
                <div className="flex flex-col space-y-4 pb-[60px] tablet:pb-[83px]" style={{ color: '#000000' }}>
                  
                  {/* 스페이서 */}
                  <div className="px-5">
                    <div className="flex flex-col items-center justify-center" style={{ height: '10px' }}></div>
                  </div>

                  {/* 맞춤 상담 받기 버튼 */}
                  <div className="px-0">
                    <div className="px-5">
                      <Link 
                        href="http://rideordie.channel.io/" 
                        className="block h-full cursor-pointer overflow-hidden rounded-[14px] bg-white shadow-[0_2px_8px_0_rgba(23,29,46,0.08)]"
                      >
                        <div className="flex w-full rounded-[14px] bg-white">
                          <div className="relative flex flex-1 flex-col">
                            <Image
                              src="https://cdn.litt.ly/images/goBXLW1O6VPxaS5QtvkszjKyVToUZ5vK?s=600x100&m=outside&f=webp"
                              alt="맞춤 상담 받기"
                              width={600}
                              height={100}
                              className="w-full h-auto"
                            />
                            <div className="relative">
                              <div className="relative flex flex-col items-center space-y-1.5 p-5">
                                <div className="flex items-center justify-center">
                                  <h2 className="flex-1 whitespace-pre-wrap break-all text-center text-base font-semibold">
                                    맞춤 상담 받기 💁
                                  </h2>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* 지금 바로 예약하기 버튼 */}
                  <div className="px-0">
                    <div className="px-5">
                      <Link 
                        href="https://smartstore.naver.com/rideordieshop/products/11142639963" 
                        className="block h-full cursor-pointer overflow-hidden rounded-[14px] bg-white shadow-[0_2px_8px_0_rgba(23,29,46,0.08)]"
                      >
                        <div className="flex w-full rounded-[14px] bg-white">
                          <div className="relative flex flex-1 flex-col">
                            <Image
                              src="https://cdn.litt.ly/images/byerimTsU8mQv1xb5bPiuuRQ2i6piydM?s=600x100&m=outside&f=webp"
                              alt="지금 바로 예약하기"
                              width={600}
                              height={100}
                              className="w-full h-auto"
                            />
                            <div className="relative">
                              <div className="relative flex flex-col items-center space-y-1.5 p-5">
                                <div className="flex items-center justify-center">
                                  <h2 className="flex-1 whitespace-pre-wrap break-all text-center text-base font-semibold">
                                    지금 바로 예약하기 ⏰
                                  </h2>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="px-5">
                    <div className="flex flex-col items-center justify-center" style={{ height: '36px' }}>
                      <svg id="레이어_1" data-name="레이어 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 4" className="w-[52px]" style={{ color: 'rgba(0,0,0,0.3)' }} fill="currentColor">
                        <defs>
                          <style>{`.st0 { opacity: .3; }`}</style>
                        </defs>
                        <g className="st0">
                          <path d="M2.86,3.54c-.67,0-1.31-.27-1.78-.75l-.44-.44.71-.7.44.44c.3.3.7.46,1.12.45.42-.01.81-.2,1.09-.52l.5-.58c.95-1.11,2.84-1.11,3.79,0l.4.46c.57.66,1.71.67,2.28,0l.4-.46c.95-1.11,2.84-1.11,3.79,0l.4.46c.57.66,1.71.67,2.28,0l.4-.46c.95-1.11,2.84-1.11,3.79,0l.4.46c.29.33.7.52,1.14.52h0c.44,0,.85-.19,1.14-.52l.4-.46c.95-1.11,2.84-1.11,3.79,0l.4.46c.29.33.7.52,1.14.52h0c.44,0,.85-.19,1.14-.52l.4-.46c.95-1.11,2.84-1.11,3.79,0l.4.47c.29.33.7.52,1.14.52h0c.44,0,.85-.19,1.14-.52l.4-.46c.47-.55,1.17-.87,1.9-.87h0c.73,0,1.42.32,1.9.87l.4.47c.57.66,1.71.66,2.28,0l.4-.46c.48-.55,1.17-.87,1.9-.87h0c.73,0,1.42.32,1.9.87l.5.58c.28.32.66.51,1.09.52.46.02.82-.15,1.12-.45l.44-.44.71.7-.44.44c-.49.5-1.17.78-1.87.75-.7-.02-1.36-.34-1.81-.87l-.5-.58c-.28-.33-.7-.52-1.14-.52h0c-.44,0-.85.19-1.14.52l-.4.46c-.95,1.11-2.84,1.11-3.79,0l-.4-.47c-.29-.33-.7-.52-1.14-.52h0c-.44,0-.85.19-1.14.52l-.4.46c-.47.55-1.17.87-1.9.87h0c-.73,0-1.42-.32-1.9-.87l-.4-.47c-.57-.66-1.71-.66-2.28,0l-.4.46c-.48.55-1.17.87-1.9.87h0c-.73,0-1.42-.32-1.9-.87l-.4-.46c-.57-.67-1.71-.67-2.28,0l-.4.46c-.48.55-1.17.87-1.9.87h0c-.73,0-1.42-.32-1.9-.87l-.4-.46c-.57-.67-1.71-.67-2.28,0l-.4.46c-.95,1.11-2.84,1.11-3.79,0l-.4-.46c-.57-.67-1.71-.67-2.28,0l-.4.46c-.95,1.11-2.84,1.11-3.79,0l-.4-.46c-.57-.67-1.71-.67-2.28,0l-.5.58c-.46.53-1.12.85-1.81.87-.03,0-.06,0-.08,0Z"/>
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* 직접 봐야 아니까, 고객 후기 살펴보기 버튼 */}
                  <div className="px-0">
                    <div className="px-5">
                      <Link 
                        href="https://smartstore.naver.com/rideordieshop/products/11142639963" 
                        className="block h-full cursor-pointer overflow-hidden rounded-[14px] bg-white shadow-[0_2px_8px_0_rgba(23,29,46,0.08)]"
                      >
                        <div className="flex w-full rounded-[14px] bg-white">
                          <div className="relative flex flex-1 flex-col">
                            <div className="flex flex-col items-center justify-center space-y-1.5 px-5 py-4">
                              <h2 className="flex-1 whitespace-pre-wrap break-all text-center text-[15px] font-medium">
                                직접 봐야 아니까, 고객 후기 살펴보기 🔍
                              </h2>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* 나에게 맞는 커리큘럼 알아보기 버튼 */}
                  <div className="px-0">
                    <div className="px-5">
                      <Link 
                        href="https://smartstore.naver.com/rideordieshop/products/11142639963" 
                        className="block h-full cursor-pointer overflow-hidden rounded-[14px] bg-white shadow-[0_2px_8px_0_rgba(23,29,46,0.08)]"
                      >
                        <div className="flex w-full rounded-[14px] bg-white">
                          <div className="relative flex flex-1 flex-col">
                            <div className="flex flex-col items-center justify-center space-y-1.5 px-5 py-4">
                              <h2 className="flex-1 whitespace-pre-wrap break-all text-center text-[15px] font-medium">
                                나에게 맞는 커리큘럼 알아보기 ⛷️
                              </h2>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* SNS 링크 */}
                  <div className="px-5">
                    <div className="flex flex-col items-center space-y-[25px] py-5">
                      <div className="flex space-x-[34px]">
                        <Link 
                          href="http://pf.kakao.com/_xfWMxaG" 
                          target="_blank" 
                          rel="noopener"
                          className="cursor-pointer"
                          style={{ color: '#000000' }}
                        >
                          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center">
                            <svg className="h-[30px] w-[30px]" fill="currentColor" width="24" height="25" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19.1292 2.77848C16.1266 0.259421 12.6641 -0.490469 8.89441 0.298806C4.05359 1.31336 -0.316593 5.66304 0.0180466 11.7141C0.105145 13.2754 0.426032 14.7704 1.20075 16.1379C1.88989 17.3541 2.83422 18.3308 3.90995 19.1752C4.21556 19.4147 4.32711 19.6605 4.3103 20.0464C4.2996 20.3079 4.29502 20.5695 4.29502 20.831C4.29502 21.2674 4.30266 21.7037 4.30266 22.1401C4.30266 22.7167 4.29655 23.2917 4.30266 23.8683C4.30419 24.0605 4.30724 24.2527 4.31183 24.4434C4.31641 24.6324 4.37753 24.9081 4.50283 24.9806C4.61591 25.0467 4.88026 24.9317 5.02695 24.823C6.33036 23.8431 7.62003 22.8443 8.92344 21.8644C9.04874 21.7715 9.24739 21.7384 9.40783 21.7494C9.77761 21.7731 10.1443 21.8597 10.5141 21.8833C13.7643 22.0929 16.7088 21.2453 19.2285 19.0744C21.4778 17.1367 22.8118 14.6538 22.9829 11.6165C23.1861 8.00723 21.8277 5.04076 19.1322 2.78006L19.1292 2.77848ZM6.25396 13.3589C7.17078 13.9102 8.12275 13.9039 9.04874 13.3494C9.48117 13.091 9.79289 12.7066 9.96709 12.223C10.0343 12.0355 10.126 11.9788 10.3124 11.9851C10.7494 11.9993 11.188 11.9898 11.6281 11.9898C11.4233 13.8961 9.54382 15.4494 7.60169 15.3502C5.13086 15.2241 3.39042 13.4613 3.36445 11.0619C3.33847 8.5854 4.99333 6.72958 7.38165 6.55314C9.47812 6.39875 11.3744 7.88907 11.6418 9.956C11.1528 9.956 10.6914 9.96545 10.233 9.94655C10.155 9.94339 10.0496 9.82997 10.0114 9.74332C9.47201 8.483 8.40238 7.92058 7.03173 8.18525C5.83681 8.41683 5.00403 9.44872 4.94596 10.7516C4.89554 11.8843 5.29894 12.787 6.25396 13.3604V13.3589ZM18.5745 15.1517H17.1152C17.1152 14.9862 17.1152 14.8382 17.1152 14.6916C17.1152 13.6913 17.1198 12.6909 17.1122 11.6905C17.1061 10.8713 16.721 10.4333 16.0028 10.4003C15.2144 10.364 14.6796 10.7988 14.6368 11.607C14.5848 12.6279 14.6001 13.6519 14.5863 14.6759C14.5848 14.824 14.5863 14.9736 14.5863 15.1469H13.1362C13.1301 15.0398 13.1194 14.928 13.1194 14.8177C13.1194 12.2009 13.124 9.58263 13.1118 6.96589C13.1103 6.64609 13.2142 6.55944 13.4999 6.58149C13.7581 6.60197 14.0194 6.59725 14.2777 6.58149C14.5115 6.56889 14.594 6.65869 14.5909 6.90288C14.5802 7.76304 14.5863 8.62479 14.5879 9.48495C14.5879 9.56372 14.6001 9.64249 14.6093 9.75435C14.6673 9.72756 14.7116 9.72126 14.7361 9.69448C15.4482 8.89418 16.3344 8.80438 17.2467 9.15727C18.1421 9.50228 18.5516 10.2727 18.5684 11.2384C18.5898 12.5286 18.5745 13.8189 18.5745 15.1517Z" fill="currentColor"/>
                            </svg>
                          </div>
                        </Link>
                        <Link 
                          href="https://www.instagram.com/rideordie.ski/" 
                          target="_blank" 
                          rel="noopener"
                          className="cursor-pointer"
                          style={{ color: '#000000' }}
                        >
                          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center">
                            <svg className="h-[30px] w-[30px]" fill="currentColor" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.0027 5.8467C8.59743 5.8467 5.85075 8.594 5.85075 12C5.85075 15.406 8.59743 18.1533 12.0027 18.1533C15.4079 18.1533 18.1546 15.406 18.1546 12C18.1546 8.594 15.4079 5.8467 12.0027 5.8467ZM12.0027 16.0004C9.80212 16.0004 8.00312 14.2064 8.00312 12C8.00312 9.7936 9.79677 7.99955 12.0027 7.99955C14.2086 7.99955 16.0022 9.7936 16.0022 12C16.0022 14.2064 14.2032 16.0004 12.0027 16.0004ZM19.8412 5.595C19.8412 6.39295 19.1987 7.03024 18.4062 7.03024C17.6085 7.03024 16.9713 6.38759 16.9713 5.595C16.9713 4.80241 17.6138 4.15977 18.4062 4.15977C19.1987 4.15977 19.8412 4.80241 19.8412 5.595ZM23.9157 7.05166C23.8247 5.12909 23.3856 3.42608 21.9775 2.02298C20.5747 0.619882 18.8721 0.180743 16.9499 0.0843468C14.9689 -0.0281156 9.03112 -0.0281156 7.05008 0.0843468C5.1333 0.175388 3.43068 0.614526 2.02253 2.01763C0.614389 3.42073 0.180703 5.12373 0.0843279 7.0463C-0.0281093 9.02778 -0.0281093 14.9669 0.0843279 16.9483C0.175349 18.8709 0.614389 20.5739 2.02253 21.977C3.43068 23.3801 5.12794 23.8193 7.05008 23.9157C9.03112 24.0281 14.9689 24.0281 16.9499 23.9157C18.8721 23.8246 20.5747 23.3855 21.9775 21.977C23.3803 20.5739 23.8193 18.8709 23.9157 16.9483C24.0281 14.9669 24.0281 9.03314 23.9157 7.05166ZM21.3564 19.0744C20.9388 20.1241 20.1303 20.9327 19.0755 21.3558C17.496 21.9824 13.7481 21.8378 12.0027 21.8378C10.2572 21.8378 6.50396 21.977 4.92984 21.3558C3.88042 20.9381 3.07195 20.1294 2.64897 19.0744C2.02253 17.4946 2.16709 13.7458 2.16709 12C2.16709 10.2542 2.02789 6.50006 2.64897 4.92558C3.06659 3.87593 3.87507 3.06728 4.92984 2.6442C6.50931 2.01763 10.2572 2.16222 12.0027 2.16222C13.7481 2.16222 17.5014 2.02298 19.0755 2.6442C20.1249 3.06192 20.9334 3.87058 21.3564 4.92558C21.9828 6.50541 21.8383 10.2542 21.8383 12C21.8383 13.7458 21.9828 17.4999 21.3564 19.0744Z" fill="currentColor"/>
                            </svg>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
