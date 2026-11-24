import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.litt.ly",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shop-phinf.pstatic.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // KCP·채널톡 호환: 전체 CSP 대신 frame-ancestors 만
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
