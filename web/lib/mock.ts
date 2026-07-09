// Données de démonstration DeskOffer.
import type { Heat } from "./scoring";

export type ToolName = "Graph" | "Outlook" | "FullEnrich" | "Gradium" | "Sillage" | "Claude" | "HeyReach";

export const month = "Juillet 2026";
export const monthStats = { planned: 8, potential: 24 };

export type CompanyContact = { name: string; role: string; note?: string };

export type CompanyInfo = {
  name: string;
  domain: string;
  sector: string;
  activity: string; // ce sur quoi ils sont (court)
  description: string;
  employees: number;
  caM: number; // chiffre d'affaires en M€
  growthPct: number; // croissance annuelle %
  funding: string;
  founded: number;
  hq: string;
  website: string;
  focus: string[];
  contacts: CompanyContact[];
};

export type Rdv = {
  id: string;
  dayShort: string;
  dayLong: string;
  time: string;
  timeEarly: string; // heure - 15 min
  contactFirst: string;
  contactLast: string;
  contactRole: string;
  subject: string; // sujet du RDV originel
  address: string;
  kind: "physique" | "visio";
  company: CompanyInfo;
  next?: boolean;
};

export const rdvs: Rdv[] = [
  {
    id: "voltane",
    dayShort: "Mar. 14 juil.",
    dayLong: "mardi 14 juillet",
    time: "10:30",
    timeEarly: "10:15",
    contactFirst: "Julien",
    contactLast: "Mercier",
    contactRole: "Directeur des Opérations",
    subject: "l'optimisation de votre supply chain énergie",
    address: "15 av. de Wagram, Paris 17e",
    kind: "physique",
    company: {
      name: "Voltane",
      domain: "voltane.io",
      sector: "Cleantech · Stockage d'énergie",
      activity: "Stockage batterie & pilotage énergétique",
      description:
        "Éditeur de solutions de stockage batterie et de pilotage énergétique pour sites industriels et opérateurs de réseau.",
      employees: 210,
      caM: 28,
      growthPct: 65,
      funding: "Série B · 12 M€",
      founded: 2019,
      hq: "Paris, FR",
      website: "https://voltane.io",
      focus: ["Stockage batterie", "Pilotage réseau", "Optimisation conso", "Data énergie"],
      contacts: [
        { name: "Julien Mercier", role: "Directeur des Opérations", note: "RDV prévu" },
        { name: "Sarah Lemoine", role: "VP Engineering" },
        { name: "Thomas Bianchi", role: "CTO" },
      ],
    },
    next: true,
  },
  {
    id: "bareme",
    dayShort: "Mar. 14 juil.",
    dayLong: "mardi 14 juillet",
    time: "15:00",
    timeEarly: "14:45",
    contactFirst: "Sofia",
    contactLast: "Nguyen",
    contactRole: "Head of Finance",
    subject: "l'automatisation de vos clôtures comptables",
    address: "Tour Cœur Défense, Puteaux",
    kind: "physique",
    company: {
      name: "Barème",
      domain: "bareme.co",
      sector: "Fintech · Comptabilité",
      activity: "Automatisation de la clôture comptable",
      description:
        "Plateforme d'automatisation comptable et de reporting financier pour PME et cabinets d'expertise.",
      employees: 140,
      caM: 19,
      growthPct: 48,
      funding: "Série A · 6 M€",
      founded: 2020,
      hq: "Puteaux, FR",
      website: "https://bareme.co",
      focus: ["Clôture automatisée", "Reporting", "Rapprochement bancaire", "API compta"],
      contacts: [
        { name: "Sofia Nguyen", role: "Head of Finance", note: "RDV prévu" },
        { name: "Paul Reynaud", role: "CFO" },
        { name: "Léna Girard", role: "Head of Product" },
      ],
    },
  },
  {
    id: "fildu",
    dayShort: "Jeu. 16 juil.",
    dayLong: "jeudi 16 juillet",
    time: "11:00",
    timeEarly: "10:45",
    contactFirst: "Awa",
    contactLast: "Diallo",
    contactRole: "COO",
    subject: "le pilotage de votre logistique retail",
    address: "22 rue du Sentier, Paris 2e",
    kind: "physique",
    company: {
      name: "Fildu",
      domain: "fildu.fr",
      sector: "Retail tech · Supply chain",
      activity: "Pilotage logistique retail",
      description:
        "Suite de pilotage des stocks et de la logistique omnicanale pour enseignes de distribution.",
      employees: 320,
      caM: 54,
      growthPct: 32,
      funding: "Série B · 20 M€",
      founded: 2017,
      hq: "Paris, FR",
      website: "https://fildu.fr",
      focus: ["Gestion des stocks", "Prévision demande", "Omnicanal", "Traçabilité"],
      contacts: [
        { name: "Awa Diallo", role: "COO", note: "RDV prévu" },
        { name: "Marc Lévy", role: "CTO" },
        { name: "Chloé Petit", role: "Head of Supply" },
      ],
    },
  },
  {
    id: "ampho",
    dayShort: "Ven. 17 juil.",
    dayLong: "vendredi 17 juillet",
    time: "09:30",
    timeEarly: "09:15",
    contactFirst: "Élodie",
    contactLast: "Berger",
    contactRole: "VP Operations",
    subject: "la fiabilisation de vos données d'essais cliniques",
    address: "6 rue Watt, Paris 13e",
    kind: "physique",
    company: {
      name: "Ampho",
      domain: "ampho.bio",
      sector: "Biotech · Essais cliniques",
      activity: "Données d'essais cliniques",
      description:
        "Plateforme de collecte et fiabilisation des données d'essais cliniques pour laboratoires et CRO.",
      employees: 95,
      caM: 12,
      growthPct: 80,
      funding: "Série A · 9 M€",
      founded: 2021,
      hq: "Paris, FR",
      website: "https://ampho.bio",
      focus: ["Data clinique", "Conformité", "eCRF", "Qualité données"],
      contacts: [
        { name: "Élodie Berger", role: "VP Operations", note: "RDV prévu" },
        { name: "Simon Roy", role: "CTO" },
        { name: "Amira Zed", role: "Head of Data" },
      ],
    },
  },
  {
    id: "neolic",
    dayShort: "Lun. 20 juil.",
    dayLong: "lundi 20 juillet",
    time: "14:00",
    timeEarly: "13:45",
    contactFirst: "Marc",
    contactLast: "Ober",
    contactRole: "Directeur Logistique",
    subject: "l'optimisation de vos tournées de livraison",
    address: "Parc des Barbanniers, Gennevilliers",
    kind: "physique",
    company: {
      name: "Néolic",
      domain: "neolic.com",
      sector: "Logistique · Transport",
      activity: "Optimisation des tournées",
      description:
        "Opérateur logistique avec une brique d'optimisation de tournées et de gestion de flotte pour le dernier kilomètre.",
      employees: 480,
      caM: 87,
      growthPct: 21,
      funding: "Rentable · non financé",
      founded: 2012,
      hq: "Gennevilliers, FR",
      website: "https://neolic.com",
      focus: ["Optimisation tournées", "Gestion de flotte", "Dernier km", "Télématique"],
      contacts: [
        { name: "Marc Ober", role: "Directeur Logistique", note: "RDV prévu" },
        { name: "Sandra Klein", role: "CIO" },
        { name: "Yassine Ould", role: "Head of Ops" },
      ],
    },
  },
  {
    id: "skyr",
    dayShort: "Mar. 21 juil.",
    dayLong: "mardi 21 juillet",
    time: "10:00",
    timeEarly: "09:45",
    contactFirst: "Hugo",
    contactLast: "Petit",
    contactRole: "CEO",
    subject: "le passage à l'échelle de votre plateforme RH",
    address: "18 rue de Londres, Paris 9e",
    kind: "physique",
    company: {
      name: "Skÿr",
      domain: "skyr.hr",
      sector: "SaaS · RH",
      activity: "Plateforme RH tout-en-un",
      description:
        "Plateforme RH tout-en-un (paie, onboarding, gestion des talents) pour scale-ups en hypercroissance.",
      employees: 70,
      caM: 9,
      growthPct: 110,
      funding: "Série A · 11 M€",
      founded: 2022,
      hq: "Paris, FR",
      website: "https://skyr.hr",
      focus: ["Paie", "Onboarding", "Gestion des talents", "SIRH"],
      contacts: [
        { name: "Hugo Petit", role: "CEO", note: "RDV prévu" },
        { name: "Marie Ndiaye", role: "CTO" },
        { name: "Alex Fournier", role: "VP Engineering" },
      ],
    },
  },
  {
    id: "trame",
    dayShort: "Jeu. 23 juil.",
    dayLong: "jeudi 23 juillet",
    time: "11:30",
    timeEarly: "11:15",
    contactFirst: "Nadia",
    contactLast: "Faure",
    contactRole: "Directrice Industrielle",
    subject: "la maintenance prédictive de vos lignes",
    address: "40 rue de Paris, Montreuil",
    kind: "physique",
    company: {
      name: "Trame",
      domain: "trame-industrie.fr",
      sector: "Industrie · Manufacturing",
      activity: "Maintenance prédictive",
      description:
        "Industriel équipant ses lignes de production de capteurs et d'analyse prédictive pour réduire les arrêts machine.",
      employees: 610,
      caM: 120,
      growthPct: 14,
      funding: "ETI · non financé",
      founded: 2004,
      hq: "Montreuil, FR",
      website: "https://trame-industrie.fr",
      focus: ["Maintenance prédictive", "IoT industriel", "Supervision", "MES"],
      contacts: [
        { name: "Nadia Faure", role: "Directrice Industrielle", note: "RDV prévu" },
        { name: "Bruno Meyer", role: "CIO" },
        { name: "Théo Lambert", role: "Head of Data" },
      ],
    },
  },
  {
    id: "oria",
    dayShort: "Ven. 24 juil.",
    dayLong: "vendredi 24 juillet",
    time: "16:00",
    timeEarly: "15:45",
    contactFirst: "Thomas",
    contactLast: "Leroy",
    contactRole: "CIO",
    subject: "l'interopérabilité de vos dossiers patients",
    address: "92 av. du Général Leclerc, Boulogne",
    kind: "physique",
    company: {
      name: "Oria Santé",
      domain: "oria-sante.fr",
      sector: "Healthtech · Dossier patient",
      activity: "Interopérabilité du dossier patient",
      description:
        "Éditeur d'une couche d'interopérabilité entre logiciels hospitaliers et dossiers patients informatisés.",
      employees: 260,
      caM: 41,
      growthPct: 37,
      funding: "Série B · 18 M€",
      founded: 2016,
      hq: "Boulogne-Billancourt, FR",
      website: "https://oria-sante.fr",
      focus: ["Interopérabilité", "Dossier patient", "HL7 / FHIR", "Sécurité données"],
      contacts: [
        { name: "Thomas Leroy", role: "CIO", note: "RDV prévu" },
        { name: "Julie Caron", role: "CTO" },
        { name: "Nour Haddad", role: "Head of Platform" },
      ],
    },
  },
];

