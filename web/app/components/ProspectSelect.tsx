"use client";

import { useMemo, useState } from "react";
import { type Rdv, type Prospect, type Step, type Neighbor, emailFor, LEVEL_META, NEIGHBOR_STATUS } from "@/lib/mock";
import { scoreAll, TIER_META } from "@/lib/scoring";
import { AgentConsole } from "./AgentConsole";
import { CompanyPanel } from "./CompanyPanel";
import { StepBar } from "./StepBar";
import { ScoreBars } from "./ScoreBars";
import { Square, CheckSquare, Mail, Users, Play, Refresh, ArrowRight, Route, ChevronRight } from "./icons";

type RunState = "idle" | "running" | "done";

function ProspectRow({
  p,
  checked,
  onToggle,
  domain,
  i,
}: {
  p: Prospect & { openness: number; intent: number; rank: number; tier: keyof typeof TIER_META };
  checked: boolean;
  onToggle: () => void;
  domain: string;
  i: number;
}) {
  const lvl = LEVEL_META[p.level];
  const tier = TIER_META[p.tier];
  return (
    <button
      onClick={onToggle}
      aria-pressed={checked}
      className={`card anim-fadeup w-full p-4 text-left transition-colors ${checked ? "ring-1 ring-pine-ring" : "opacity-[0.94] hover:opacity-100"}`}
      style={{ animationDelay: `${i * 30}ms` }}
    >
      <div className="flex items-start gap-3.5">
        <span className={`mt-0.5 shrink-0 ${checked ? "text-pine" : "text-line-strong"}`}>
          {checked ? <CheckSquare width={22} height={22} /> : <Square width={22} height={22} />}
        </span>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">
                {p.first} {p.last}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ${p.seniority === "C-level" ? "bg-ink text-paper" : "bg-paper text-stone"}`}>
                {p.seniority}
              </span>
            </div>
            <div className="mt-0.5 text-[13px] text-stone">{p.role}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-faint">
              <span className="inline-flex items-center gap-1">
                <Mail width={12} height={12} /> {emailFor(p, domain)}
              </span>
              <span>· {p.tenure} an{p.tenure > 1 ? "s" : ""} d&apos;ancienneté</span>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-medium" style={{ background: lvl.soft, color: lvl.color }}>
                <span className="font-mono">{lvl.tag}</span> {lvl.label}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2 border-t border-line pt-2.5 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-faint">Ouverture</span>
              <span className="text-[18px] font-semibold leading-none" style={{ color: tier.color }}>
                {p.openness}
                <span className="ml-0.5 text-[10px] font-normal text-faint">/100</span>
              </span>
            </div>
            <ScoreBars offer={p.offer} company={p.company} intent={p.intent} zone={p.zone} />
            {p.signal && (
              <div className="mt-0.5 flex items-start gap-1.5 text-[11.5px] text-stone">
                <span className="mt-px shrink-0 rounded bg-[#e8c250]/18 px-1.5 py-0.5 font-mono text-[9px] text-warm">Sillage</span>
                <span className="leading-snug">{p.signal}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function ProspectSelect({
  rdv,
  prospects,
  steps,
  neighbors,
  runState,
  runNonce,
  onStart,
  onRunComplete,
  onLaunch,
  onGoDashboard,
  onGoTournee,
}: {
  rdv: Rdv;
  prospects: Prospect[];
  steps: Step[];
  neighbors: Neighbor[];
  runState: RunState;
  runNonce: number;
  onStart: () => void;
  onRunComplete: () => void;
  onLaunch: (ids: string[]) => void;
  onGoDashboard: () => void;
  onGoTournee: () => void;
}) {
  const scored = useMemo(() => scoreAll(prospects), [prospects]);
  const [sel, setSel] = useState<Set<string>>(
    () => new Set(scored.filter((p) => p.tier === "prioriser" || p.tier === "planifier").map((p) => p.id))
  );
  const done = runState === "done";

  const runSteps = useMemo(
    () =>
      steps.map((s) => ({
        ...s,
        result: s.result
          .replace("{dayLong}", rdv.dayLong)
          .replace("{time}", rdv.time)
          .replace("{company}", rdv.company.name)
          .replace("{domain}", rdv.company.domain)
          .replace("{sector}", rdv.company.sector),
      })),
    [steps, rdv]
  );

  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const count = sel.size;

  return (
    <>
      <StepBar active="prospects" companyName={rdv.company.name} onGoDashboard={onGoDashboard} onGoProspects={() => {}} />

      <div className="mx-auto max-w-4xl px-6 pb-28 pt-6 md:px-10 md:pt-8">
        <header className="anim-fadeup mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink">Prospects à potentiel</h1>
            <p className="mt-1 text-[13.5px] text-stone">
              RDV avec {rdv.contactFirst} {rdv.contactLast} · {rdv.dayLong} {rdv.time}
            </p>
          </div>
          {done && (
            <button
              onClick={onStart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-[12.5px] text-stone transition-colors hover:border-pine hover:text-pine"
            >
              <Refresh width={14} height={14} /> Relancer
            </button>
          )}
        </header>

        <div className="anim-fadeup mb-6" style={{ animationDelay: "50ms" }}>
          <CompanyPanel company={rdv.company} />
        </div>

        {runState === "idle" ? (
          <div className="card flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-soft text-pine">
              <Users width={26} height={26} />
            </span>
            <p className="max-w-sm text-[14px] leading-relaxed text-stone">
              Lance l&apos;agent : il cartographie {rdv.company.name}, score les décideurs et te propose la liste à trier.
            </p>
            <button onClick={onStart} className="inline-flex items-center gap-2 rounded-lg bg-pine px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-pine-deep">
              <Play width={16} height={16} /> Lancer la cartographie
            </button>
          </div>
        ) : (
          <section className="mb-8">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-[12px] font-medium uppercase tracking-wide text-faint">Console agent</span>
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[11px] text-faint">Claude Agent SDK</span>
            </div>
            <AgentConsole
              key={runNonce}
              steps={runSteps}
              running={runState === "running"}
              onDone={onRunComplete}
              objective={`cartographier ${rdv.company.name} et prioriser les décideurs`}
              footer="18 décideurs M/C-level scorés — à toi de trier"
            />
          </section>
        )}

        {done && (
          <section className="anim-fadeup">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink">18 décideurs M-level &amp; C-level</h2>
              <div className="flex items-center gap-3 text-[12.5px]">
                <button onClick={() => setSel(new Set(scored.map((p) => p.id)))} className="text-stone hover:text-pine">
                  Tout cocher
                </button>
                <span className="text-line-strong">·</span>
                <button onClick={() => setSel(new Set())} className="text-stone hover:text-pine">
                  Tout décocher
                </button>
              </div>
            </div>
            <p className="mb-4 max-w-2xl text-[13px] leading-relaxed text-stone">
              Fais ton premier tri : coche les décideurs à contacter. L&apos;agent a pré-sélectionné les profils à fort
              potentiel — ajuste avant de lancer les séquences.
            </p>

            <div className="flex flex-col gap-2.5">
              {scored.map((p, i) => (
                <ProspectRow key={p.id} p={p} i={i} checked={sel.has(p.id)} onToggle={() => toggle(p.id)} domain={rdv.company.domain} />
              ))}
            </div>

            <div className="mt-8 card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                <Route width={16} height={16} className="text-pine" />
                <span className="text-[13.5px] font-medium text-ink">Comptes à potentiel sur ton itinéraire</span>
                <button onClick={onGoTournee} className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-pine hover:underline">
                  Voir la tournée <ArrowRight width={13} height={13} />
                </button>
              </div>
              <ul className="divide-y divide-line">
                {neighbors.map((n) => {
                  const st = NEIGHBOR_STATUS[n.status];
                  return (
                    <li key={n.id}>
                      <button onClick={onGoTournee} className="flex w-full items-center gap-3 px-5 py-3 text-left text-[13px] transition-colors hover:bg-raised">
                        <span className="font-medium text-ink">{n.name}</span>
                        <span className="hidden text-stone sm:inline">{n.sector}</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: st.soft, color: st.color }}>
                          {st.label}
                        </span>
                        <span className="ml-auto font-mono text-[12px] text-faint">{n.distanceM} m · +{n.detourMin} min</span>
                        <span className="font-mono text-[12px] text-stone">fit {n.fit}</span>
                        <ChevronRight width={15} height={15} className="text-faint" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {done && (
          <div className="sticky bottom-0 z-10 -mx-6 mt-6 border-t border-line bg-paper/85 px-6 py-3.5 backdrop-blur md:-mx-10 md:px-10">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
              <span className="text-[13px] text-stone">
                <b className="font-semibold text-ink">{count}</b> prospect{count > 1 ? "s" : ""} sélectionné{count > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => onLaunch(scored.filter((p) => sel.has(p.id)).map((p) => p.id))}
                disabled={count === 0}
                className="group inline-flex items-center gap-2 rounded-lg bg-pine px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-pine-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Lancer les séquences
                <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
