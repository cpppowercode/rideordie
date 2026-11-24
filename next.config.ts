import type { NextConfig } from "next";
import { guestProxyRewrites } from "./src/lib/guest-proxy";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.litt.ly',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shop-phinf.pstatic.net',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 손님 경로·API·admin 자산만 admin으로 rewrite (Multi-Zones, microfrontends 아님)
  async rewrites() {
    return guestProxyRewrites();
  },

  async headers() {
    const noStore = [
      { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
    ];
    return [
      { source: "/my-lesson/:path*", headers: noStore },
      { source: "/e-contract/:path*", headers: noStore },
      { source: "/api/e-contract/:path*", headers: noStore },
      { source: "/api/client-errors", headers: noStore },
      { source: "/api/admin-profile", headers: noStore },
    ];
  },
};

export default nextConfig;
