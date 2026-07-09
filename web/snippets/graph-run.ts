// A copier dans : web/app/api/run/route.ts (apres create-next-app)
// Recupere le token (server-side) et appelle Microsoft Graph : lire l'agenda + creer un draft.
import { getToken } from "next-auth/jwt";

const GRAPH = "https://graph.microsoft.com/v1.0";

async function getAccessToken(req: Request): Promise<string> {
  const jwt = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  const token = (jwt as any)?.accessToken;
  if (!token) throw new Error("Pas de token Graph : l'utilisateur doit se connecter.");
  return token;
}

// Lire l'agenda et garder les RDV physiques (isOnlineMeeting=false + location adresse)
async function getPhysicalMeetings(token: string, fromISO: string, toISO: string) {
  const url = `${GRAPH}/me/calendarView?startDateTime=${fromISO}&endDateTime=${toISO}&$select=subject,location,isOnlineMeeting,onlineMeetingProvider,attendees,start,end`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="Europe/Paris"' },
  });
  const data = await r.json();
  return (data.value ?? []).filter(
    (e: any) => !e.isOnlineMeeting && e.location?.address // physique = pas online + une adresse
  );
}

// Creer un BROUILLON (pas d'envoi) : POST /me/messages
async function createDraft(token: string, to: string, subject: string, body: string) {
  const r = await fetch(`${GRAPH}/me/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      body: { contentType: "Text", content: body },
      toRecipients: [{ emailAddress: { address: to } }],
    }),
  });
  return r.json(); // contient l'id du draft
}

export async function POST(req: Request) {
  const token = await getAccessToken(req);
  const meetings = await getPhysicalMeetings(
    token,
    "2026-07-09T00:00:00Z",
    "2026-07-16T00:00:00Z"
  );
  // TODO : passer un meeting a l'agent (agent/loop.ts runDeskOffer) -> recuperer le JSON (tour[])
  // puis, apres validation du commercial, pour chaque prospect : createDraft(token, email, subject, hook)
  return Response.json({ meetings });
}
