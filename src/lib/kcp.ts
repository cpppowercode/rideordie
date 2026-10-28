import { kcpSiteCd, isKcpProduction } from "@/lib/kcp-public";

export {
  KCP_PAY_METHODS,
  KCP_SHOP_NAME,
  expectedPayAmount,
  isKcpProduction,
  isMobileUserAgent,
  kcpHubScriptUrl,
  kcpSiteCd,
  kcpSiteName,
  type KcpPayMethod,
} from "@/lib/kcp-public";

function isServerKcpProduction() {
  if (process.env.KCP_ENV) return process.env.KCP_ENV === "production";
  return isKcpProduction();
}

export function kcpApproveUrl() {
  return isServerKcpProduction()
    ? "https://spl.kcp.co.kr/gw/enc/v1/payment"
    : "https://stg-spl.kcp.co.kr/gw/enc/v1/payment";
}

export function kcpRegisterUrl() {
  return isServerKcpProduction()
    ? "https://smpay.kcp.co.kr/trade/register.do"
    : "https://testsmpay.kcp.co.kr/trade/register.do";
}

export function serializeKcpCert(raw: string) {
  return raw.replace(/\r?\n/g, "").trim();
}

export function kcpCertInfo() {
  const cert = process.env.KCP_CERT_INFO?.trim();
  if (!cert) {
    throw new Error("KCP 서비스 인증서(KCP_CERT_INFO)가 없습니다. 파트너관리자에서 PEM을 받아 환경변수에 넣어 주세요.");
  }
  return serializeKcpCert(cert);
}

export function toKcpPayType(method: string): string {
  if (method === "BANK" || method.startsWith("010") || method === "PABK") return "PABK";
  if (method === "MOBX" || method.startsWith("000010") || method === "PAMC") return "PAMC";
  return "PACA";
}

export async function approveKcpPayment(input: {
  enc_data: string;
  enc_info: string;
  tran_cd: string;
  orderId: string;
  amount: number;
  payType: string;
}) {
  const body = {
    site_cd: kcpSiteCd(),
    kcp_cert_info: kcpCertInfo(),
    enc_data: input.enc_data,
    enc_info: input.enc_info,
    tran_cd: input.tran_cd,
    ordr_mony: String(input.amount),
    pay_type: input.payType,
    ordr_no: input.orderId,
    ordr_idxx: input.orderId,
  };

  const response = await fetch(kcpApproveUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Accept-Charset": "UTF-8",
    },
    body: JSON.stringify(body),
  });

  const payment = (await response.json()) as {
    res_cd?: string;
    res_msg?: string;
    tno?: string;
    amount?: string | number;
    pay_method?: string;
    card_name?: string;
    app_no?: string;
  };

  if (payment.res_cd !== "0000") {
    throw new Error(payment.res_msg || `KCP 결제 승인에 실패했습니다. (${payment.res_cd || "unknown"})`);
  }

  if (!payment.tno) {
    throw new Error("KCP 거래번호가 없어 결제를 확인할 수 없습니다.");
  }
  const approvedAmount = Number(payment.amount);
  if (payment.amount === undefined || payment.amount === "" || !Number.isFinite(approvedAmount) || approvedAmount !== input.amount) {
    throw new Error("결제 금액이 주문 금액과 다릅니다.");
  }

  return payment;
}
