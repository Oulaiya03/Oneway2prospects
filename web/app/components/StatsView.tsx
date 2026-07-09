"use client";

import { statKpis, funnel, touchPerf, campaignRows } from "@/lib/mock";
import { TrendingUp, BarChart } from "./icons";

function Kpi({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="card p-4">
      <div className="text-[12px] text-stone">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-tight text-ink">{value}</span>
        <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-pine">
          <TrendingUp width={12} height={12} />
          {delta}
        </span>
      </div>
    </div>
  );
}

export function StatsView() {
  const top = funnel[0].value;
  const maxTouch = Math.max(...touchPerf.map((t) => t.responses));

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10 md:py-10">
      <header className="anim-fadeup mb-7">
        <h1 className="text-[24px] font-semibold tracking-tight text-ink">Statistiques de campagne</h1>
        <p className="mt-1 text-[14px] text-stone">Performance de la prise de contact · 30 derniers jours</p>
      </header>

      {/* KPIs */}
      <div className="anim-fadeup mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ animationDelay: "50ms" }}>
        {statKpis.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} delta={k.delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Entonnoir */}
        <section className="anim-fadeup card p-5" style={{ animationDelay: "100ms" }}>
          <h2 className="mb-1 text-[15px] font-semibold text-ink">Entonnoir de conversion</h2>
          <p className="mb-4 text-[12.5px] text-stone">Du premier contact au RDV pris</p>
          <div className="flex flex-col gap-3">
            {funnel.map((f, i) => {
              const pct = Math.round((f.value / top) * 100);
              const conv = i > 0 ? Math.round((f.value / funnel[i - 1].value) * 100) : null;
              return (
                <div key={f.stage}>
                  <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
                    <span className="font-medium text-ink">{f.stage}</span>
                    <span className="font-mono text-stone">
                      {f.value}
                      <span className="ml-1.5 text-faint">{pct}%</span>
                    </span>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-line"
                    title={`${f.stage} : ${f.value}`}
                  >
                    <div className="h-full rounded-full bg-pine transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  {conv !== null && (
                    <div className="mt-1 text-[11px] text-faint">↳ {conv}% depuis l&apos;étape précédente</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Réponses par touche */}
        <section className="anim-fadeup card p-5" style={{ animationDelay: "150ms" }}>
          <h2 className="mb-1 text-[15px] font-semibold text-ink">Réponses par touche</h2>
          <p className="mb-4 text-[12.5px] text-stone">Quelle étape de la cadence génère les réponses</p>
          <div className="flex flex-col gap-3.5">
            {touchPerf.map((t) => {
              const pct = Math.round((t.responses / maxTouch) * 100);
              return (
                <div key={t.touch} className="flex items-center gap-3">
                  <span className="w-[128px] shrink-0 text-[12.5px] text-ink">{t.touch}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line" title={`${t.touch} : ${t.responses} réponses`}>
                    <div className="h-full rounded-full bg-pine" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right font-mono text-[12.5px] text-stone">{t.responses}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[12px] text-stone">
            L&apos;email d&apos;introduction (présence sur site) reste la touche la plus performante.
          </p>
        </section>
      </div>

      {/* Table campagnes */}
      <section className="anim-fadeup mt-4 card overflow-hidden" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-3">
          <BarChart width={16} height={16} className="text-pine" />
          <h2 className="text-[15px] font-semibold text-ink">Par campagne</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">Campagne</th>
                <th className="px-3 py-2.5 font-medium">Période</th>
                <th className="px-3 py-2.5 text-right font-medium">Contactés</th>
                <th className="px-3 py-2.5 text-right font-medium">Ouverture</th>
                <th className="px-3 py-2.5 text-right font-medium">Réponse</th>
                <th className="px-5 py-2.5 text-right font-medium">RDV</th>
              </tr>
            </thead>
            <tbody>
              {campaignRows.map((c) => (
                <tr key={c.name + c.period} className="border-b border-line last:border-0 hover:bg-raised">
                  <td className="px-5 py-2.5 font-medium text-ink">{c.name}</td>
                  <td className="px-3 py-2.5 text-stone">{c.period}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone">{c.contacted}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone">{c.openRate}%</td>
                  <td className="px-3 py-2.5 text-right font-mono text-stone">{c.replyRate}%</td>
                  <td className="px-5 py-2.5 text-right font-mono font-semibold text-pine">{c.meetings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
