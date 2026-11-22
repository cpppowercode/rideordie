const BADGES = [
  "공인 강사 · 응급처치 교육 이수",
  "강습보험 적용",
] as const;

export function TrustBadges({ className = "", onImage = false }: { className?: string; onImage?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-[15px] ${onImage ? "text-white/80" : "text-muted"} ${className}`.trim()}>
      {BADGES.map((label) => (
        <li key={label} className="flex items-center gap-2">
          <span aria-hidden className={`h-1 w-1 rounded-full ${onImage ? "bg-white/60" : "bg-brand"}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}
