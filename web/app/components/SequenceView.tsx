"use client";

import { useMemo, useState } from "react";
import { type Rdv, type Prospect, type Touch, type Channel, buildCadence, CHANNEL_META } from "@/lib/mock";
import { scoreAll, TIER_META } from "@/lib/scoring";
import { StepBar } from "./StepBar";
import { Mail, Phone, Linkedin, Check, Lock, Bolt, ArrowRight } from "./icons";

function ChannelIcon({ channel, ...rest }: { channel: Channel; width?: number; height?: number; className?: string }) {
  if (channel === "email") return <Mail {...rest} />;
  if (channel === "call") return <Phone {...rest} />;
  return <Linkedin {...rest} />;
}

function TouchCard({ touch, approved, onApprove }: { touch: Touch; approved: boolean; onApprove: () => void }) {
  const meta = CHANNEL_META[touch.channel];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => touch.content.join("\n\n"));
  return (
    <div className={`card overflow-hidden ${approved ? "ring-1 ring-pine/25" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="text-[13.5px] font-medium text-ink">{touch.title}</span>
        <span className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium" style={{ color: meta.color, background: `${meta.color}18` }}>
          {meta.label}
        </span>
        {touch.usesSillage && (
          <span className="inline-flex items-center rounded bg-[#e8c250]/18 px-1.5 py-0.5 font-mono text-[10px] font-medium text-warm">
            Sillage
          </span>
        )}
        {touch.auto ? (
          <span className="inline-flex items-center gap-1 rounded bg-paper px-1.5 py-0.5 font-mono text-[10px] text-stone">
            <Bolt width={10} height={10} /> {touch.tool}
          </span>
        ) : (
          <span className="font-mono text-[10.5px] text-faint">{touch.tool}</span>
        )}
        <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${approved ? "bg-pine-soft text-pine" : "bg-warm-soft text-warm"}`}>
          {approved ? (
            <>
              <Check width={11} height={11} /> validé
            </>
          ) : (
            "à valider"
          )}
        </span>
      </div>

      <div className="space-y-2 px-4 py-3.5 text-[13px] leading-relaxed text-ink/90">
        {touch.content.map((line, i) => {
          const isSubject = line.startsWith("Objet :");
          const isLabel = /^(Note de connexion|Message direct|Accroche|Transition|Question ouverte|Objectif)/.test(line);
          if (isSubject) {
            return (
              <div key={i} className="rounded-md bg-paper/60 px-2.5 py-1.5 text-[12.5px] font-medium text-ink">
                {line}
              </div>
            );
          }
          return (
            <p key={i} className={`whitespace-pre-line ${isLabel ? "text-stone" : ""}`}>
              {line}
            </p>
          );
        })}
        {touch.note && (
          <div className="mt-1 rounded-md border border-dashed border-line px-2.5 py-1.5 text-[11px] italic text-faint">
            {touch.note}
          </div>
        )}
      </div>

      {editing && (
        <div className="border-t border-line px-4 py-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            aria-label="Modifier le message de la touche"
            className="w-full resize-y rounded-md border border-pine/40 bg-surface px-2.5 py-2 text-[13px] leading-relaxed text-ink outline-none focus:border-pine"
          />
          <p className="mt-1 text-[11px] text-faint">Édite le message, puis « Terminer ».</p>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-line px-4 py-2.5">
        {approved ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-pine">
            <Check width={14} height={14} /> {touch.auto ? `Programmé dans ${touch.tool}` : `Prêt dans ${touch.tool}`}
          </span>
        ) : (
          <button onClick={onApprove} className="inline-flex items-center gap-1.5 rounded-lg bg-pine px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-pine-deep">
            <Check width={14} height={14} /> Valider cette touche
          </button>
        )}
        <button
          onClick={() => setEditing((e) => !e)}
          aria-pressed={editing}
          className="rounded-lg border border-line px-2.5 py-1.5 text-[12.5px] text-stone transition-colors hover:border-line-strong hover:text-ink"
        >
          {editing ? "Terminer" : "Modifier"}
        </button>
      </div>
    </div>
  );
}

