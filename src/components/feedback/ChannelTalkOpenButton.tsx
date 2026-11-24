"use client";

type ChannelTalkOpenButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

/** 주니어 안내 등에서 채널톡 메신저를 연다. 플러그인이 없으면 조용히 무시. */
export function ChannelTalkOpenButton({
  className = "fb-btn-ghost",
  children = "채널톡 상담",
}: ChannelTalkOpenButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        try {
          const ch = (window as Window & { ChannelIO?: (...args: unknown[]) => void })
            .ChannelIO;
          ch?.("showMessenger");
        } catch {
          // no-op
        }
      }}
    >
      {children}
    </button>
  );
}
