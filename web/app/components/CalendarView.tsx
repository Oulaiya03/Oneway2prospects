"use client";

import type { Rdv } from "@/lib/mock";
import { ChevronRight } from "./icons";

const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const LEADING = 2; // juillet 2026 commence un mercredi (Mon-first → 2 cases vides)
const DAYS = 31;

function domOf(r: Rdv) {
  return parseInt(r.dayShort.match(/\d+/)?.[0] ?? "0", 10);
}

export function CalendarView({ rdvs, onSelectRdv }: { rdvs: Rdv[]; onSelectRdv: (id: string) => void }) {
  const byDay = new Map<number, Rdv[]>();
  rdvs.forEach((r) => {
    const d = domOf(r);
    byDay.set(d, [...(byDay.get(d) ?? []), r]);
  });

  const cells: (number | null)[] = [
    ...Array.from({ length: LEADING }, () => null),
    ...Array.from({ length: DAYS }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h3 className="text-[15px] font-semibold text-ink">Juillet 2026</h3>
        <div className="flex items-center gap-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-faint opacity-40" aria-hidden>
            <ChevronRight width={16} height={16} className="rotate-180" />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-faint opacity-40" aria-hidden>
            <ChevronRight width={16} height={16} />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line bg-raised">
        {DOW.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-faint">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const weekend = i % 7 >= 5;
          const items = day ? byDay.get(day) ?? [] : [];
          return (
            <div
              key={i}
              className={`min-h-[92px] border-b border-r border-line p-1.5 [&:nth-child(7n)]:border-r-0 ${
                weekend ? "bg-raised/50" : ""
              }`}
            >
              {day && (
                <>
                  <div className="mb-1 px-1 text-[12px] font-medium text-stone">{day}</div>
                  <div className="flex flex-col gap-1">
                    {items.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => onSelectRdv(r.id)}
                        className="w-full truncate rounded-md bg-pine-soft px-1.5 py-1 text-left text-[11px] font-medium text-pine transition-colors hover:bg-pine hover:text-white"
                      >
                        <span className="font-mono">{r.time}</span> {r.company.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