export function SequenceView({
  rdv,
  prospects,
  selectedIds,
  onGoDashboard,
  onGoProspects,
  onGoBrief,
}: {
  rdv: Rdv;
  prospects: Prospect[];
  selectedIds: string[];
  onGoDashboard: () => void;
  onGoProspects: () => void;
  onGoBrief: (prospectId: string) => void;
}) {
  const scored = useMemo(() => scoreAll(prospects), [prospects]);
  const chosen = useMemo(
    () => scored.filter((p) => selectedIds.includes(p.id)),
    [scored, selectedIds]
  );

  const [activeId, setActiveId] = useState<string>(chosen[0]?.id ?? "");
  const [approved, setApproved] = useState<Record<string, boolean>>({});

  const active = chosen.find((p) => p.id === activeId) ?? chosen[0];

  if (!active) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-stone">
        Aucun prospect sélectionné. Reviens à l&apos;étape Prospects pour en cocher.
      </div>
    );
  }

  const touches = buildCadence(active, rdv);
  const tier = TIER_META[active.tier];
  const doneCount = touches.filter((t) => approved[`${active.id}-${t.t}`]).length;
  const all = doneCount === touches.length;

  return (
    <>
      <StepBar active="sequence" companyName={rdv.company.name} onGoDashboard={onGoDashboard} onGoProspects={onGoProspects} />
      <div className="mx-auto max-w-3xl px-6 pb-12 pt-6 md:px-10 md:pt-8">
      <header className="anim-fadeup mb-6">
        <h1 className="text-[24px] font-semibold leading-[1.1] tracking-tight text-ink md:text-[27px]">
          Cadence multi-touch · {rdv.company.name}
        </h1>
        <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed text-stone">
          Cinq touches sur huit jours. Le premier email s&apos;ouvre sur ta présence sur site {rdv.dayLong} — l&apos;intérêt
          pour la personne vient ensuite.
        </p>
      </header>

      {/* Sélecteur */}
      <div className="mb-6 flex flex-wrap gap-2">
        {chosen.map((p) => {
          const on = p.id === active.id;
          const m = TIER_META[p.tier];
          return (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${on ? "border-pine bg-pine-soft" : "border-line bg-surface hover:border-line-strong"}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-semibold text-white" style={{ background: m.color }}>
                {p.rank}
              </span>
              <span className="leading-tight">
                <span className={`block text-[13px] font-medium ${on ? "text-pine" : "text-ink"}`}>
                  {p.first} {p.last}
                </span>
                <span className="block text-[11px] text-stone">{p.role}</span>
              </span>
              <span className="ml-1 font-mono text-[12px] font-semibold text-ink">{p.openness}</span>
            </button>
          );
        })}
      </div>

      {/* Validation */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper">
          <Lock width={15} height={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-medium text-ink">
            {active.first} {active.last} · <span className="font-normal" style={{ color: tier.color }}>{tier.label}</span>
          </div>
          <div className="text-[12.5px] text-stone">
            {doneCount}/{touches.length} touche{doneCount > 1 ? "s" : ""} validée{doneCount > 1 ? "s" : ""} · rien
            n&apos;est envoyé sans ton feu vert.
          </div>
        </div>
        <div className="w-full sm:w-36">
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-pine transition-all duration-500" style={{ width: `${(doneCount / touches.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative flex flex-col gap-4 pl-1">
        {touches.map((t, i) => {
          const m = CHANNEL_META[t.channel];
          const isApproved = !!approved[`${active.id}-${t.t}`];
          return (
            <div key={t.t} className="anim-fadeup flex gap-4" style={{ animationDelay: `${i * 55}ms` }}>
              <div className="flex w-14 shrink-0 flex-col items-center">
                <span className="font-mono text-[11px] font-medium text-stone">J+{t.day}</span>
                <span className="mt-1.5 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-surface" style={{ borderColor: m.color, color: m.color }}>
                  <ChannelIcon channel={t.channel} width={16} height={16} />
                </span>
                {i < touches.length - 1 && <span className="mt-1 w-px flex-1 bg-line" style={{ minHeight: 24 }} />}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <div className="mb-1 font-mono text-[10.5px] uppercase tracking-wider text-faint">Touche {t.t}</div>
                <TouchCard touch={t} approved={isApproved} onApprove={() => setApproved((s) => ({ ...s, [`${active.id}-${t.t}`]: true }))} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Récap */}
      <div className={`anim-fadeup mt-7 flex flex-col items-center gap-2 rounded-2xl px-6 py-7 text-center transition-colors ${all ? "border border-pine/25 bg-pine-soft" : "border border-line bg-surface"}`}>
        {all ? (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pine text-white">
              <Check width={22} height={22} />
            </span>
            <div className="font-display text-[18px] font-semibold text-pine">
              Séquence {active.first} {active.last} activée
            </div>
            <p className="max-w-md text-[13.5px] leading-relaxed text-pine/80">
              5 touches sur 8 jours. Le premier contact démarre en face-à-face {rdv.dayLong} chez {rdv.company.name} —
              le reste s&apos;enchaîne, email et LinkedIn via HeyReach, sous ton contrôle.
            </p>
          </>
        ) : (
          <p className="max-w-md text-[13.5px] leading-relaxed text-stone">
            Valide les {touches.length} touches pour activer la cadence de {active.first} {active.last}.
            {chosen.length > 1 ? ` ${chosen.length} prospects sélectionnés au total.` : ""}
          </p>
        )}
      </div>

      <div className="anim-fadeup mt-4 flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="text-[14px] font-semibold text-ink">Prochaine étape — le brief de pitch</div>
          <div className="text-[13px] text-stone">
            Quand {active.first} accepte le RDV 5 min, génère son one-pager de prépa.
          </div>
        </div>
        <button
          onClick={() => onGoBrief(active.id)}
          className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-pine px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-pine-deep"
        >
          Préparer le brief
          <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      </div>
    </>
  );
}
