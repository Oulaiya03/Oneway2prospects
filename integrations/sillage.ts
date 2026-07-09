// Dev B : Sillage (signaux d'intent).
// Le SETUP (persona, top accounts, agents) et les RUNS se pilotent via le MCP Sillage
// (sillage_v2_*). Ce module = ce que l'AGENT lit au runtime : des signaux normalises.
//
// Deux sources possibles :
//   - getSignals()            -> lit le cache local data/signals.json (fige depuis un run Sillage)
//   - normalizeSignals(raw)   -> normalise la sortie brute du MCP list_signals (usage live)
//
// Le cache data/signals.json contient de VRAIS posts LinkedIn -> gitignore (data reelle).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export type SignalType = "job_change" | "employer_brand" | "engagement";

export type Signal = {
  company: string | null; // ex: "Allianz France"
  person: string | null; // auteur du post / personne concernee
  type: SignalType | string; // job_change | employer_brand | engagement
  summary: string; // resume court (sert au hook cafe)
  excerpt?: string; // extrait du post
  source_url?: string; // lien LinkedIn
  date?: string | null;
  origin?: string; // "sillage"
};

const CACHE_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "signals.json");

// Boites suivies (pour deviner l'entreprise depuis le texte d'un signal).
const COMPANIES: [string, string][] = [
  ["allianz", "Allianz France"], ["axa", "AXA France"], ["generali", "Generali France"],
  ["maif", "MAIF"], ["macif", "MACIF"], ["groupama", "Groupama"], ["cnp", "CNP Assurances"],
  ["mma", "MMA"], ["gmf", "GMF"], ["matmut", "Matmut"], ["swiss life", "Swiss Life France"],
  ["abeille", "Abeille Assurances"],
];

function detectCompany(text: string | null): string | null {
  const t = (text ?? "").toLowerCase();
  for (const [key, name] of COMPANIES) if (t.includes(key)) return name;
  return null;
}

function detectType(text: string | null): SignalType {
  const t = (text ?? "").toLowerCase();
  if (/nouveau chapitre|démarrer un nouveau|je rejoins|ravi de rejoindre|nommé|prends? mes fonctions/.test(t))
    return "job_change";
  if (/recrut|talent|candidat|marque employeur|onboarding|nous recherchons|devenez|arrivée/.test(t))
    return "employer_brand";
  return "engagement";
}

// --- Lecture du cache local (source fiable pour la demo) ---
export function getSignals(): Signal[] {
  try {
    const json = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
    return (json.signals ?? []) as Signal[];
  } catch {
    return []; // pas de cache -> l'agent gere le "aucun signal"
  }
}

// Signaux filtres pour une entreprise (par nom d'entreprise OU mention dans l'extrait).
export function getSignalsForCompany(company: string): Signal[] {
  const c = company.toLowerCase();
  return getSignals().filter(
    (s) =>
      (s.company ?? "").toLowerCase().includes(c) ||
      (s.excerpt ?? "").toLowerCase().includes(c) ||
      (s.summary ?? "").toLowerCase().includes(c),
  );
}

// --- Normalisation de la sortie brute du MCP Sillage (list_signals) ---
// Dedupe par (auteur + debut d'extrait) et mappe vers le type Signal.
export function normalizeSignals(raw: any[]): Signal[] {
  const seen = new Map<string, Signal>();
  for (const s of raw ?? []) {
    const person = (s.author && (s.author.name || s.author.full_name)) || null;
    const excerpt = (s.excerpt ?? "").replace(/\s+/g, " ").trim();
    const key = `${person ?? ""}|${excerpt.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.set(key, {
      company: detectCompany(excerpt) ?? detectCompany(person),
      person,
      type: detectType(excerpt),
      summary: excerpt.slice(0, 180),
      excerpt: excerpt.slice(0, 400),
      source_url: (s.source_url ?? "").split("?")[0],
      date: s.signal_date ?? s.detected_at ?? null,
      origin: "sillage",
    });
  }
  return [...seen.values()];
}
