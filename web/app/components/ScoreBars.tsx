const AXES = [
  { key: "offer" as const, label: "Offre" },
  { key: "company" as const, label: "Compagnie" },
  { key: "intent" as const, label: "Intent · Sillage", sillage: true },
  { key: "zone" as const, label: "Zone" },
];

export function ScoreBars({
  offer,
  company,
  intent,
  zone,
}: {
  offer: number;
  company: number;
  intent: number;
  zone: number;
}) {
  const vals = { offer, company, intent, zone };
  return (
    <div className="flex flex-col gap-1.5">
      {AXES.map((a) => (
        <div key={a.key} className="flex items-center gap-2">
          <span className={`w-[92px] shrink-0 text-[11px] ${a.sillage ? "font-medium text-warm" : "text-stone"}`}>{a.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full" style={{ width: `${vals[a.key]}%`, background: a.sillage ? "var(--color-warm)" : "var(--color-ink)", opacity: a.sillage ? 1 : 0.72 }} />
          </div>
          <span className="w-6 shrink-0 text-right font-mono text-[11px] text-stone">{vals[a.key]}</span>
        </div>
      ))}
    </div>
  );
}