// L'offre de Nicolas — base du calcul d'adéquation « offre » et du brief.
export const offer = {
  name: "Plateforme data & scale engineering",
  oneLiner: "Fiabiliser la donnée pendant l'hypercroissance, sans ralentir les équipes.",
  icp: "Scale-ups tech en forte croissance · équipes data/produit de 50-500",
  pitch: [
    "Fiabiliser la plateforme data pendant la montée en charge (recrutements, migration cloud).",
    "Réduire de ~40 % le temps d'intégration des nouvelles équipes data.",
    "Cadre éprouvé sur des scale-ups cleantech / SaaS comparables.",
  ],
};

// Point de départ de Nicolas (distance / temps de trajet).
export const office = { name: "Amaris", city: "Paris 8e" };

// Logistique trajet + avancement du pipeline, par RDV.
export const rdvMeta: Record<string, { distanceKm: number; travelMin: number; potential: number; contacted: number }> = {
  voltane: { distanceKm: 6.2, travelMin: 22, potential: 18, contacted: 5 },
  bareme: { distanceKm: 9.8, travelMin: 31, potential: 14, contacted: 2 },
  fildu: { distanceKm: 3.1, travelMin: 14, potential: 22, contacted: 8 },
  ampho: { distanceKm: 5.5, travelMin: 19, potential: 12, contacted: 0 },
  neolic: { distanceKm: 12.4, travelMin: 34, potential: 20, contacted: 3 },
  skyr: { distanceKm: 2.4, travelMin: 11, potential: 16, contacted: 6 },
  trame: { distanceKm: 8.0, travelMin: 27, potential: 24, contacted: 1 },
  oria: { distanceKm: 7.3, travelMin: 25, potential: 15, contacted: 4 },
};

