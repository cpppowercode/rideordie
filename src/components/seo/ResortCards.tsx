import Link from "next/link";
import { RESORT_LANDINGS } from "@/lib/resort-landings";

export function ResortCards() {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
      {RESORT_LANDINGS.map((row) => (
        <li key={row.slug}>
          <Link
            href={`/resorts/${row.slug}`}
            className="flex h-full flex-col rounded-[20px] border border-line bg-white px-5 py-6 transition-colors hover:border-brand hover:bg-ice"
            data-testid={`resort-index-${row.slug}`}
          >
            <span className="text-[18px] font-bold tracking-tight">{row.shortName}</span>
            <span className="mt-1 text-[14px] text-muted">어린이 스키·보드강습</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
