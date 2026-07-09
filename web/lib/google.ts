// web/lib/google.ts — copie web-locale (évite l'import cross-root qui casse le manifest RSC).
// Google Workspace : Agenda (Calendar) + Gmail (drafts). Token via NextAuth (provider Google).
// Scopes requis : https://www.googleapis.com/auth/calendar.readonly + https://www.googleapis.com/auth/gmail.compose
const CAL = "https://www.googleapis.com/calendar/v3";
const GMAIL = "https://gmail.googleapis.com/gmail/v1";

export type PhysicalMeeting = {
  id: string;
  company?: string;
  domain?: string;
  address: string;
  contact_name?: string;
  datetime: string;
};

function emailDomain(email?: string): string {
  return (email || "").split("@")[1]?.toLowerCase() || "";
}

function companyFromDomain(domain: string): string {
  const base = (domain || "").split(".")[0].replace(/[-_]/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}

// Lit l'agenda Google et garde SEULEMENT les RDV physiques (une adresse + pas de visio).
export async function getGoogleMeetings(accessToken: string, fromISO: string, toISO: string): Promise<PhysicalMeeting[]> {
  const url =
    `${CAL}/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=50` +
    `&timeMin=${encodeURIComponent(fromISO)}&timeMax=${encodeURIComponent(toISO)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`Google Calendar ${r.status}: ${detail.slice(0, 200)}`);
  }
  const data = await r.json();
  const events: Array<Record<string, unknown>> = data.items ?? [];

  return events
    .filter((e) => e.location && !e.hangoutLink && !e.conferenceData)
    .map((e) => {
      const organizer = e.organizer as { email?: string } | undefined;
      const orgDomain = emailDomain(organizer?.email);
      const attendees = (e.attendees as Array<{ email?: string; displayName?: string; resource?: boolean }>) ?? [];
      const external = attendees.filter((a) => a?.email && emailDomain(a.email) !== orgDomain && !a.resource);
      const ext = external[0];
      const domain = emailDomain(ext?.email);
      const start = e.start as { dateTime?: string; date?: string } | undefined;
      return {
        id: String(e.id ?? ""),
        company: domain ? companyFromDomain(domain) : undefined,
        domain: domain || undefined,
        address: String(e.location ?? ""),
        contact_name: ext?.displayName || undefined,
        datetime: start?.dateTime ?? start?.date ?? "",
      };
    });
}

function encodeSubject(s: string): string {
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}
function base64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Crée un BROUILLON Gmail (pas d'envoi). POST /users/me/drafts -> renvoie l'id du draft.
export async function createGmailDraft(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
): Promise<{ id: string }> {
  const raw = [
    to ? `To: ${to}` : "",
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
  ]
    .filter(Boolean)
    .join("\r\n");
  const r = await fetch(`${GMAIL}/users/me/drafts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { raw: base64url(raw) } }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`Gmail draft ${r.status}: ${detail.slice(0, 200)}`);
  }
  const j = await r.json();
  return { id: String(j.id ?? "") };
}