// Créneaux visio proposables (« on se croise 30 min »).
export const visioSlots = ["Lun. 21 juil. · 14:00", "Mer. 23 juil. · 10:30", "Ven. 25 juil. · 16:00"];

// Conversations Inbox « RDV pris » → brief.
export const convBrief: Record<string, { prospectId: string; rdvId: string }> = {
  c1: { prospectId: "p1", rdvId: "voltane" },
  c2: { prospectId: "p3", rdvId: "voltane" },
};

// Label 3 niveaux (échelle de portée du prospect).
export const LEVEL_META: Record<1 | 2 | 3, { tag: string; label: string; color: string; soft: string }> = {
  1: { tag: "LEVEL 1", label: "Prospect Account", color: "#0f4a40", soft: "#e5efeb" },
  2: { tag: "LEVEL 2", label: "Prospect Holding", color: "#8a5a1f", soft: "#f4ead8" },
  3: { tag: "LEVEL 3", label: "Prospect Area", color: "#3f5f8c", soft: "#e4eaf3" },
};

export type Prospect = {
  id: string;
  first: string;
  last: string;
  role: string;
  seniority: "C-level" | "M-level";
  level: 1 | 2 | 3;
  tenure: number; // ancienneté en années
  offer: number;
  company: number;
  zone: number;
  heat: Heat;
  signal?: string;
  signalAge?: string;
  phone: string;
  // Champs réels quand les données viennent de l'agent (sinon dérivés du mock).
  email?: string; // email vérifié (FullEnrich) — sinon calculé via emailFor()
  emailStatus?: string; // délivrabilité FullEnrich (DELIVERABLE, HIGH_PROBABILITY…)
  hook?: string; // message café rédigé par l'agent
  recommended?: boolean; // top-3 recommandé par l'agent (à voir sur place)
};

