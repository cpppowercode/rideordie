"use client";

import { useEffect, useRef } from "react";
import {
  KCP_PAY_METHODS,
  kcpHubScriptUrl,
  kcpSiteCd,
  kcpSiteName,
  type KcpPayMethod,
} from "@/lib/kcp-public";
import { PENDING_BOOKING_KEY } from "@/lib/pending-booking";

type Props = {
  orderId: string;
  goodName: string;
  amount: number;
  buyerName: string;
  buyerPhone: string;
  payMethod: KcpPayMethod;
  approvalKey?: string;
  payUrl?: string;
  retUrl?: string;
  /** 서버가 서명한 예약 정보. 결제 승인 때 함께 보내 서버가 검증한다. */
  intent?: string;
  /** 결제 실패·취소·승인 실패 때 호출. 예약은 접수되지 않는다. */
  onFail?: (message: string) => void;
};

export function KcpPayForm({
  orderId,
  goodName,
  amount,
  buyerName,
  buyerPhone,
  payMethod,
  approvalKey,
  payUrl,
  retUrl,
  intent,
  onFail,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const method = KCP_PAY_METHODS[payMethod];

  useEffect(() => {
    window.m_Completepayment = (formOrJson, closeEvent) => {
      const form = formRef.current;
      if (!form) {
        closeEvent?.();
        return;
      }

      if (typeof window.GetField === "function") {
        window.GetField(form, formOrJson);
      }

      const resCd = (form.elements.namedItem("res_cd") as HTMLInputElement | null)?.value;
      const resMsg = (form.elements.namedItem("res_msg") as HTMLInputElement | null)?.value;
      const encData = (form.elements.namedItem("enc_data") as HTMLInputElement | null)?.value;
      const encInfo = (form.elements.namedItem("enc_info") as HTMLInputElement | null)?.value;
      const tranCd = (form.elements.namedItem("tran_cd") as HTMLInputElement | null)?.value;
      const ordrId = (form.elements.namedItem("ordr_idxx") as HTMLInputElement | null)?.value;

      if (resCd !== "0000") {
        closeEvent?.();
        onFail?.(`[${resCd || "FAIL"}] ${resMsg || "결제가 취소되었거나 실패했습니다."}`);
        return;
      }

      fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enc_data: encData,
          enc_info: encInfo,
          tran_cd: tranCd,
          orderId: ordrId,
          payMethod: method.payType,
          intent,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "결제 승인에 실패했습니다.");
          try {
            window.sessionStorage.removeItem(PENDING_BOOKING_KEY);
          } catch {
            // ignore
          }
          window.location.href = `/book/success?r=${encodeURIComponent(data.receipt)}`;
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "결제 승인에 실패했습니다.";
          closeEvent?.();
          onFail?.(message);
        });
    };

    if (document.querySelector("script[data-kcp-hub]")) return;

    const script = document.createElement("script");
    script.src = kcpHubScriptUrl();
    script.async = true;
    script.dataset.kcpHub = "true";
    document.body.appendChild(script);
  }, [amount, method.payType, orderId, intent, onFail]);

  return (
    <form ref={formRef} name="order_info" method="post" acceptCharset="euc-kr">
      <input type="hidden" name="site_cd" defaultValue={kcpSiteCd()} />
      <input type="hidden" name="site_name" defaultValue={kcpSiteName()} />
      <input type="hidden" name="shop_name" defaultValue={kcpSiteName()} />
      <input type="hidden" name="pay_method" defaultValue={payUrl ? method.mobile : method.pc} />
      <input type="hidden" name="currency" defaultValue="410" />
      <input type="hidden" name="ordr_idxx" defaultValue={orderId} />
      <input type="hidden" name="good_name" defaultValue={goodName} />
      <input type="hidden" name="good_mny" defaultValue={String(amount)} />
      <input type="hidden" name="good_cd" defaultValue="00" />
      <input type="hidden" name="buyr_name" defaultValue={buyerName} />
      <input type="hidden" name="buyr_tel2" defaultValue={buyerPhone} />
      <input type="hidden" name="shop_user_id" defaultValue={buyerPhone.replace(/\D/g, "") || orderId} />
      <input type="hidden" name="quotaopt" defaultValue="12" />
      {approvalKey ? <input type="hidden" name="approval_key" defaultValue={approvalKey} /> : null}
      {payUrl ? <input type="hidden" name="PayUrl" defaultValue={payUrl} /> : null}
      {retUrl ? <input type="hidden" name="Ret_URL" defaultValue={retUrl} /> : null}
      <input type="hidden" name="res_cd" defaultValue="" />
      <input type="hidden" name="res_msg" defaultValue="" />
      <input type="hidden" name="enc_info" defaultValue="" />
      <input type="hidden" name="enc_data" defaultValue="" />
      <input type="hidden" name="tran_cd" defaultValue="" />
    </form>
  );
}

export function executeKcpPay(form: HTMLFormElement, payUrl?: string) {
  if (payUrl) {
    form.action = `${payUrl.substring(0, payUrl.lastIndexOf("/"))}/jsp/encodingFilter/encodingFilter.jsp`;
    form.submit();
    return;
  }

  try {
    window.KCP_Pay_Execute_Web?.(form);
  } catch {
    // KCP는 결제창 정상 종료 시에도 throw 합니다.
  }
}
