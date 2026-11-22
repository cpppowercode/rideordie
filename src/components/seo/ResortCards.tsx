import Link from "next/link";
import { RESORT_LANDINGS } from "@/lib/resort-landings";

// Lift-ticket tag: the one signature detail, used for resort names only.
export function ResortCards() {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
      {RESORT_LANDINGS.map((row) => (
        <li key={row.slug}>
          <Link
            href={`/resorts/${row.slug}`}
            className="group relative flex h-full flex-col rounded-[12px] border border-line bg-white transition-colors duration-150 hover:border-ink/30"
            data-testid={`resort-index-${row.slug}`}
          >
            <span className="px-5 pb-4 pt-5 text-[18px] font-semibold">{row.shortName}</span>
            <span className="relative border-t border-dashed border-line px-5 pb-5 pt-3 text-[14px] text-muted">
              <span aria-hidden className="absolute -left-[7px] -top-[6px] h-3 w-3 rounded-full border border-line bg-white [clip-path:inset(0_0_0_50%)]" />
              <span aria-hidden className="absolute -right-[7px] -top-[6px] h-3 w-3 rounded-full border border-line bg-white [clip-path:inset(0_50%_0_0)]" />
              어린이 스키·보드강습
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
