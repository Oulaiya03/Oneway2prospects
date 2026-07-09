// Dev B : Microsoft Graph (M365). Token recupere via NextAuth (Azure AD) cote web/.
// Scopes : Calendars.Read, Mail.ReadWrite. GOTCHA : admin consent en tenant corporate
//   -> pour la demo, tenant "common" + compte perso / test.

const GRAPH = "https://graph.microsoft.com/v1.0";

export type PhysicalMeeting = {
  id: string;
  subject?: string;
  company?: string;
  domain?: string;
  address: string;
  contact_name?: string;
  contact_email?: string;
  datetime: string;
};

async function graphGet(accessToken: string, path: string): Promise<any> {
  const res = await fetch(`${GRAPH}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Prefer: 'outlook.timezone="Europe/Paris"' },
  });
  if (!res.ok) throw new Error(`Graph GET ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

// Construit une adresse lisible depuis event.location.
function formatAddress(loc: any): string {
  const a = loc?.address;
  if (a && (a.street || a.city || a.postalCode)) {
    return [a.street, a.postalCode, a.city].filter(Boolean).join(" ").trim();
  }
  return loc?.displayName ?? "";
}

// Lit l'agenda et garde seulement les RDV PHYSIQUES (isOnlineMeeting=false + location renseignee).
export async function getPhysicalMeetings(
  accessToken: string,
  fromISO: string,
  toISO: string,
): Promise<PhysicalMeeting[]> {
  const select = "subject,isOnlineMeeting,location,attendees,organizer,start,end";
  const path = `/me/calendarView?startDateTime=${encodeURIComponent(fromISO)}&endDateTime=${encodeURIComponent(toISO)}&$select=${select}&$orderby=start/dateTime&$top=50`;
  const json = await graphGet(accessToken, path);

  const out: PhysicalMeeting[] = [];
  for (const ev of json.value ?? []) {
    const address = formatAddress(ev.location);
    if (ev.isOnlineMeeting || !address) continue; // on ne garde que le physique

    // Contact externe = premier attendee dont le domaine != celui de l'organisateur.
    const orgDomain = (ev.organizer?.emailAddress?.address ?? "").split("@")[1]?.toLowerCase();
    const ext = (ev.attendees ?? [])
      .map((a: any) => a.emailAddress)
      .find((e: any) => {
        const d = (e?.address ?? "").split("@")[1]?.toLowerCase();
        return d && d !== orgDomain;
      });
    const domain = (ext?.address ?? "").split("@")[1];

    out.push({
      id: ev.id,
      subject: ev.subject,
      company: domain ? domain.split(".")[0] : undefined, // ex "allianz" -> a raffiner
      domain,
      address,
      contact_name: ext?.name,
      contact_email: ext?.address,
      datetime: ev.start?.dateTime,
    });
  }
  return out;
}

// Cree un BROUILLON (jamais d'envoi automatique). POST /me/messages
export async function createDraft(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
): Promise<{ id: string; webLink?: string }> {
  const res = await fetch(`${GRAPH}/me/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      body: { contentType: "HTML", content: body },
      toRecipients: [{ emailAddress: { address: to } }],
    }),
  });
  if (!res.ok) throw new Error(`Graph createDraft ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return { id: json.id, webLink: json.webLink };
}