// 18 décideurs M-level et C-level. Signaux formulés sans nom d'entreprise (réutilisables).
export const prospects: Prospect[] = [
  { id: "p1", first: "Sarah", last: "Lemoine", role: "VP Engineering", seniority: "M-level", level: 1, tenure: 3, offer: 92, company: 90, zone: 88, heat: "hot", signal: "Recrute 4 Data Engineers — offres publiées cette semaine", signalAge: "il y a 9 j", phone: "+33 6 74 21 08 55" },
  { id: "p2", first: "Thomas", last: "Bianchi", role: "CTO", seniority: "C-level", level: 1, tenure: 5, offer: 88, company: 86, zone: 72, heat: "warm", signal: "A publié sur sa migration cloud et le passage à l'échelle data", signalAge: "il y a 6 j", phone: "+33 6 11 90 42 17" },
  { id: "p3", first: "Inès", last: "Caron", role: "Directrice des Achats", seniority: "M-level", level: 2, tenure: 7, offer: 82, company: 84, zone: 68, heat: "warm", signal: "Série B bouclée — budgets d'équipement en hausse", signalAge: "il y a 3 sem.", phone: "+33 6 58 33 71 09" },
  { id: "p4", first: "Karim", last: "Haddad", role: "Head of Data", seniority: "M-level", level: 1, tenure: 2, offer: 84, company: 80, zone: 55, heat: "warm", signal: "Recherche active d'une solution d'observabilité data (post LinkedIn)", signalAge: "il y a 12 j", phone: "+33 6 27 45 66 80" },
  { id: "p5", first: "Léa", last: "Fontaine", role: "CFO", seniority: "C-level", level: 2, tenure: 4, offer: 68, company: 88, zone: 40, heat: "cool", signal: "Clôture budgétaire du semestre en cours", signalAge: "il y a 1 mois", phone: "+33 6 90 12 33 47" },
  { id: "p6", first: "Antoine", last: "Rey", role: "COO", seniority: "C-level", level: 1, tenure: 6, offer: 80, company: 78, zone: 70, heat: "warm", signal: "Réorganisation des opérations annoncée en interne", signalAge: "il y a 2 sem.", phone: "+33 6 41 55 20 88" },
  { id: "p7", first: "Chloé", last: "Moreau", role: "Head of Platform", seniority: "M-level", level: 1, tenure: 1, offer: 86, company: 74, zone: 64, heat: "warm", signal: "Nouvelle prise de poste — 90 premiers jours", signalAge: "il y a 5 sem.", phone: "+33 6 12 47 63 90" },
  { id: "p8", first: "Marc", last: "Dubreuil", role: "CIO", seniority: "C-level", level: 3, tenure: 9, offer: 76, company: 82, zone: 58, heat: "warm", signal: "Appel d'offres SI mentionné dans la presse spécialisée", signalAge: "il y a 3 sem.", phone: "+33 6 33 71 04 26" },
  { id: "p9", first: "Sofia", last: "Nguyen", role: "VP Finance", seniority: "M-level", level: 1, tenure: 3, offer: 72, company: 76, zone: 62, heat: "cool", phone: "+33 6 84 29 15 07" },
  { id: "p10", first: "Julien", last: "Bassi", role: "Directeur Commercial", seniority: "M-level", level: 1, tenure: 8, offer: 70, company: 70, zone: 74, heat: "cool", phone: "+33 6 27 88 40 13" },
  { id: "p11", first: "Nadia", last: "Slimani", role: "CMO", seniority: "C-level", level: 2, tenure: 4, offer: 60, company: 72, zone: 66, heat: "cool", signal: "Refonte de la marque en préparation", signalAge: "il y a 1 mois", phone: "+33 6 55 12 78 34" },
  { id: "p12", first: "Pierre", last: "Vidal", role: "Head of Infrastructure", seniority: "M-level", level: 1, tenure: 5, offer: 82, company: 68, zone: 60, heat: "warm", signal: "Incident de production évoqué publiquement", signalAge: "il y a 2 sem.", phone: "+33 6 90 63 21 45" },
  { id: "p13", first: "Camille", last: "Roux", role: "Chief Data Officer", seniority: "C-level", level: 1, tenure: 2, offer: 88, company: 72, zone: 52, heat: "warm", signal: "Structuration d'une équipe data mentionnée en interview", signalAge: "il y a 3 sem.", phone: "+33 6 14 50 92 77" },
  { id: "p14", first: "Hugo", last: "Marchand", role: "Directeur Technique adjoint", seniority: "M-level", level: 3, tenure: 6, offer: 66, company: 60, zone: 78, heat: "cool", phone: "+33 6 71 33 08 52" },
  { id: "p15", first: "Émilie", last: "Garnier", role: "VP Product", seniority: "M-level", level: 1, tenure: 3, offer: 64, company: 66, zone: 70, heat: "cool", phone: "+33 6 48 20 61 39" },
  { id: "p16", first: "Yann", last: "Prevost", role: "Directeur Général adjoint", seniority: "C-level", level: 2, tenure: 11, offer: 58, company: 78, zone: 44, heat: "cool", phone: "+33 6 60 17 84 22" },
  { id: "p17", first: "Laura", last: "Benici", role: "Head of Procurement", seniority: "M-level", level: 3, tenure: 4, offer: 54, company: 58, zone: 72, heat: "cool", phone: "+33 6 39 75 11 68" },
  { id: "p18", first: "David", last: "Aubry", role: "Managing Director", seniority: "C-level", level: 2, tenure: 13, offer: 62, company: 74, zone: 48, heat: "cool", signal: "Ouverture d'un nouveau site annoncée", signalAge: "il y a 1 mois", phone: "+33 6 22 90 53 41" },
];

