import { PRODUCT_DATA } from "@/lib/mockData";

export const KCP_SHOP_NAME = "라이드올다이";

export const KCP_PAY_METHODS = {
  card: { pc: "100000000000", mobile: "CARD", payType: "PACA", label: "신용카드" },
  bank: { pc: "010000000000", mobile: "BANK", payType: "PABK", label: "계좌이체" },
} as const;

export type KcpPayMethod = keyof typeof KCP_PAY_METHODS;

export function kcpSiteCd() {
  return (process.env.NEXT_PUBLIC_KCP_SITE_CD || "T0000").trim();
}

export function kcpSiteName() {
  return (process.env.NEXT_PUBLIC_KCP_SITE_NAME || KCP_SHOP_NAME).trim();
}

export function isKcpProduction() {
  if (process.env.NEXT_PUBLIC_KCP_ENV) {
    return process.env.NEXT_PUBLIC_KCP_ENV === "production";
  }
  return kcpSiteCd() !== "T0000";
}

export function kcpHubScriptUrl() {
  return isKcpProduction()
    ? "https://spay.kcp.co.kr/plugin/kcp_spay_hub.js"
    : "https://testspay.kcp.co.kr/plugin/kcp_spay_hub.js";
}

export function expectedPayAmount() {
  return PRODUCT_DATA.price;
}

export function isMobileUserAgent(ua: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
}
