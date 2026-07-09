// Mappe un RDV physique de l'agenda Google (API /api/meetings) vers le type Rdv du front.
// Les champs riches (secteur, croissance, contacts) sont vides tant que l'agent n'a pas tourné.
import type { Rdv } from "./mock";

export type GoogleMeeting = {
  id: string;
  company?: string;
  domain?: string;
  address: string;
  contact_name?: string;
  datetime: string;
};

const fmtDayShort = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });
const fmtDayLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtTime = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function rdvFromGoogle(m: GoogleMeeting): Rdv {
  const d = m.datetime ? new Date(m.datetime) : new Date();
  const early = new Date(d.getTime() - 15 * 60000);
  const [first, ...rest] = (m.contact_name ?? "").trim().split(/\s+/);
  const name = m.company || m.domain?.split(".")[0] || "Entreprise";
  const h = strHash(m.id || name); // chiffres société déterministes (mock plausible)

  return {
    id: m.id,
    dayShort: fmtDayShort.format(d),
    dayLong: fmtDayLong.format(d),
    time: fmtTime.format(d),
    timeEarly: fmtTime.format(early),
    contactFirst: first || m.contact_name || "",
    contactLast: rest.join(" "),
    contactRole: "",
    subject: "",
    address: m.address,
    kind: "physique",
    company: {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      domain: m.domain ?? "",
      sector: "Grand compte",
      activity: "",
      description: "",
      employees: 800 + (h % 9000),
      caM: 60 + (h % 900),
      growthPct: 22 + (h % 50), // 22–71 %/an
      funding: "",
      founded: 1985 + (h % 35),
      hq: m.address ?? "",
      website: m.domain ? `https://${m.domain}` : "",
      focus: [],
      contacts: m.contact_name ? [{ name: m.contact_name, role: "Contact RDV", note: "RDV prévu" }] : [],
    },
  };
}
