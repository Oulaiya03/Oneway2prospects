// DEFERE - bonus (ne compte PAS dans les 25 pts data FE+Sillage).
// Folk (CRM warm) : savoir si une personne est DEJA connue -> flag warm + contexte.
// Source : export CSV du workspace Folk (data/folk-people.csv), LOCAL uniquement (gitignore).
//   -> data interne reelle : JAMAIS commite ni poussee.
// (Une variante REST api.folk.app/v1/people existe, mais l'export CSV est plus simple/offline.)

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CSV_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "folk-people.csv");

export type WarmContact = {
  fullName: string;
  jobTitle?: string;
  email?: string;
  company?: string;
  groups: string[];
};

export type WarmMatch = {
  known: boolean;
  note?: string;
  count?: number;
  contacts?: WarmContact[];
};

// Parseur CSV correct : gere les champs entre guillemets (virgules, retours ligne, "" echappe).
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\r") { /* ignore */ }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

let cache: WarmContact[] | null = null;

function loadWarmBase(): WarmContact[] {
  if (cache) return cache;
  if (!existsSync(CSV_PATH)) { cache = []; return cache; }

  const rows = parseCsv(readFileSync(CSV_PATH, "utf8"));
  const header = rows[0] ?? [];
  const col = (name: string) => header.indexOf(name);
  const iFn = col("firstname"), iLn = col("lastname"), iJt = col("jobTitle");
  const iEmail = col("favoriteEmail"), iCo = col("Company name"), iGroups = col("groups");

  cache = rows
    .slice(1)
    .filter((r) => r.length > 1 && (r[iFn] || r[iLn]))
    .map((r) => ({
      fullName: `${r[iFn] ?? ""} ${r[iLn] ?? ""}`.trim(),
      jobTitle: r[iJt] || undefined,
      email: r[iEmail] || undefined,
      company: r[iCo] || undefined,
      groups: (r[iGroups] ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    }));
  return cache;
}

// Cette personne (ou email) est-elle deja dans notre CRM Folk -> warm ?
export async function searchContacts(query: string): Promise<WarmMatch> {
  const q = query.trim().toLowerCase();
  if (!q) return { known: false };

  const base = loadWarmBase();
  if (base.length === 0) return { known: false, note: "Base Folk absente (data/folk-people.csv)" };

  const hits = base.filter(
    (c) => c.fullName.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q),
  );
  if (hits.length === 0) return { known: false, count: 0 };

  const c = hits[0];
  const via = c.groups.length ? ` [${c.groups.slice(0, 3).join(", ")}]` : "";
  return {
    known: true,
    count: hits.length,
    note: `Deja dans Folk : ${c.fullName}${c.jobTitle ? ` — ${c.jobTitle}` : ""}${c.company ? ` (${c.company})` : ""}${via}`,
    contacts: hits,
  };
}

// Liste toute la base warm (utile pour croiser avec FullEnrich cote agent).
export function warmBase(): WarmContact[] {
  return loadWarmBase();
}
