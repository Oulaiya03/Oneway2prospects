// DEFERE - on le fait SI on a le temps (decision equipe). Ne pas mettre sur le chemin critique.
// Folk (CRM warm). MCP OAuth. Bonus (ne compte PAS dans les 25 pts data FE+Sillage).
// But : savoir si une personne / une boite est DEJA connue -> flag warm.
// IMPORTANT : workspace de DEMO avec data fictive. Jamais le Folk interne reel.

export type WarmMatch = { known: boolean; note?: string };

export async function searchContacts(query: string): Promise<WarmMatch> {
  throw new Error("searchContacts: a implementer (Dev B)");
}
