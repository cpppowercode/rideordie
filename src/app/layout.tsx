import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "RideOrDie | 프리미엄 스키 강습",
  description: "하이원 리조트 기반 프리미엄 스키·스노보드 강습",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 채널톡 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var w = window;
                if (w.ChannelIO) {
                  return (window.console.error || window.console.log || function(){})('ChannelIO script included twice.');
                }
                var ch = function() {
                  ch.c(arguments);
                };
                ch.q = [];
                ch.c = function(args) {
                  ch.q.push(args);
                };
                w.ChannelIO = ch;
                function l() {
                  if (w.ChannelIOInitialized) {
                    return;
                  }
                  w.ChannelIOInitialized = true;
                  var s = document.createElement('script');
                  s.type = 'text/javascript';
                  s.async = true;
                  s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
                  s.charset = 'UTF-8';
                  var x = document.getElementsByTagName('script')[0];
                  x.parentNode.insertBefore(s, x);
                }
                if (document.readyState === 'complete') {
                  l();
                } else if (window.attachEvent) {
                  window.attachEvent('onload', l);
                } else {
                  window.addEventListener('DOMContentLoaded', l, false);
                  window.addEventListener('load', l, false);
                }
              })();
              
              // 환경 변수에서 플러그인 키 가져오기
              var pluginKey = '${process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY || 'YOUR_CHANNEL_TALK_PLUGIN_KEY'}';
              
              if (pluginKey && pluginKey !== 'YOUR_CHANNEL_TALK_PLUGIN_KEY') {
                ChannelIO('boot', {
                  "pluginKey": pluginKey
                });
              }
            `,
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
