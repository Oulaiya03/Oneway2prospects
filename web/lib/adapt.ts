// web/lib/adapt.ts
// Pont d'intégration : transforme le JSON de sortie de l'agent (agent/loop.ts → validateResult)
// vers nos types front (Rdv, Prospect, Neighbor, brief). Pur, sans I/O — réutilisable serveur & client.
//
// L'agent NE renvoie PAS : score numérique, tier, seniority, level, tenure, distance, ni la fiche
// société structurée (seulement brief.bullets). On dérive/synthétise ces champs ici de façon
// déterministe. Le vrai calcul d'« ouverture » reste dans lib/scoring.ts.

import type { Rdv, Prospect, Neighbor, CompanyInfo } from "./mock";
import type { Heat } from "./scoring";

// ---- Miroir EXACT du contrat de sortie de l'agent (validateResult, agent/loop.ts) ----
export type TourLocation = "same_company" | "same_building" | "nearby";

export type TourItem = {
  name: string;
  title: string;
  company: string;
  location: TourLocation;
  why: string; // le signal (texte libre)
  warm: boolean; // Folk : déjà connu
  recommended: boolean; // top-3 = à voir sur place
  email: string;
  phone: string;
  email_status: string; // FullEnrich : DELIVERABLE | HIGH_PROBABILITY | CATCH_ALL | ...
  hook: string; // message café en français
};

export type AgentResult = {
  meeting: { company: string; datetime: string };
  brief: { company: string; bullets: string[]; audio_text: string };
  tour: TourItem[];
};

// Le brief agent → forme consommable par BriefView.
export type AgentBrief = { company: string; bullets: string[]; audioText: string };

// Contexte du déclencheur (event agenda Graph) : l'agent ne ré-émet PAS adresse/contact/fiche.
export type MeetingTrigger = {
  address?: string;
  contactName?: string;
  contactRole?: string;
  subject?: string;
  domain?: string;
  company?: Partial<CompanyInfo>;
};

// ---------- Helpers ----------
export function splitName(full: string): { first: string; last: string } {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  const [first, ...rest] = parts;
  return { first, last: rest.join(" ") };
}

const C_LEVEL =
  /\b(ceo|cto|cfo|coo|cmo|cio|cdo|ciso|cro)\b|chief|directeur g[eé]n[eé]ral|managing director|pr[eé]sident|founder|fondateur|associ[eé]|\bpartner\b|g[eé]rant/i;

export function deriveSeniority(title: string): "C-level" | "M-level" {
  return C_LEVEL.test(title || "") ? "C-level" : "M-level";
}

export function levelFromLocation(loc: TourLocation): 1 | 2 | 3 {
  return loc === "same_company" ? 1 : loc === "same_building" ? 2 : 3;
}

