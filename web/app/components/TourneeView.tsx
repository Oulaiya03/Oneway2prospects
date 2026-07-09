"use client";

import { useState } from "react";
import { tournee, neighbors, rdvs, office, NEIGHBOR_STATUS, type Neighbor } from "@/lib/mock";
import { TripMap } from "./TripMap";
import { Route, MapPin, Users, Building, ArrowRight, ChevronRight, Play } from "./icons";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-raised px-3 py-2">
      <div className="text-[15px] font-semibold leading-none text-ink">{value}</div>
      <div className="mt-1 text-[11px] text-stone">{label}</div>
    </div>
  );
}

function DetourCard({ n, onCartograph }: { n: Neighbor; onCartograph: () => void }) {
  const [open, setOpen] = useState(false);
  const st = NEIGHBOR_STATUS[n.status];
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-raised">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper text-[12px] font-semibold text-stone">
          {n.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-ink">{n.name}</span>
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: st.soft, color: st.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} />
              {st.label}
            </span>
          </div>
          <div className="truncate text-[12px] text-stone">{n.sector}</div>
        </div>
        <span className="shrink-0 text-right">
          <span className="block font-mono text-[12px] text-stone">+{n.detourMin} min</span>
          <span className="block text-[11px] text-faint">fit {n.fit}</span>
        </span>
        <ChevronRight width={16} height={16} className={`shrink-0 text-faint transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="anim-stream border-t border-line px-4 py-3.5">
          <p className="mb-3 text-[13px] text-stone">{n.activity} · {n.address}</p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <Stat label="CA" value={`${n.caM} M€`} />
            <Stat label="Croissance" value={`+${n.growthPct}%`} />
            <Stat label="Effectif" value={String(n.employees)} />
          </div>
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Signaux</div>
            <div className="flex flex-col gap-1.5">
              {n.signals.map((s) => (
                <div key={s} className="flex items-start gap-1.5 text-[12.5px] text-ink">
                  <span className="mt-px shrink-0 rounded bg-[#e8c250]/18 px-1.5 py-0.5 font-mono text-[9px] text-warm">Sillage</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <div className="flex items-center gap-2 text-[12.5px] text-stone">
              <Users width={13} height={13} className="text-faint" />
              {n.contact.name} · {n.contact.role}
            </div>
            <button onClick={onCartograph} className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:border-pine hover:text-pine">
              <Building width={14} height={14} /> Cartographier ce compte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Leg({ min, km }: { min: number; km: number }) {
  return (
    <div className="flex items-center gap-2 py-1.5 pl-[26px] text-[11.5px] text-faint">
      <Route width={13} height={13} />
      {min} min · {String(km).replace(".", ",")} km
    </div>
  );
}

export function TourneeView({ onSelectRdv }: { onSelectRdv: (id: string) => void }) {
  const rdvCount = tournee.stops.filter((s) => s.kind === "rdv").length;
  const detourCount = tournee.stops.filter((s) => s.kind === "detour").length;
  const mapWaypoints = tournee.stops
    .slice(0, -1)
    .map((s) => (s.kind === "rdv" ? rdvs.find((r) => r.id === s.rdvId)?.address : neighbors.find((n) => n.id === s.neighborId)?.address))
    .filter(Boolean) as string[];
  const lastRdv = [...tournee.stops].reverse().find((s) => s.kind === "rdv");
  const dest = lastRdv && lastRdv.kind === "rdv" ? rdvs.find((r) => r.id === lastRdv.rdvId)?.address ?? "" : "";

  // Ouvre l'itinéraire multi-arrêts dans Google Maps (lien direct, sans clé API).
  const openInMaps = () => {
    // URLSearchParams encode tout proprement, y compris le séparateur | des waypoints (%7C).
    const params = new URLSearchParams({
      api: "1",
      origin: `${office.name}, ${office.city}`,
      destination: dest,
      waypoints: mapWaypoints.join("|"),
      travelmode: "driving",
    });
    const url = `https://www.google.com/maps/dir/?${params.toString()}`;
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:px-10 md:py-10">
      <header className="anim-fadeup mb-5">
        <h1 className="text-[24px] font-semibold tracking-tight text-ink">Tournée du jour</h1>
        <p className="mt-1 text-[14px] text-stone">
          {tournee.day} · itinéraire optimisé par l&apos;agent — tes RDV + les comptes à potentiel sur le chemin.
        </p>
      </header>

      {/* Résumé */}
      <div className="anim-fadeup mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: "40ms" }}>
        <Stat label="RDV confirmés" value={String(rdvCount)} />
        <Stat label="Détours suggérés" value={String(detourCount)} />
        <Stat label="Conversations possibles" value={String(rdvCount + detourCount)} />
        <Stat label="Trajet total" value={`${String(tournee.totalKm).replace(".", ",")} km`} />
      </div>

      <div className="anim-fadeup mb-6" style={{ animationDelay: "80ms" }}>
        <TripMap destination={dest} label={tournee.day} travelMin={68} distanceKm={tournee.totalKm} waypoints={mapWaypoints} useGeo height={220} />
      </div>

      {/* Itinéraire */}
      <div className="anim-fadeup relative flex flex-col" style={{ animationDelay: "120ms" }}>
        {/* Départ */}
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">
            <MapPin width={15} height={15} />
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-ink">Départ — {office.name}</div>
            <div className="text-[12px] text-stone">{office.city} · ta position</div>
          </div>
        </div>

        {tournee.stops.map((s, i) => (
          <div key={i}>
            <Leg min={s.legMin} km={s.legKm} />
            <div className="flex gap-3">
              <span className="flex w-8 shrink-0 justify-center">
                <span className={`mt-1 h-3 w-3 rounded-full ${s.kind === "rdv" ? "bg-pine ring-4 ring-pine-soft" : "border-2 border-line-strong bg-surface"}`} />
              </span>
              <div className="min-w-0 flex-1 pb-2">
                {s.kind === "rdv"
                  ? (() => {
                      const r = rdvs.find((x) => x.id === s.rdvId)!;
                      return (
                        <div className="card flex flex-wrap items-center gap-3 p-4">
                          <div className="font-mono text-[13px] font-semibold text-pine">{r.time}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold text-ink">{r.company.name}</span>
                              <span className="rounded-full bg-pine-soft px-2 py-0.5 text-[10px] font-medium text-pine">RDV confirmé</span>
                            </div>
                            <div className="text-[12px] text-stone">{r.contactFirst} {r.contactLast} · {r.contactRole}</div>
                          </div>
                          <button onClick={() => onSelectRdv(r.id)} className="group inline-flex items-center gap-1.5 rounded-lg bg-pine px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-pine-deep">
                            Préparer <ArrowRight width={13} height={13} className="transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      );
                    })()
                  : (() => {
                      const n = neighbors.find((x) => x.id === s.neighborId)!;
                      return <DetourCard n={n} onCartograph={() => onSelectRdv(n.id)} />;
                    })()}
              </div>
            </div>
          </div>
        ))}

        {/* Retour */}
        <div className="mt-1 flex items-center gap-3 pl-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-surface text-faint">
            <MapPin width={15} height={15} />
          </span>
          <div className="text-[13px] text-stone">Retour · {tournee.totalTravel} de trajet cumulé</div>
        </div>
      </div>

      <div className="anim-fadeup mt-6 flex flex-col items-center gap-2 rounded-2xl border border-pine/20 bg-pine-soft px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left" style={{ animationDelay: "200ms" }}>
        <div>
          <div className="font-semibold text-pine">{rdvCount} déplacements → {rdvCount + detourCount} conversations</div>
          <div className="text-[13px] text-pine/80">Les détours sont à moins de {Math.max(...neighbors.map((n) => n.detourMin))} min de tes RDV.</div>
        </div>
        <button onClick={openInMaps} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-pine px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-pine-deep">
          <Play width={15} height={15} /> Lancer la tournée
        </button>
      </div>
    </div>
  );
}