export function emailFor(p: Prospect, domain: string): string {
  const strip = (s: string) =>
    Array.from(s.toLowerCase().normalize("NFD"))
      .filter((ch) => {
        const c = ch.charCodeAt(0);
        return c < 0x300 || c > 0x36f;
      })
      .join("")
      .replace(/[^a-z]/g, "");
  return `${strip(p.first)}.${strip(p.last)}@${domain}`;
}

export type Step = {
  id: string;
  tool: ToolName;
  action: string;
  result: string;
  ms: number;
};

export const steps: Step[] = [
  { id: "s1", tool: "Graph", action: "Lecture de l'agenda — RDV physiques (Google Agenda)", result: "RDV physique · {dayLong} {time} · {company}", ms: 1000 },
  { id: "s2", tool: "Claude", action: "Identification du compte via le domaine du contact", result: "{domain} → {company} · {sector}", ms: 950 },
  { id: "s3", tool: "FullEnrich", action: "Cartographie du compte — décideurs M-level & C-level", result: "18 décideurs · emails vérifiés · téléphones directs", ms: 1500 },
  { id: "s4", tool: "Sillage", action: "Détection des signaux d'intention", result: "signaux rattachés · recrutement, levée, réorg", ms: 1300 },
  { id: "s5", tool: "Gradium", action: "Fiche de brief en audio (TTS) — prête pour le trajet", result: "note vocale générée · à écouter avant le RDV", ms: 1400 },
];

// Cadence multi-touch générée par prospect + contexte du RDV.
export type Channel = "email" | "call" | "linkedin_invite" | "linkedin_dm";

export const CHANNEL_META: Record<Channel, { label: string; color: string }> = {
  email: { label: "Email", color: "#0f4a40" },
  call: { label: "Cold call", color: "#b5810f" },
  linkedin_invite: { label: "Invitation LinkedIn", color: "#2f6bd6" },
  linkedin_dm: { label: "DM LinkedIn", color: "#2f6bd6" },
};

export type Touch = {
  t: number;
  day: number;
  channel: Channel;
  tool: string;
  title: string;
  auto: boolean;
  content: string[];
  note?: string;
  usesSillage?: boolean;
};