export function deriveHeat(item: TourItem): Heat {
  const hasSignal = !!(item.why && item.why.trim());
  if (item.recommended && hasSignal) return "hot";
  if (hasSignal || item.warm) return "warm";
  return "cool";
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Bonus d'accessibilité selon la délivrabilité de l'email (FullEnrich).
function deliverabilityBonus(status: string): number {
  const s = (status || "").toUpperCase();
  if (s.includes("DELIVERABLE") || s === "VALID") return 12;
  if (s.includes("HIGH")) return 8;
  if (s.includes("CATCH")) return 2;
  return 0;
}

// L'agent ne renvoie AUCUN score → on synthétise offer/company/zone (0-100) de façon
// déterministe à partir des signaux disponibles. scoring.scoreOne() calcule ensuite l'ouverture.
function synthAxes(item: TourItem): { offer: number; company: number; zone: number } {
  const senior = deriveSeniority(item.title) === "C-level";
  const hasSignal = !!(item.why && item.why.trim());
  const offer = clamp((senior ? 78 : 72) + (item.recommended ? 10 : 0) + (hasSignal ? 4 : 0));
  const company = clamp(74 + (item.warm ? 12 : 0) + (hasSignal ? 6 : 0));
  const zoneBase = item.location === "same_company" ? 82 : item.location === "same_building" ? 66 : 52;
  const zone = clamp(zoneBase + deliverabilityBonus(item.email_status) + (item.phone ? 4 : 0));
  return { offer, company, zone };
}

export function slug(s: string): string {
  return (
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x"
  );
}

function domainFromEmail(email: string): string {
  return (email || "").split("@")[1] || "";
}

// ---------- Adaptateurs ----------

// same_company → Prospect[] (les décideurs du compte, ce que l'écran Prospects affiche)
export function adaptProspects(json: AgentResult): Prospect[] {
  return (json.tour || [])
    .filter((t) => t.location === "same_company")
    .map((t, i) => {
      const { first, last } = splitName(t.name);
      const axes = synthAxes(t);
      const p: Prospect = {
        id: slug(t.email || t.name) || `p${i + 1}`,
        first,
        last,
        role: t.title || "",
        seniority: deriveSeniority(t.title),
        level: levelFromLocation(t.location),
        tenure: 0, // non fourni par l'agent
        offer: axes.offer,
        company: axes.company,
        zone: axes.zone,
        heat: deriveHeat(t),
        signal: t.why && t.why.trim() ? t.why : undefined,
        phone: t.phone || "",
        email: t.email || undefined,
        emailStatus: t.email_status || undefined,
        hook: t.hook || undefined,
        recommended: t.recommended,
      };
      return p;
    });
}

// same_building | nearby → Neighbor[] (les comptes voisins de la tournée)
export function adaptNeighbors(json: AgentResult): Neighbor[] {
  return (json.tour || [])
    .filter((t) => t.location !== "same_company")
    .map((t) => {
      const status: Neighbor["status"] = t.warm ? "warm" : t.why && t.why.trim() ? "signal" : "cold";
      const n: Neighbor = {
        id: slug(t.company || t.name),
        name: t.company || "",
        sector: "",
        activity: "",
        address: "", // l'agent ne propage pas l'adresse/distance des voisins
        distanceM: 0,
        detourMin: 0,
        employees: 0,
        caM: 0,
        growthPct: 0,
        fit: synthAxes(t).company,
        status,
        signals: t.why && t.why.trim() ? [t.why] : [],
        contact: { name: t.name || "", role: t.title || "" },
        note: t.hook || "",
      };
      return n;
    });
}

export function adaptBrief(json: AgentResult): AgentBrief {
  return {
    company: (json.brief && json.brief.company) || (json.meeting && json.meeting.company) || "",
    bullets: Array.isArray(json.brief && json.brief.bullets) ? json.brief.bullets : [],
    audioText: (json.brief && json.brief.audio_text) || "",
  };
}

// meeting{company,datetime} + contexte déclencheur → Rdv (fiche société = shell, à enrichir).
export function adaptRdv(json: AgentResult, trigger: MeetingTrigger = {}): Rdv {
  const dt = parseDateTime((json.meeting && json.meeting.datetime) || "");
  const { first, last } = splitName(trigger.contactName || "");
  const base = trigger.company || {};
  const domain = trigger.domain || base.domain || domainFromEmail((json.tour && json.tour[0] && json.tour[0].email) || "");
  const name = (json.meeting && json.meeting.company) || base.name || "";
  const company: CompanyInfo = {
    name,
    domain,
    sector: base.sector || "",
    activity: base.activity || "",
    description: base.description || (json.brief && json.brief.bullets && json.brief.bullets[0]) || "",
    employees: base.employees ?? 0,
    caM: base.caM ?? 0,
    growthPct: base.growthPct ?? 0,
    funding: base.funding || "",
    founded: base.founded ?? 0,
    hq: base.hq || trigger.address || "",
    website: base.website || (domain ? `https://${domain}` : ""),
    focus: base.focus || [],
    contacts: base.contacts || [],
  };
  return {
    id: slug(name) || "rdv",
    dayShort: dt.dayShort,
    dayLong: dt.dayLong,
    time: dt.time,
    timeEarly: dt.timeEarly,
    contactFirst: first,
    contactLast: last,
    contactRole: trigger.contactRole || "",
    subject: trigger.subject || "",
    address: trigger.address || "",
    kind: "physique",
    company,
    next: true,
  };
}

// Agrégateur : ce que /api/run renvoie au front.
export function adaptRun(json: AgentResult, trigger: MeetingTrigger = {}) {
  return {
    rdv: adaptRdv(json, trigger),
    prospects: adaptProspects(json),
    neighbors: adaptNeighbors(json),
    brief: adaptBrief(json),
  };
}

// Meeting brut (Google Calendar / Graph) → Rdv minimal pour l'affichage de l'agenda.
// Les champs d'enrichissement (secteur, effectif, contacts, distance) restent vides tant que
// l'agent n'a pas tourné sur ce compte.
export function meetingToRdv(m: {
  id?: string;
  company?: string;
  domain?: string;
  address?: string;
  contact_name?: string;
  datetime?: string;
}): Rdv {
  const dt = parseDateTime(m.datetime || "");
  const { first, last } = splitName(m.contact_name || "");
  const domain = m.domain || "";
  const name = m.company || (domain ? domain.split(".")[0].replace(/^./, (c) => c.toUpperCase()) : "RDV");
  return {
    id: m.id || slug(name),
    dayShort: dt.dayShort,
    dayLong: dt.dayLong,
    time: dt.time,
    timeEarly: dt.timeEarly,
    contactFirst: first,
    contactLast: last,
    contactRole: "",
    subject: "",
    address: m.address || "",
    kind: "physique",
    company: {
      name,
      domain,
      sector: "",
      activity: "",
      description: "",
      employees: 0,
      caM: 0,
      growthPct: 0,
      funding: "",
      founded: 0,
      hq: m.address || "",
      website: domain ? `https://${domain}` : "",
      focus: [],
      contacts: [],
    },
    next: true,
  };
}

// ---- Date ISO → libellés FR (jour court/long, heure, heure-15) ----
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const JOURS_ABBR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MOIS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function parseDateTime(iso: string): { dayShort: string; dayLong: string; time: string; timeEarly: string } {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { dayShort: "", dayLong: "", time: "", timeEarly: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  const early = new Date(d.getTime() - 15 * 60000);
  return {
    dayShort: `${JOURS_ABBR[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`,
    dayLong: `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS_LONG[d.getMonth()]}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    timeEarly: `${pad(early.getHours())}:${pad(early.getMinutes())}`,
  };
}
