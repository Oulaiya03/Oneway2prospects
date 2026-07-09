// Dev A : la boucle de l'agent DeskOffer.
// Utilise l'Anthropic SDK (tool-use) : Claude decide quel tool appeler, on l'execute, on renvoie, il continue.
// Pour l'instant les tools sont MOCKES -> remplacer par integrations/* (Dev B) au fur et a mesure.
import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
import { findDecisionMakers } from "../integrations/fullenrich";
import { getSignalsForCompany } from "../integrations/sillage";
import { prospectsGrouped } from "../integrations/discovery";

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
  {
    name: "neighbors",
    description:
      "Boites voisines du RDV : meme immeuble d'abord (same_building), puis quartier (nearby). A utiliser APRES le same-company pour elargir la tournee.",
    input_schema: { type: "object", properties: { address: { type: "string" } }, required: ["address"] },
  },
];

// --- Execution des tools : les VRAIS integrations (Oulaiya). try/catch -> la demo ne crashe jamais. ---
async function runTool(name: string, input: any): Promise<any> {
  try {
    if (name === "fullenrich_people") {
      const raw = await findDecisionMakers(input.company, input.titles ?? []);
      const seen = new Set<string>();
      const contacts = raw
        .map((c) => ({
          name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
          title: c.title ?? "",
          email: c.work_email ?? "",
          phone: c.phone ?? "",
          email_status: c.email_status ?? "",
        }))
        .filter((c) => {
          const k = (c.email || c.name).toLowerCase();
          if (!k || seen.has(k)) return false; // dedupe par email (fallback nom)
          seen.add(k);
          return true;
        });
      console.log(
        `  -> FullEnrich: ${raw.length} trouves, ${contacts.length} uniques |`,
        contacts.map((c) => `${c.name} <${c.email || "?"}> [${c.email_status || "?"}]`).join(" ; "),
      );
      return contacts;
    }
    if (name === "sillage_signals") {
      return getSignalsForCompany(input.company).map((s) => ({
        entity: s.person ?? s.company,
        type: s.type,
        summary: s.summary,
        source_url: s.source_url,
      }));
    }
    if (name === "neighbors") {
      const g = await prospectsGrouped(input.address);
      const log = `same_building=${g.same_building.length} nearby=${g.nearby.length}`;
      console.log(`  -> neighbors (${input.address}): ${log}`);
      return {
        same_building: g.same_building.slice(0, 5).map((n) => ({ company: n.name, distance_m: n.distance_m, address: n.address })),
        nearby: g.nearby.slice(0, 5).map((n) => ({ company: n.name, distance_m: n.distance_m })),
      };
    }
    return { error: `tool inconnu: ${name}` };
  } catch (e: any) {
    console.log(`  ! erreur tool ${name}:`, e.message);
    return { error: e.message }; // l'agent continue avec ce qu'il a
  }
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
    tour: dedupeByEmail(
      (Array.isArray(r?.tour) ? r.tour : []).filter((t: any) => t && (t.email || t.phone)),
    )
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
        email_status: t.email_status ?? "",
        hook: t.hook ?? "",
      })),
  };
}

// Dedoublonnage final du tour par email (fallback nom) -> jamais 2 fois la meme personne.
function dedupeByEmail(items: any[]) {
  const seen = new Set<string>();
  return items.filter((t) => {
    const k = (t.email || t.name || "").toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
