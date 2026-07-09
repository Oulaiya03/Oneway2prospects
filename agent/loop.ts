// Dev A : la boucle de l'agent (Claude Agent SDK).
// Recoit un meeting + admin_config, appelle les tools, retourne le JSON (voir CLAUDE.md section 10).
import { SYSTEM_PROMPT } from "./prompt";

export type Meeting = { company: string; address: string; contact_name: string; datetime: string };
export type AdminConfig = { icp: any; offer: string };

export type TourItem = {
  name: string; title: string; company: string;
  location: "same_company" | "same_building" | "nearby";
  why: string; warm: boolean; email: string; phone: string; hook: string;
};
export type AgentResult = {
  meeting: { company: string; datetime: string };
  brief: { company: string; bullets: string[]; audio_text: string };
  tour: TourItem[];
};

// TODO Dev A :
// 1. instancier l'agent Claude avec SYSTEM_PROMPT
// 2. declarer les tools (MCP Sillage/FullEnrich/Folk + fonctions integrations/*)
// 3. lancer la boucle avec { meeting, admin_config }
// 4. parser/valider la sortie JSON -> AgentResult
export async function runDeskOffer(meeting: Meeting, admin: AdminConfig): Promise<AgentResult> {
  // stub : renvoyer data/demo.json pendant le dev pour ne bloquer personne
  throw new Error("runDeskOffer: a implementer (Dev A). En attendant, le front lit data/demo.json.");
}
