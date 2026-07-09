// web/app/api/run/route.ts
// Transport front → agent. Reçoit un meeting (+ admin_config), lance la VRAIE boucle
// DeskOffer (agent/loop.ts : Claude + FullEnrich + Sillage + discovery), adapte le JSON
// vers nos types et le renvoie. Server-only (Node runtime, clés lues depuis .env.local).
import { runDeskOffer, type Meeting, type AdminConfig } from "../../../../agent/loop";
import { adaptRun, type MeetingTrigger } from "../../../lib/adapt";

export const runtime = "nodejs";
export const maxDuration = 300; // l'agent peut prendre 1-3 min (FullEnrich async)

// Sonde légère : vérifie que l'import cross-root de l'agent compile, SANS lancer l'agent.
export async function GET() {
  return Response.json({
    ok: true,
    ready: typeof runDeskOffer === "function",
    hasKeys: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      fullenrich: !!process.env.FULLENRICH_API_KEY,
      gradium: !!process.env.GRADIUM_API_KEY,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const m = body?.meeting ?? {};
    const meeting: Meeting = {
      company: m.company ?? "",
      address: m.address ?? "",
      contact_name: m.contact_name ?? "",
      datetime: m.datetime ?? "",
    };
    const admin: AdminConfig = {
      icp: body?.admin?.icp ?? { titles: [], sectors: [], sizes: [] },
      offer: body?.admin?.offer ?? "",
    };
    const trigger: MeetingTrigger = {
      address: meeting.address,
      contactName: meeting.contact_name,
      contactRole: m.contact_role,
      subject: m.subject,
      domain: m.domain,
      company: m.company_info,
    };

    const json = await runDeskOffer(meeting, admin);
    const adapted = adaptRun(json as Parameters<typeof adaptRun>[0], trigger);
    return Response.json({ ok: true, raw: json, ...adapted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "erreur agent";
    console.error("[/api/run] erreur:", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
