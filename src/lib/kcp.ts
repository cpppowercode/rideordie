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

/**
 * KCP 개발자센터에 공개된 T0000 테스트 서비스 인증서.
 * 라이브는 KCP_CERT_INFO(운영 PEM) + NEXT_PUBLIC_KCP_SITE_CD 만 바꾸면 됩니다.
 */
const KCP_T0000_TEST_CERT =
  "-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----";

export function kcpCertInfo() {
  const cert = process.env.KCP_CERT_INFO?.trim();
  if (cert) return serializeKcpCert(cert);
  if (kcpSiteCd() === "T0000" && !isServerKcpProduction()) {
    return serializeKcpCert(KCP_T0000_TEST_CERT);
  }
  throw new Error("KCP 서비스 인증서(KCP_CERT_INFO)가 없습니다. 파트너관리자에서 PEM을 받아 환경변수에 넣어 주세요.");
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

  const approvedAmount = Number(payment.amount);
  if (Number.isFinite(approvedAmount) && approvedAmount !== input.amount) {
    throw new Error("결제 금액이 주문 금액과 다릅니다.");
  }

  return payment;
}
