// Dev B : FullEnrich. Enrichissement contacts (email + tel verifies). ASYNC.
// Auth REST : Authorization: Bearer FULLENRICH_API_KEY
// Bulk : POST https://app.fullenrich.com/api/v2/contact/enrich/bulk -> { enrichment_id }
// Resultats : webhook (mieux) ou GET .../bulk/{id}. Credits : email=1, perso=3, mobile=10.

const BASE = "https://app.fullenrich.com/api/v2";

export type Person = { first_name: string; last_name: string; company_name?: string; domain?: string; linkedin_url?: string };
export type EnrichedContact = Person & { work_email?: string; phone?: string; title?: string };

// Trouver des decideurs par titre chez une boite : POST /people/search
export async function searchPeople(company: string, titles: string[]): Promise<Person[]> {
  throw new Error("searchPeople: a implementer (Dev B)");
}

// Lancer un enrichissement bulk (async) -> enrichment_id
export async function startEnrich(contacts: Person[]): Promise<{ enrichment_id: string }> {
  throw new Error("startEnrich: a implementer (Dev B)");
}

// Poll le resultat (ou brancher un webhook). Prevoir timeout + fallback "non trouve".
export async function getEnrichResult(enrichmentId: string): Promise<EnrichedContact[]> {
  throw new Error("getEnrichResult: a implementer (Dev B)");
}
