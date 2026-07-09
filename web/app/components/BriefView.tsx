"use client";

import { useState } from "react";
import { type Rdv, type Prospect, offer, visioSlots, emailFor } from "@/lib/mock";
import { scoreOne, intentOf } from "@/lib/scoring";
import { StepBar } from "./StepBar";
import {
  Calendar2, Building, TrendingUp, Users, Check,
  FileText, Download, MessageCircle, Volume, Lightbulb, Video,
} from "./icons";

type Format = "onepager" | "whatsapp" | "vocal";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 text-[13.5px] text-ink">{children}</div>
    </div>
  );
}

export function BriefView({
  rdv,
  prospect,
  onGoDashboard,
  onGoProspects,
  onGoSequence,
}: {
  rdv: Rdv;
  prospect: Prospect;
  onGoDashboard: () => void;
  onGoProspects: () => void;
  onGoSequence: () => void;
}) {
  const [fmt, setFmt] = useState<Format>("onepager");
  const [sent, setSent] = useState<Format | null>(null);
  const [playing, setPlaying] = useState(false);

  const email = prospect.email ?? emailFor(prospect, rdv.company.domain);
  const openness = scoreOne({ offer: prospect.offer, company: prospect.company, zone: prospect.zone, intent: intentOf(prospect) }).openness;
  const recent = prospect.signal ?? "Pas de signal récent";
  const tenureLabel = `${prospect.tenure} an${prospect.tenure > 1 ? "s" : ""} dans l'entreprise`;

  const wa = [
    `*Brief RDV — ${prospect.first} ${prospect.last} (${rdv.company.name})*`,
    `📍 ${rdv.dayLong} ${rdv.timeEarly} · accueil ${rdv.company.name} · 5 min`,
    `👤 ${prospect.role} · ${email}`,
    `🏢 ${rdv.company.employees} employés · +${rdv.company.growthPct}%/an · ${rdv.company.funding}`,
    `📣 ${recent}`,
    `💡 À pitcher : ${offer.oneLiner}`,
    `🎯 Visio 30 min : ${visioSlots.join(" / ")}`,
  ].join("\n");

  const FORMATS: { id: Format; label: string; Icon: typeof FileText }[] = [
    { id: "onepager", label: "One-pager", Icon: FileText },
    { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
    { id: "vocal", label: "Vocal", Icon: Volume },
  ];

  const action =
    fmt === "onepager"
      ? { label: "Télécharger le PDF", Icon: Download }
      : fmt === "whatsapp"
      ? { label: "Envoyer sur WhatsApp", Icon: MessageCircle }
      : { label: "Livrer le vocal au commercial", Icon: Volume };

  // Chaque format déclenche une VRAIE action : impression (→ PDF), lien WhatsApp pré-rempli, ou livraison.
  const runAction = () => {
    if (typeof window !== "undefined") {
      if (fmt === "onepager") window.print();
      else if (fmt === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(wa)}`, "_blank", "noopener,noreferrer");
    }
    setSent(fmt);
  };

  return (
    <>
      <StepBar active="brief" companyName={rdv.company.name} onGoDashboard={onGoDashboard} onGoProspects={onGoProspects} onGoSequence={onGoSequence} />

      <div className="mx-auto max-w-3xl px-6 pb-12 pt-6 md:px-10 md:pt-8">
        <header className="anim-fadeup mb-5">
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Brief de RDV · pitch 5 min</h1>
          <p className="mt-1 text-[14px] text-stone">
            De quoi préparer ton passage chez {rdv.company.name} et pitcher en 5 minutes.
          </p>
        </header>

        {/* Sélecteur de format */}
        <div className="anim-fadeup mb-5 flex flex-wrap items-center gap-2" style={{ animationDelay: "40ms" }}>
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5" role="tablist" aria-label="Format de livraison">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFmt(f.id)}
                role="tab"
                aria-selected={fmt === f.id}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${fmt === f.id ? "bg-pine-soft text-pine" : "text-stone hover:text-ink"}`}
              >
                <f.Icon width={14} height={14} /> {f.label}
              </button>
            ))}
          </div>
          <span className="text-[12px] text-faint">Généré par l&apos;agent · Gradium</span>
        </div>

        {/* ONE-PAGER */}
        {fmt === "onepager" && (
          <div className="anim-fadeup card overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-line bg-raised px-5 py-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-pine">Brief · RDV 5 min</div>
                <div className="mt-1 text-[20px] font-semibold tracking-tight text-ink">
                  {prospect.first} {prospect.last}
                </div>
                <div className="text-[13px] text-stone">{prospect.role} · {rdv.company.name}</div>
              </div>
              <div className="shrink-0 rounded-lg border border-pine/25 bg-pine-soft px-3 py-2 text-center">
                <div className="text-[10px] font-medium uppercase tracking-wide text-pine/70">Ouverture</div>
                <div className="text-[20px] font-semibold leading-none text-pine">{openness}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <div className="flex items-start gap-2 rounded-lg border border-line bg-raised px-3.5 py-3 sm:col-span-2">
                <Calendar2 width={16} height={16} className="mt-0.5 shrink-0 text-pine" />
                <div className="text-[13.5px] text-ink">
                  <b className="font-semibold">{rdv.dayLong} · {rdv.timeEarly}</b> — café à l&apos;accueil de {rdv.company.name}, juste avant ton RDV avec {rdv.contactFirst} {rdv.contactLast}.
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-faint">
                  <Users width={13} height={13} /> Contact
                </div>
                <Field label="Email">{email}</Field>
                <Field label="Téléphone">{prospect.phone || "—"}</Field>
                <Field label="LinkedIn">
                  linkedin.com/in/{prospect.first.toLowerCase()}-{prospect.last.toLowerCase()}
                </Field>
                <Field label="Ancienneté">{tenureLabel}</Field>
              </div>

              {/* Entreprise */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-faint">
                  <Building width={13} height={13} /> Entreprise
                </div>
                <Field label="Activité">{rdv.company.activity}</Field>
                <Field label="Taille · croissance">
                  {rdv.company.employees} employés ·{" "}
                  <span className="inline-flex items-center gap-0.5 font-medium text-pine">
                    <TrendingUp width={12} height={12} />+{rdv.company.growthPct}%/an
                  </span>{" "}
                  · {rdv.company.funding}
                </Field>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                    Actualité récente
                    {prospect.signal && (
                      <span className="rounded bg-[#e8c250]/18 px-1.5 py-0.5 font-mono text-[9px] normal-case tracking-normal text-warm">
                        Sillage · {prospect.signalAge}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[13.5px] text-ink">{recent}</div>
                </div>
              </div>

              {/* L'idée à pitcher */}
              <div className="rounded-xl border border-pine/25 bg-pine-soft p-4 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-pine">
                  <Lightbulb width={14} height={14} /> L&apos;idée à pitcher
                </div>
                <p className="mt-2 text-[14px] font-medium text-ink">{offer.oneLiner}</p>
                <ul className="mt-2 space-y-1.5">
                  {offer.pitch.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-[13px] text-ink/90">
                      <Check width={14} height={14} className="mt-0.5 shrink-0 text-pine" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <p className="mt-2.5 border-t border-pine/15 pt-2.5 text-[12.5px] text-pine/80">
                  <b className="font-semibold">Pourquoi eux :</b> {recent.toLowerCase()}.
                </p>
              </div>

              {/* Créneaux visio */}
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-faint">
                  <Video width={14} height={14} /> Proposer une visio 30 min
                </div>
                <div className="flex flex-wrap gap-2">
                  {visioSlots.map((s) => (
                    <span key={s} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WHATSAPP */}
        {fmt === "whatsapp" && (
          <div className="anim-fadeup card p-5">
            <div className="mx-auto max-w-md rounded-2xl bg-[#e7f3ec] p-4">
              <div className="mb-2 text-center text-[11px] font-medium text-stone">DeskOffer · note de brief</div>
              <div className="ml-auto max-w-[92%] whitespace-pre-line rounded-2xl rounded-br-sm bg-[#d6f0dd] px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
                {wa}
              </div>
              <div className="mt-1 text-right text-[10px] text-stone">à l&apos;instant ✓✓</div>
            </div>
          </div>
        )}

        {/* VOCAL */}
        {fmt === "vocal" && (
          <div className="anim-fadeup card p-5">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-raised px-4 py-3">
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Mettre en pause le brief vocal" : "Écouter le brief vocal"}
                aria-pressed={playing}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine text-white transition-transform hover:scale-105"
              >
                <Volume width={20} height={20} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-medium text-ink">Note vocale · brief {prospect.first} {prospect.last}</span>
                  <span className="rounded bg-pine-soft px-1.5 py-0.5 text-[10px] font-medium text-pine">Gradium</span>
                </div>
                {/* waveform */}
                <div className="mt-2 flex items-center gap-[3px]">
                  {[8, 14, 6, 18, 11, 22, 9, 16, 7, 20, 12, 24, 8, 15, 6, 19, 10, 21, 7, 13, 9, 17, 6, 11].map((h, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full bg-pine/40"
                      style={{ height: h, opacity: playing ? 1 : 0.55 }}
                    />
                  ))}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[12px] text-stone">{playing ? "en lecture…" : "1:12"}</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-stone">
              « Salut Nicolas — dans 5 minutes tu vois {prospect.first} {prospect.last}, {prospect.role} chez {rdv.company.name}.
              Le point d&apos;accroche : {recent.toLowerCase()}. Ton angle : {offer.oneLiner.toLowerCase()} Propose-lui une visio
              de 30 min, tu as trois créneaux. Bonne chance ! »
            </p>
            <p className="mt-2 text-[12px] text-faint">À écouter sur le trajet, juste avant d&apos;entrer en RDV.</p>
          </div>
        )}

        {/* Action d'export */}
        <div className="anim-fadeup mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          <span className="text-[12.5px] text-stone">
            {sent ? "Format prêt — livré au commercial." : "Choisis le format de livraison pour le commercial."}
          </span>
          <button
            onClick={runAction}
            className="inline-flex items-center gap-2 rounded-lg bg-pine px-4 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-pine-deep"
          >
            {sent === fmt ? <Check width={16} height={16} /> : <action.Icon width={16} height={16} />}
            {sent === fmt ? "Prêt ✓" : action.label}
          </button>
        </div>
      </div>
    </>
  );
}
