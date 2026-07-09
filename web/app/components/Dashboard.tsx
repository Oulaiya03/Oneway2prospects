"use client";

import { useState } from "react";
import { type Rdv, month, monthStats, rdvMeta } from "@/lib/mock";
import { TripMap } from "./TripMap";
import { CalendarView } from "./CalendarView";
import { MapPin, ArrowRight, Calendar2, Users, TrendingUp, Bolt, Grid } from "./icons";

function Kpi({ label, value, unit, Icon, accent }: { label: string; value: string; unit?: string; Icon: typeof Users; accent?: boolean }) {
  return (
    <div className={`card p-4 ${accent ? "border-pine/25 bg-pine-soft" : ""}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[12px] ${accent ? "text-pine/80" : "text-stone"}`}>{label}</span>
        <Icon width={16} height={16} className={accent ? "text-pine" : "text-faint"} />
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`text-[26px] font-semibold leading-none tracking-tight ${accent ? "text-pine" : "text-ink"}`}>{value}</span>
        {unit && <span className={`text-[12px] ${accent ? "text-pine/70" : "text-faint"}`}>{unit}</span>}
      </div>
    </div>
  );
}

// Compteurs déterministes pour un RDV réel (agenda Google) absent du mock rdvMeta.
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function metaFor(rdv: Rdv) {
  const base = rdvMeta[rdv.id];
  if (base) return base;
  const h = strHash(rdv.id);
  return {
    potential: 12 + (h % 13), // 12–24 décideurs activables
    contacted: 1 + (h % 6), // 1–6 déjà contactés
    distanceKm: 2 + (h % 9),
    travelMin: 10 + (h % 25),
  };
}

function RdvCard({ rdv, onSelect }: { rdv: Rdv; onSelect: () => void }) {
  const m = metaFor(rdv);
  const remaining = Math.max(0, m.potential - m.contacted);
  const pct = m.potential > 0 ? Math.round((m.contacted / m.potential) * 100) : 0;
  return (
    <button onClick={onSelect} className="card group flex flex-col overflow-hidden p-0 text-left transition-all hover:border-pine/40 hover:shadow-[0_16px_44px_-26px_rgba(16,18,23,0.4)]">
      <div className="p-3 pb-0">
        <TripMap destination={rdv.address} label={rdv.company.name} distanceKm={m.distanceKm} travelMin={m.travelMin} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">{rdv.company.name}</span>
              <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-stone">{rdv.company.sector.split(" · ")[0]}</span>
            </div>
            <div className="mt-0.5 text-[12.5px] text-stone">
              {rdv.contactFirst} {rdv.contactLast} · {rdv.contactRole}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[15px] font-semibold leading-none text-ink">{rdv.time}</div>
            <div className="mt-1 font-mono text-[11px] text-stone">{rdv.dayShort}</div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-faint">
          <MapPin width={13} height={13} />
          {rdv.address}
        </div>

        {/* Avancement des contacts */}
        <div className="mt-3 rounded-lg border border-line bg-raised px-3 py-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-stone">
              <b className="font-semibold text-ink">{m.contacted}</b> / {m.potential} contactés
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-pine">
              <Users width={12} height={12} /> {remaining} à contacter
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-pine" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-pine">
          Préparer ce RDV
          <ArrowRight width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}

export function Dashboard({ rdvs, onSelectRdv, live }: { rdvs: Rdv[]; onSelectRdv: (id: string) => void; live?: boolean }) {
  const [tab, setTab] = useState<"cards" | "calendar">("cards");
  const growing = rdvs.filter((r) => r.company.growthPct >= 40).length;
  const totalRemaining = rdvs.reduce((s, r) => {
    const m = metaFor(r);
    return s + (m.potential - m.contacted);
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10 md:py-10">
      <header className="anim-fadeup mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Tableau de bord</h1>
          <p className="mt-1 text-[14px] text-stone">Pipeline terrain · {month}</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-stone">
          <Calendar2 width={14} height={14} className={live ? "text-pine" : "text-faint"} />
          {live ? "Synchronisé via Google Calendar" : "Mode démo · connecte ton agenda"}
        </div>
      </header>

      <div className="anim-fadeup mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4" style={{ animationDelay: "60ms" }}>
        <Kpi label="RDV physiques" value={String(monthStats.planned)} unit="ce mois" Icon={Calendar2} />
        <Kpi label="Potentiel agent" value={String(monthStats.potential)} unit="RDV activables" Icon={Bolt} accent />
        <Kpi label="Contacts à traiter" value={String(totalRemaining)} unit="restants" Icon={Users} />
        <Kpi label="Comptes en croissance" value={String(growing)} unit="> 40 %/an" Icon={TrendingUp} />
      </div>

      <div className="anim-fadeup mb-4 flex items-center justify-between" style={{ animationDelay: "120ms" }}>
        <h2 className="text-[15px] font-semibold text-ink">Prochains RDV physiques</h2>
        <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
          <button
            onClick={() => setTab("cards")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${tab === "cards" ? "bg-pine-soft text-pine" : "text-stone hover:text-ink"}`}
          >
            <Grid width={14} height={14} /> Cartes
          </button>
          <button
            onClick={() => setTab("calendar")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${tab === "calendar" ? "bg-pine-soft text-pine" : "text-stone hover:text-ink"}`}
          >
            <Calendar2 width={14} height={14} /> Calendrier
          </button>
        </div>
      </div>

      {tab === "cards" ? (
        <div className="anim-fadeup grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rdvs.map((r) => (
            <RdvCard key={r.id} rdv={r} onSelect={() => onSelectRdv(r.id)} />
          ))}
        </div>
      ) : (
        <div className="anim-fadeup">
          <CalendarView rdvs={rdvs} onSelectRdv={onSelectRdv} />
        </div>
      )}
    </div>
  );
}
