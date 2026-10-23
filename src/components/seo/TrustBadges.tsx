const BADGES = [
  "공인 강사 · 응급처치 교육 이수",
  "강습보험 적용",
] as const;

export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {BADGES.map((label) => (
        <li
          key={label}
          className="rounded-full bg-ice px-3 py-1.5 text-[13px] font-semibold text-brand"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