export function buildCadence(p: Prospect, rdv: Rdv): Touch[] {
  const c = rdv.company.name;
  const intent = p.signal ? p.signal.charAt(0).toLowerCase() + p.signal.slice(1) : "vos enjeux du moment";
  return [
    {
      t: 1,
      day: 0,
      channel: "email",
      tool: "Outlook",
      title: "Email d'introduction",
      auto: false,
      note: "Objet & 1re phrase = présence physique. L'intent vient plus tard.",
      content: [
        `Objet : Dans vos locaux ${rdv.dayLong} — 15 min à votre accueil ?`,
        `Bonjour ${p.first} ${p.last},`,
        `Je serai dans vos locaux ${rdv.dayLong} à ${rdv.time} pour voir ${rdv.contactFirst} ${rdv.contactLast} (${rdv.contactRole}) et parler de ${rdv.subject}.`,
        `Puisque je suis déjà sur place, seriez-vous disponible vers ${rdv.timeEarly} pour se rencontrer à votre accueil ? J'ai une idée à vous partager.`,
        `Bien à vous,\nNicolas`,
      ],
    },
    {
      t: 2,
      day: 2,
      channel: "call",
      tool: "Téléphone",
      title: "Script cold call",
      auto: false,
      usesSillage: true,
      note: "Ici on introduit l'intent Sillage (people / entreprise).",
      content: [
        `Accroche : « Bonjour ${p.first}, Nicolas d'Amaris — j'étais chez ${c} ${rdv.dayLong} pour voir ${rdv.contactFirst} ${rdv.contactLast}. »`,
        `Transition intent : rebondir sur ${intent}.`,
        `Question ouverte : « Comment gérez-vous ce sujet aujourd'hui de votre côté ? »`,
        `Objectif : caler 30 min de découverte — pas vendre.`,
      ],
    },
    {
      t: 3,
      day: 3,
      channel: "linkedin_invite",
      tool: "HeyReach",
      title: "Invitation LinkedIn",
      auto: true,
      content: [
        `Note de connexion :`,
        `${p.first}, ravi d'être passé chez ${c} cette semaine. Au plaisir d'échanger par ici.`,
      ],
    },
    {
      t: 4,
      day: 5,
      channel: "email",
      tool: "Outlook",
      title: "Relance email",
      auto: false,
      usesSillage: true,
      note: "Le signal Sillage est développé ici.",
      content: [
        `Objet : Suite à mon passage chez ${c}`,
        `Bonjour ${p.first},`,
        `Je reviens vers vous suite à mon passage. En lien avec ${intent}, je vous partage un retour d'expérience concret d'une structure comparable — 2 min de lecture.`,
        `Dispo 15 min cette semaine si le sujet résonne.`,
        `Nicolas`,
      ],
    },
    {
      t: 5,
      day: 8,
      channel: "linkedin_dm",
      tool: "HeyReach",
      title: "DM LinkedIn",
      auto: true,
      content: [
        `Message direct :`,
        `${p.first}, je ne veux pas être insistant — si le sujet n'est pas prioritaire ce trimestre, dites-le moi et je reviendrai plus tard. Sinon, 15 min quand vous voulez.`,
      ],
    },
  ];
}

// ---- Statistiques de campagne (analytics) ----
export const statKpis = [
  { label: "Prospects contactés", value: "128", delta: "+18%", up: true },
  { label: "Taux d'ouverture", value: "62%", delta: "+4 pts", up: true },
  { label: "Taux de réponse", value: "24%", delta: "+3 pts", up: true },
  { label: "RDV générés", value: "9", delta: "+3", up: true },
];

// Entonnoir de conversion (magnitude décroissante).
export const funnel = [
  { stage: "Contactés", value: 128 },
  { stage: "Ouverts", value: 79 },
  { stage: "Répondu", value: 31 },
  { stage: "Positifs", value: 14 },
  { stage: "RDV pris", value: 9 },
];

// Réponses générées par touche (quelle touche performe).
export const touchPerf = [
  { touch: "T1 · Email", responses: 11 },
  { touch: "T2 · Cold call", responses: 6 },
  { touch: "T3 · Invitation LinkedIn", responses: 5 },
  { touch: "T4 · Relance email", responses: 6 },
  { touch: "T5 · DM LinkedIn", responses: 3 },
];

export const campaignRows = [
  { name: "Voltane", period: "Juil.", contacted: 16, openRate: 69, replyRate: 25, meetings: 2 },
  { name: "Barème", period: "Juil.", contacted: 14, openRate: 64, replyRate: 21, meetings: 1 },
  { name: "Fildu", period: "Juil.", contacted: 22, openRate: 58, replyRate: 18, meetings: 2 },
  { name: "Ampho", period: "Juin", contacted: 18, openRate: 71, replyRate: 28, meetings: 3 },
  { name: "Néolic", period: "Juin", contacted: 20, openRate: 55, replyRate: 15, meetings: 1 },
  { name: "Skÿr", period: "Juin", contacted: 12, openRate: 74, replyRate: 33, meetings: 3 },
  { name: "Oria Santé", period: "Juin", contacted: 15, openRate: 60, replyRate: 20, meetings: 1 },
  { name: "Trame", period: "Juin", contacted: 11, openRate: 52, replyRate: 14, meetings: 1 },
];

// ---- Inbox (réponses centralisées) ----
export type InboxStatus = "rdv" | "positif" | "relancer" | "negatif";

export const INBOX_STATUS: Record<InboxStatus, { label: string; color: string; soft: string }> = {
  rdv: { label: "RDV pris", color: "#0c6b52", soft: "#e2f0ec" },
  positif: { label: "Positif", color: "#1f7a4d", soft: "#e4f2ea" },
  relancer: { label: "À relancer", color: "#b07d12", soft: "#f6ecd5" },
  negatif: { label: "Négatif", color: "#8a5140", soft: "#f0e7e3" },
};

