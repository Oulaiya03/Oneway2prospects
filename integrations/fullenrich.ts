// Dev B : FullEnrich. Enrichissement contacts (email + tel verifies). ASYNC.
// Auth REST : Authorization: Bearer FULLENRICH_API_KEY
// People search  : POST https://app.fullenrich.com/api/v2/people/search
// Bulk enrich    : POST https://app.fullenrich.com/api/v2/contact/enrich/bulk -> { enrichment_id }
// Poll resultat  : GET  https://app.fullenrich.com/api/v2/contact/enrich/bulk/{id}
// Credits : work email=1, perso=3, mobile=10. On limite aux work emails en demo.

const BASE = "https://app.fullenrich.com/api/v2";

export type Person = {
  first_name: string;
  last_name: string;
  company_name?: string;
  domain?: string;
  linkedin_url?: string;
  title?: string; // ajout : utile pour le ranking (facultatif, retro-compatible)
};

export type EnrichedContact = Person & {
  work_email?: string;
  phone?: string;
  title?: string;
  email_status?: string; // DELIVERABLE | HIGH_PROBABILITY | CATCH_ALL | ...
};

// Champs a enrichir. Par defaut : work email uniquement (1 credit) pour proteger les credits en demo.
export type EnrichField = "contact.work_emails" | "contact.personal_emails" | "contact.phones";

function apiKey(): string {
  const k = process.env.FULLENRICH_API_KEY;
  if (!k) throw new Error("FULLENRICH_API_KEY manquante (voir .env)");
  return k;
}

function headers() {
  return { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" };
}

// --- 1. Trouver des decideurs par titre chez une boite : POST /people/search ---
// `company` peut etre un nom ("Nexity") ou un domaine ("nexity.fr").
export async function searchPeople(company: string, titles: string[], limit = 10): Promise<Person[]> {
  const isDomain = company.includes(".") && !company.includes(" ");
  const companyFilter = isDomain
    ? { current_company_domains: [{ value: company, exact_match: true }] }
    : { current_company_names: [{ value: company, exact_match: true }] };

  const body = {
    limit,
    offset: 0,
    ...companyFilter,
    current_position_titles: titles.map((t) => ({ value: t, exact_match: false })),
  };

  const res = await fetch(`${BASE}/people/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`people/search ${res.status}: ${await res.text()}`);
  const json: any = await res.json();

  return (json.people ?? []).map((p: any): Person => {
    const cur = p.employment?.current;
    return {
      first_name: p.first_name,
      last_name: p.last_name,
      company_name: cur?.company?.name ?? (isDomain ? undefined : company),
      domain: cur?.company?.domain ?? (isDomain ? company : undefined),
      linkedin_url: p.social_profiles?.professional_network?.url,
      title: cur?.title,
    };
  });
}

// --- 2. Lancer un enrichissement bulk (async) -> enrichment_id ---
export async function startEnrich(
  contacts: Person[],
  fields: EnrichField[] = ["contact.work_emails"],
  webhookUrl?: string,
): Promise<{ enrichment_id: string }> {
  const body: any = {
    name: `DeskOffer ${new Date().toISOString().slice(0, 16)}`,
    data: contacts.map((c) => ({
      first_name: c.first_name,
      last_name: c.last_name,
      domain: c.domain,
      company_name: c.company_name,
      linkedin_url: c.linkedin_url,
      enrich_fields: fields,
    })),
  };
  if (webhookUrl) body.webhook_url = webhookUrl;

  const res = await fetch(`${BASE}/contact/enrich/bulk`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`enrich/bulk POST ${res.status}: ${await res.text()}`);
  return res.json();
}

// --- 3. Poll le resultat jusqu'a FINISHED (avec timeout) -> EnrichedContact[] ---
// Statuts : CREATED | IN_PROGRESS | CANCELED | CREDITS_INSUFFICIENT | FINISHED | RATE_LIMIT | UNKNOWN
export async function getEnrichResult(
  enrichmentId: string,
  { timeoutMs = 90_000, intervalMs = 3_000 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<EnrichedContact[]> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/contact/enrich/bulk/${enrichmentId}`, { headers: headers() });
    if (!res.ok) throw new Error(`enrich/bulk GET ${res.status}: ${await res.text()}`);
    const json: any = await res.json();

    if (json.status === "FINISHED") return mapEnriched(json.data ?? []);
    if (["CANCELED", "CREDITS_INSUFFICIENT", "UNKNOWN"].includes(json.status)) {
      throw new Error(`FullEnrich a stoppe : ${json.status}`);
    }
    // CREATED | IN_PROGRESS | RATE_LIMIT -> on attend
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("FullEnrich : timeout de polling (fallback 'non trouve')");
}

function mapEnriched(data: any[]): EnrichedContact[] {
  return data.map((d): EnrichedContact => {
    const ci = d.contact_info ?? {};
    return {
      first_name: d.input?.first_name,
      last_name: d.input?.last_name,
      company_name: d.input?.company_name,
      domain: d.input?.domain ?? d.input?.company_domain,
      work_email: ci.most_probable_work_email?.email,
      email_status: ci.most_probable_work_email?.status,
      phone: ci.most_probable_phone?.number,
    };
  });
}

// --- Bout-en-bout : cherche les decideurs d'une boite PUIS les enrichit (email/tel) ---
// C'est la fonction que l'agent appelle. Merge le titre (search) + email/tel (enrich).
export async function findDecisionMakers(
  company: string,
  titles: string[],
  limit = 10,
  fields: EnrichField[] = ["contact.work_emails"],
): Promise<EnrichedContact[]> {
  const people = await searchPeople(company, titles, limit);
  if (people.length === 0) return [];

  const { enrichment_id } = await startEnrich(people, fields);
  const enriched = await getEnrichResult(enrichment_id);

  // Merge par nom : on garde le titre/linkedin du search + email/tel de l'enrich.
  const key = (p: { first_name?: string; last_name?: string }) =>
    `${p.first_name ?? ""}|${p.last_name ?? ""}`.toLowerCase();
  const byName = new Map(enriched.map((e) => [key(e), e]));

  return people.map((p): EnrichedContact => {
    const e = byName.get(key(p));
    return { ...p, work_email: e?.work_email, phone: e?.phone, email_status: e?.email_status };
  });
}
