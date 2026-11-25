"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch("/api/feedback/logout", { method: "POST" });
      router.replace("/feedback");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="fb-btn-ghost text-[13px]"
    >
      {pending ? "로그아웃…" : "로그아웃"}
    </button>
  );
}
