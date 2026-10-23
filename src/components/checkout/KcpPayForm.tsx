"use client";

import { useEffect, useRef } from "react";
import {
  KCP_PAY_METHODS,
  kcpHubScriptUrl,
  kcpSiteCd,
  kcpSiteName,
  type KcpPayMethod,
} from "@/lib/kcp-public";

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
  successPath?: string;
  failPath?: string;
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
  successPath = "/checkout/success",
  failPath = "/checkout/fail",
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
        const fail = new URL(failPath, window.location.origin);
        fail.searchParams.set("orderId", ordrId || orderId);
        fail.searchParams.set("code", resCd || "FAIL");
        fail.searchParams.set("message", resMsg || "결제가 취소되었거나 실패했습니다.");
        window.location.href = fail.toString();
        closeEvent?.();
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
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "결제 승인에 실패했습니다.");
          const amountValue = data.payment?.totalAmount ?? amount;
          const tno = data.payment?.tno || "";
          const success = new URL(successPath, window.location.origin);
          success.searchParams.set("orderId", ordrId || orderId);
          success.searchParams.set("amount", String(amountValue));
          success.searchParams.set("tno", tno);
          window.location.href = success.toString();
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "결제 승인에 실패했습니다.";
          const fail = new URL(failPath, window.location.origin);
          fail.searchParams.set("orderId", ordrId || orderId);
          fail.searchParams.set("code", "APPROVE_FAIL");
          fail.searchParams.set("message", message);
          window.location.href = fail.toString();
        });
    };

    if (document.querySelector("script[data-kcp-hub]")) return;

    const script = document.createElement("script");
    script.src = kcpHubScriptUrl();
    script.async = true;
    script.dataset.kcpHub = "true";
    document.body.appendChild(script);
  }, [amount, failPath, method.payType, orderId, successPath]);

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
