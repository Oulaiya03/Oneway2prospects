// DEFERE - bonus (ne compte PAS dans les 25 pts data FE+Sillage).
// Folk (CRM warm) : savoir si une personne / une boite est DEJA connue -> flag warm.
// REST : GET https://api.folk.app/v1/people  (Authorization: Bearer FOLK_API_KEY)
//   filtre : filter[fullName][like]=Nom  ou  filter[companies][in][id]=com_xxx
// IMPORTANT : workspace de DEMO avec data fictive. JAMAIS le Folk interne reel de Mantu.

const BASE = "https://api.folk.app/v1";

export type WarmMatch = {
  known: boolean;
  note?: string;
  count?: number; // nb de contacts trouves
};

// Cherche une personne (ou une boite) par nom dans le CRM -> connue (warm) ?
// Fallback propre : sans FOLK_API_KEY -> known:false (l'agent continue sans casser).
export async function searchContacts(query: string): Promise<WarmMatch> {
  const key = process.env.FOLK_API_KEY;
  if (!key) return { known: false, note: "Folk non configure (bonus)" };

  const url = `${BASE}/people?limit=5&filter[fullName][like]=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`folk people ${res.status}: ${await res.text()}`);

  const json: any = await res.json();
  const items = json.data?.items ?? [];
  if (items.length === 0) return { known: false, count: 0 };

  const p = items[0];
  const company = p.companies?.[0]?.name;
  return {
    known: true,
    count: items.length,
    note: `Deja dans Folk : ${p.fullName}${company ? ` (${company})` : ""}${p.jobTitle ? ` — ${p.jobTitle}` : ""}`,
  };
}
