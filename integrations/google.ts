// Google Calendar + Gmail (alternative a Microsoft Graph). Token via NextAuth Google.
// Scopes : calendar.readonly (agenda) + gmail.compose (drafts).

export type PhysicalMeeting = {
  id: string;
  company?: string;
  domain?: string;
  address: string;
  contact_name?: string;
  datetime: string;
};

// Lit l'agenda (events.list) et garde les RDV PHYSIQUES (location = adresse, pas de visio).
export async function getPhysicalMeetings(
  accessToken: string,
  fromISO: string,
  toISO: string,
): Promise<PhysicalMeeting[]> {
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
    `?timeMin=${encodeURIComponent(fromISO)}&timeMax=${encodeURIComponent(toISO)}` +
    `&singleEvents=true&orderBy=startTime`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`Calendar ${r.status}: ${await r.text()}`);
  const data: any = await r.json();

  return (data.items ?? [])
    .filter((e: any) => e.location && !e.hangoutLink && !e.conferenceData) // physique = adresse + pas de visio
    .map((e: any): PhysicalMeeting => {
      const ext = (e.attendees ?? []).find((a: any) => !a.self && a.email);
      const domain = ext?.email?.split("@")[1];
      return {
        id: e.id,
        domain, // -> FullEnrich/Sillage resolvent l'entreprise via le domaine
        address: e.location,
        contact_name: ext?.email,
        datetime: e.start?.dateTime ?? e.start?.date,
      };
    });
}

// Cree un BROUILLON Gmail (drafts.create) - pas d'envoi. Message MIME base64url.
export async function createDraft(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
): Promise<{ id: string }> {
  const mime =
    `To: ${to}\r\nSubject: ${subject}\r\n` +
    `Content-Type: text/plain; charset="UTF-8"\r\n\r\n${body}`;
  const raw = Buffer.from(mime)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { raw } }),
  });
  if (!r.ok) throw new Error(`Gmail draft ${r.status}: ${await r.text()}`);
  return r.json();
}