export type InboxMessage = { from: "nicolas" | "prospect"; via: string; text: string; when: string };
export type Conversation = {
  id: string;
  first: string;
  last: string;
  role: string;
  company: string;
  status: InboxStatus;
  when: string;
  snippet: string;
  unread?: boolean;
  messages: InboxMessage[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    first: "Sarah",
    last: "Lemoine",
    role: "VP Engineering",
    company: "Voltane",
    status: "rdv",
    when: "il y a 2 h",
    unread: true,
    snippet: "Parfait, 10:15 à l'accueil mardi ça me va. À mardi !",
    messages: [
      { from: "nicolas", via: "Email · T1", text: "Je serai dans vos locaux mardi 14 juillet à 10:30 pour voir Julien Mercier. Dispo vers 10:15 à l'accueil ?", when: "lun. 09:12" },
      { from: "prospect", via: "Email", text: "Parfait, 10:15 à l'accueil mardi ça me va. À mardi !", when: "lun. 11:40" },
    ],
  },
  {
    id: "c2",
    first: "Inès",
    last: "Caron",
    role: "Directrice des Achats",
    company: "Voltane",
    status: "rdv",
    when: "il y a 5 h",
    unread: true,
    snippet: "Un café à l'accueil, avec plaisir. Envoyez-moi l'heure exacte.",
    messages: [
      { from: "nicolas", via: "Email · T1", text: "Je passe mardi chez Voltane, un café à l'accueil pour se présenter ?", when: "lun. 08:50" },
      { from: "prospect", via: "Email", text: "Un café à l'accueil, avec plaisir. Envoyez-moi l'heure exacte.", when: "lun. 10:05" },
    ],
  },
  {
    id: "c3",
    first: "Thomas",
    last: "Bianchi",
    role: "CTO",
    company: "Voltane",
    status: "positif",
    when: "hier",
    snippet: "Sujet intéressant. Plutôt une visio la semaine prochaine ?",
    messages: [
      { from: "nicolas", via: "Email · T1", text: "Sur place mardi — 15 min sur votre migration cloud ?", when: "dim. 18:20" },
      { from: "prospect", via: "Email", text: "Sujet intéressant. Plutôt une visio la semaine prochaine ?", when: "hier 09:15" },
      { from: "nicolas", via: "Email", text: "Ça marche — je vous envoie 3 créneaux jeudi.", when: "hier 09:40" },
    ],
  },
  {
    id: "c4",
    first: "Sofia",
    last: "Nguyen",
    role: "Head of Finance",
    company: "Barème",
    status: "positif",
    when: "hier",
    snippet: "Curieuse d'en savoir plus, envoyez la doc.",
    messages: [
      { from: "nicolas", via: "LinkedIn · T3", text: "Ravi d'être passé chez Barème. Au plaisir d'échanger.", when: "mar. 14:00" },
      { from: "prospect", via: "LinkedIn", text: "Curieuse d'en savoir plus, envoyez la doc.", when: "hier 16:30" },
    ],
  },
  {
    id: "c5",
    first: "Karim",
    last: "Haddad",
    role: "Head of Data",
    company: "Voltane",
    status: "relancer",
    when: "il y a 2 j",
    snippet: "Email ouvert 2 fois — pas encore de réponse.",
    messages: [
      { from: "nicolas", via: "Email · T1", text: "Je serai chez Voltane mardi, dispo pour 15 min ?", when: "sam. 10:00" },
      { from: "nicolas", via: "LinkedIn · T3", text: "Karim, ravi d'être passé chez vous cette semaine.", when: "lun. 09:00" },
    ],
  },
  {
    id: "c6",
    first: "Marc",
    last: "Dubreuil",
    role: "CIO",
    company: "Voltane",
    status: "relancer",
    when: "il y a 3 j",
    snippet: "Invitation LinkedIn acceptée — relance prévue J+5.",
    messages: [
      { from: "nicolas", via: "LinkedIn · T3", text: "Marc, votre appel d'offres SI m'a interpellé. Au plaisir d'échanger.", when: "ven. 11:00" },
      { from: "prospect", via: "LinkedIn", text: "(Invitation acceptée)", when: "ven. 15:20" },
    ],
  },
  {
    id: "c7",
    first: "Awa",
    last: "Diallo",
    role: "COO",
    company: "Fildu",
    status: "negatif",
    when: "il y a 4 j",
    snippet: "Pas le bon moment, on se reparle au T4.",
    messages: [
      { from: "nicolas", via: "Email · T1", text: "Sur place jeudi chez Fildu — 15 min sur votre logistique ?", when: "lun. 08:30" },
      { from: "prospect", via: "Email", text: "Pas le bon moment, on se reparle au T4. Merci.", when: "il y a 4 j" },
    ],
  },
];

// Comptes voisins sur l'itinéraire (API Recherche d'entreprises + Maps).
export type Neighbor = {
  id: string;
  name: string;
  sector: string;
  activity: string;
  address: string;
  distanceM: number; // distance depuis le RDV principal (mètres)
  detourMin: number; // détour ajouté à la tournée
  employees: number;
  caM: number;
  growthPct: number;
  fit: number; // score d'opportunité 0-100
  status: "signal" | "warm" | "cold";
  signals: string[];
  contact: { name: string; role: string };
  note: string;
};

