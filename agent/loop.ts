// Dev A : la boucle de l'agent DeskOffer.
// Utilise l'Anthropic SDK (tool-use) : Claude decide quel tool appeler, on l'execute, on renvoie, il continue.
// Pour l'instant les tools sont MOCKES -> remplacer par integrations/* (Dev B) au fur et a mesure.
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6"; // bon rapport qualite/cout. Swap si besoin.

export type Meeting = { company: string; address: string; contact_name: string; datetime: string };
export type AdminConfig = { icp: any; offer: string };

// --- Les tools exposes a Claude (schema) ---
const tools: Anthropic.Tool[] = [
  {
    name: "fullenrich_people",
    description: "Trouve et enrichit les decideurs d'une entreprise (email + tel verifies).",
    input_schema: {
      type: "object",
      properties: { company: { type: "string" }, titles: { type: "array", items: { type: "string" } } },
      required: ["company"],
    },
  },
  {
    name: "sillage_signals",
    description: "Signaux d'intent recents sur une entreprise et ses decideurs.",
    input_schema: { type: "object", properties: { company: { type: "string" } }, required: ["company"] },
  },
];

// --- Execution des tools : MOCK pour l'instant. TODO Dev A : brancher integrations/* ---
async function runTool(name: string, input: any): Promise<any> {
  if (name === "fullenrich_people") {
    // TODO: import { searchPeople, startEnrich, getEnrichResult } from "../integrations/fullenrich";
    return [
      { name: "Marie Durand", title: "VP Data", email: "m.durand@nexity.fr", phone: "+33600000001" },
      { name: "Julien Faure", title: "Directeur Marque Employeur", email: "j.faure@nexity.fr", phone: "+33600000002" },
      { name: "Sophie Bernard", title: "Head of Digital", email: "s.bernard@nexity.fr", phone: "+33600000003" },
    ];
  }
  if (name === "sillage_signals") {
    // TODO: import { launchSignalRun, listSignals } from "../integrations/sillage";
    return [
      { entity: "Marie Durand", type: "hiring", summary: "Nexity recrute 5 data engineers + post priorites data 2026" },
      { entity: "Julien Faure", type: "campaign", summary: "campagne marque employeur tech en cours" },
      { entity: "Sophie Bernard", type: "product", summary: "refonte parcours client digital annoncee" },
    ];
  }
  return { error: `tool inconnu: ${name}` };
}

export async function runDeskOffer(meeting: Meeting, admin: AdminConfig) {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `meeting=${JSON.stringify(meeting)}\nadmin_config=${JSON.stringify(admin)}\nGenere la sortie JSON demandee (uniquement le JSON).`,
    },
  ];

  for (let step = 0; step < 8; step++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Visualiser ce que fait l'agent
    for (const block of res.content) {
      if (block.type === "text") console.log("[claude]", block.text.slice(0, 150));
      if (block.type === "tool_use") console.log("[tool_use]", block.name, JSON.stringify(block.input));
    }

    if (res.stop_reason === "tool_use") {
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of res.content) {
        if (block.type === "tool_use") {
          const out = await runTool(block.name, block.input);
          console.log("  -> result:", JSON.stringify(out).slice(0, 120));
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(out) });
        }
      }
      messages.push({ role: "assistant", content: res.content });
      messages.push({ role: "user", content: results });
    } else {
      const text = res.content.filter((b) => b.type === "text").map((b: any) => b.text).join("");
      return validateResult(safeJson(text));
    }
  }
  throw new Error("runDeskOffer : trop d'iterations");
}

function safeJson(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : { raw: text };
}

// Garantit que la sortie respecte TOUJOURS le contrat (section 10 du CLAUDE.md).
// -> la demo/le front ne cassent jamais, meme si Claude renvoie un champ en trop/en moins.
function validateResult(r: any) {
  return {
    meeting: {
      company: r?.meeting?.company ?? "",
      datetime: r?.meeting?.datetime ?? "",
    },
    brief: {
      company: r?.brief?.company ?? "",
      bullets: Array.isArray(r?.brief?.bullets) ? r.brief.bullets : [],
      audio_text: r?.brief?.audio_text ?? "",
    },
    tour: (Array.isArray(r?.tour) ? r.tour : [])
      .filter((t: any) => t && (t.email || t.phone)) // uniquement les contacts joignables
      .slice(0, 3) // top 3
      .map((t: any) => ({
        name: t.name ?? "",
        title: t.title ?? "",
        company: t.company ?? "",
        location: t.location ?? "same_company",
        why: t.why ?? "",
        warm: !!t.warm,
        email: t.email ?? "",
        phone: t.phone ?? "",
        hook: t.hook ?? "",
      })),
  };
}
