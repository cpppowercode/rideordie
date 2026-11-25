import { FEEDBACK_SERVICE_PREPARING_MESSAGE } from "@/lib/customer-feedback/messages";

export function ServicePreparing() {
  return (
    <div className="fb-card-elevated p-6 text-center">
      <p className="text-[18px] font-semibold text-[var(--fb-text)]">
        {FEEDBACK_SERVICE_PREPARING_MESSAGE}
      </p>
      <p className="mt-2 text-[14px] text-[var(--fb-text-secondary)]">
        곧 이용하실 수 있어요. 잠시 후 다시 확인해 주세요.
      </p>
    </div>
  );
}
