// Moteur de score d'ouverture (front DeskOffer) — source de vérité du score côté cockpit.
// Ouverture = combinaison pondérée de 4 axes : offre × compagnie × intent (Sillage) × zone.
// L'intent provient des signaux Sillage : sa présence et sa fraîcheur pèsent dans le score.

export type Tier = "prioriser" | "planifier" | "opportuniste" | "ecarter";
export type Heat = "hot" | "warm" | "cool";

export const WEIGHTS = { offer: 0.35, company: 0.2, intent: 0.25, zone: 0.2 } as const;
export const THRESHOLDS = { potentiel: 65, accessibilite: 60 } as const;

export type ScoreResult = {
  intent: number;
  potentiel: number;
  accessibilite: number;
  openness: number;
  tier: Tier;
};

export const TIER_META: Record<Tier, { label: string; short: string; color: string; soft: string }> = {
  prioriser: { label: "Fort potentiel", short: "Prioriser", color: "#0c6b52", soft: "#e2f0ec" },
  planifier: { label: "À planifier", short: "Planifier", color: "#b07d12", soft: "#f6ecd5" },
  opportuniste: { label: "Opportuniste", short: "Opportuniste", color: "#3f7d8c", soft: "#e4eef1" },
  ecarter: { label: "Faible potentiel", short: "Écarter", color: "#7f8794", soft: "#eef0f2" },
};

// Score d'intention dérivé du signal Sillage (présence + fraîcheur via heat).
export function intentOf(p: { signal?: string; heat: Heat }): number {
  if (!p.signal) return 28;
  return p.heat === "hot" ? 92 : p.heat === "warm" ? 76 : 58;
}

function tierFor(potentiel: number, accessibilite: number): Tier {
  const hiPot = potentiel >= THRESHOLDS.potentiel;
  const hiAcc = accessibilite >= THRESHOLDS.accessibilite;
  if (hiPot && hiAcc) return "prioriser";
  if (hiPot && !hiAcc) return "planifier";
  if (!hiPot && hiAcc) return "opportuniste";
  return "ecarter";
}

export function scoreOne(o: { offer: number; company: number; zone: number; intent: number }): ScoreResult {
  const potentiel = Math.round(0.5 * o.offer + 0.25 * o.company + 0.25 * o.intent);
  const accessibilite = o.zone;
  const openness = Math.round(
    WEIGHTS.offer * o.offer + WEIGHTS.company * o.company + WEIGHTS.intent * o.intent + WEIGHTS.zone * o.zone
  );
  return { intent: o.intent, potentiel, accessibilite, openness, tier: tierFor(potentiel, accessibilite) };
}

export function scoreAll<T extends { offer: number; company: number; zone: number; signal?: string; heat: Heat }>(
  list: T[]
): (T & ScoreResult & { rank: number })[] {
  return list
    .map((o) => ({ ...o, ...scoreOne({ offer: o.offer, company: o.company, zone: o.zone, intent: intentOf(o) }) }))
    .sort((a, b) => b.openness - a.openness)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}