export const neighbors: Neighbor[] = [
  {
    id: "ampere",
    name: "Ampère & Co",
    sector: "Industrie · Équipement électrique",
    activity: "Composants et bornes de recharge",
    address: "9 rue Brey, Paris 17e",
    distanceM: 280,
    detourMin: 3,
    employees: 340,
    caM: 62,
    growthPct: 18,
    fit: 74,
    status: "signal",
    signals: ["Recrute un Head of Data (offre publiée il y a 4 j)", "Nouveau site industriel annoncé"],
    contact: { name: "Renaud Ollivier", role: "Directeur Technique" },
    note: "2 signaux actifs · même immeuble presque",
  },
  {
    id: "noveo",
    name: "Novéo Energies",
    sector: "Cleantech · Solaire",
    activity: "Installation et pilotage solaire B2B",
    address: "3 av. Mac-Mahon, Paris 17e",
    distanceM: 550,
    detourMin: 6,
    employees: 120,
    caM: 24,
    growthPct: 41,
    fit: 68,
    status: "warm",
    signals: ["Déjà en base Folk — client tiède", "Levée de fonds évoquée"],
    contact: { name: "Sabine Roy", role: "COO" },
    note: "Client tiède (Folk) · à réactiver",
  },
  {
    id: "grid",
    name: "Grid Partners",
    sector: "Conseil · Énergie",
    activity: "Conseil en transition énergétique",
    address: "24 rue de Tilsitt, Paris 17e",
    distanceM: 700,
    detourMin: 8,
    employees: 85,
    caM: 15,
    growthPct: 27,
    fit: 61,
    status: "cold",
    signals: ["1 décideur rattaché dans FullEnrich"],
    contact: { name: "Marc Aubert", role: "Partner" },
    note: "1 décideur rattaché · à cartographier",
  },
];

export const NEIGHBOR_STATUS: Record<Neighbor["status"], { label: string; color: string; soft: string }> = {
  signal: { label: "Signal actif", color: "#0c6b52", soft: "#e2f0ec" },
  warm: { label: "Client tiède", color: "#b07d12", soft: "#f6ecd5" },
  cold: { label: "À cartographier", color: "#7f8794", soft: "#eef0f2" },
};

// Tournée du jour — RDV + détours suggérés sur l'itinéraire.
export type TourneeStop =
  | { kind: "rdv"; rdvId: string; legMin: number; legKm: number }
  | { kind: "detour"; neighborId: string; legMin: number; legKm: number };

export const tournee: {
  day: string;
  totalKm: number;
  totalTravel: string;
  stops: TourneeStop[];
} = {
  day: "Mardi 14 juillet",
  totalKm: 24.5,
  totalTravel: "1 h 08",
  stops: [
    { kind: "rdv", rdvId: "voltane", legMin: 22, legKm: 6.2 },
    { kind: "detour", neighborId: "ampere", legMin: 3, legKm: 0.3 },
    { kind: "detour", neighborId: "noveo", legMin: 6, legKm: 0.6 },
    { kind: "detour", neighborId: "grid", legMin: 5, legKm: 0.7 },
    { kind: "rdv", rdvId: "bareme", legMin: 24, legKm: 9.1 },
  ],
};

// Synthétise un compte cartographiable à partir d'un voisin (pour « Cartographier ce compte »).
export function rdvFromNeighbor(n: Neighbor): Rdv {
  const slug = Array.from(n.name.toLowerCase().normalize("NFD"))
    .filter((ch) => {
      const c = ch.charCodeAt(0);
      return c < 0x300 || c > 0x36f;
    })
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const domain = `${slug}.fr`;
  const parts = n.contact.name.split(" ");
  const city = n.address.split(",").pop()?.trim() ?? "Paris";
  return {
    id: n.id,
    dayShort: "Mar. 14 juil.",
    dayLong: "mardi 14 juillet",
    time: "11:00",
    timeEarly: "10:45",
    contactFirst: parts[0] ?? n.contact.name,
    contactLast: parts.slice(1).join(" "),
    contactRole: n.contact.role,
    subject: n.activity.toLowerCase(),
    address: n.address,
    kind: "physique",
    company: {
      name: n.name,
      domain,
      sector: n.sector,
      activity: n.activity,
      description: `${n.activity} — compte détecté sur ton itinéraire.`,
      employees: n.employees,
      caM: n.caM,
      growthPct: n.growthPct,
      funding: n.status === "warm" ? "Client existant (Folk)" : "—",
      founded: 2015,
      hq: city.startsWith("Paris") ? "Paris, FR" : `${city}, FR`,
      website: `https://${domain}`,
      focus: [n.activity, n.sector.split(" · ")[0]],
      contacts: [{ name: n.contact.name, role: n.contact.role, note: "signal détecté" }],
    },
  };
}
