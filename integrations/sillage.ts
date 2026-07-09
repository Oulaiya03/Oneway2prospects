// Dev B : Sillage (signaux d'intent). MCP : https://api.getsillage.com/api/mcp/v2 (OAuth, pas de cle).
// Tools sillage_v2_* : upsert_persona, add_top_accounts, enrich_company, launch_signal_run, list_signals.
// Nuance : les signaux viennent d'un signal_run ou d'un agent, pas d'un simple get. 20 comptes max.

export type Signal = { entity: string; type: string; summary: string; date?: string };

export async function upsertPersona(icp: any): Promise<void> {
  throw new Error("upsertPersona: a implementer (Dev B)");
}
export async function addTopAccounts(companies: string[]): Promise<void> {
  throw new Error("addTopAccounts: a implementer (Dev B)");
}
// Entreprise + profils de personnes (par domaine / linkedin)
export async function enrichCompany(domainOrUrl: string): Promise<any> {
  throw new Error("enrichCompany: a implementer (Dev B)");
}
// Detecter les signaux : lancer un run puis lister les matches
export async function launchSignalRun(): Promise<{ run_id: string }> {
  throw new Error("launchSignalRun: a implementer (Dev B)");
}
export async function listSignals(): Promise<Signal[]> {
  throw new Error("listSignals: a implementer (Dev B)");
}
