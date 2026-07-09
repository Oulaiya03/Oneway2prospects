// web/app/api/meetings/route.ts
// Lit l'agenda Outlook réel (Microsoft Graph) et renvoie les RDV physiques.
// Si l'utilisateur n'est pas connecté à Microsoft -> { connected:false } (le front bascule sur le mock).
import { getToken } from "next-auth/jwt";
import { getPhysicalMeetings } from "../../../../integrations/graph";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const jwt = await getToken({ req: req as never, secret: process.env.NEXTAUTH_SECRET });
    const token = (jwt as { accessToken?: string } | null)?.accessToken;
    if (!token) {
      return Response.json({ ok: true, connected: false, meetings: [] });
    }
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const to = new Date(now.getTime() + 30 * 864e5).toISOString();
    const meetings = await getPhysicalMeetings(token, from, to);
    return Response.json({ ok: true, connected: true, meetings });
  } catch (e) {
    const message = e instanceof Error ? e.message : "erreur Graph";
    return Response.json({ ok: false, connected: true, error: message, meetings: [] });
  }
}
