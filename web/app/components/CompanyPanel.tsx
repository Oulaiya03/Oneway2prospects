"use client";

import type { CompanyInfo } from "@/lib/mock";
import { ExternalLink, TrendingUp, Users, MapPin, Calendar2, Bolt, Building } from "./icons";

export function CompanyPanel({ company }: { company: CompanyInfo }) {
  const figures = [
    { label: "Chiffre d'affaires", value: `${company.caM} M€`, Icon: Building },
    { label: "Croissance / an", value: `+${company.growthPct}%`, Icon: TrendingUp, accent: true },
    { label: "Effectif", value: String(company.employees), Icon: Users },
    { label: "Financement", value: company.funding, Icon: Bolt, small: true },
    { label: "Création", value: String(company.founded), Icon: Calendar2 },
    { label: "Siège", value: company.hq, Icon: MapPin, small: true },
  ];

  return (
    <div className="card overflow-hidden">
      {/* En-tête */}
      <div className="flex items-start gap-3.5 border-b border-line px-5 py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pine text-[20px] font-semibold text-white">
          {company.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[19px] font-semibold tracking-tight text-ink">{company.name}</h2>
            <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-stone">{company.sector}</span>
          </div>
          <div className="mt-0.5 text-[13px] text-stone">{company.activity}</div>
        </div>
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 font-mono text-[12px] text-pine transition-colors hover:border-pine/40 hover:bg-pine-soft"
        >
          {company.website.replace("https://", "")}
          <ExternalLink width={13} height={13} />
        </a>
      </div>

      <div className="px-5 py-4">
        <p className="mb-4 max-w-2xl text-[13.5px] leading-relaxed text-stone">{company.description}</p>

        {/* Chiffres */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {figures.map((f) => (
            <div key={f.label} className="rounded-xl border border-line bg-raised px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-faint">
                <f.Icon width={13} height={13} className={f.accent ? "text-pine" : "text-faint"} />
                <span className="text-[11px]">{f.label}</span>
              </div>
              <div className={`mt-1 font-semibold text-ink ${f.small ? "text-[14px]" : "text-[20px] leading-none"} ${f.accent ? "text-pine" : ""}`}>
                {f.value}
              </div>
            </div>
          ))}
        </div>

        {/* Focus */}
        <div className="mt-5">
          <div className="eyebrow mb-2 text-faint">Ce sur quoi ils sont</div>
          <div className="flex flex-wrap gap-1.5">
            {company.focus.map((t) => (
              <span key={t} className="rounded-md border border-line bg-paper px-2.5 py-1 text-[12px] text-ink">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Contacts clés */}
        <div className="mt-5">
          <div className="eyebrow mb-2 text-faint">Contacts clés</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {company.contacts.map((c) => (
              <div key={c.name} className="flex items-center gap-2.5 rounded-xl border border-line bg-raised px-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-paper">
                  {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[13px] font-medium text-ink">{c.name}</div>
                  <div className="truncate text-[11.5px] text-stone">{c.role}</div>
                </div>
                {c.note && (
                  <span className="ml-auto shrink-0 rounded-full bg-pine-soft px-1.5 py-0.5 text-[10px] font-medium text-pine">
                    {c.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
