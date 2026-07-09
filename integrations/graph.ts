// Dev B : Microsoft Graph (M365). Token récupéré via NextAuth (Azure AD) côté web/.
// Scopes : Calendars.Read, Mail.ReadWrite. GOTCHA : admin consent en tenant corporate.
const GRAPH = "https://graph.microsoft.com/v1.0";

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

// "allianz.fr" -> "Allianz" (fallback lisible quand on n'a pas mieux).
function companyFromDomain(domain: string): string {
  const base = (domain || "").split(".")[0].replace(/[-_]/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}

// Assemble une adresse lisible depuis location.address (Graph) ou le displayName.
function formatAddress(location: any): string {
  const a = location?.address;
  if (a) {
    const parts = [a.street, [a.postalCode, a.city].filter(Boolean).join(" "), a.countryOrRegion].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return location?.displayName || "";
}

// Lit l'agenda et garde SEULEMENT les RDV physiques (isOnlineMeeting=false + location avec adresse).
export async function getPhysicalMeetings(accessToken: string, fromISO: string, toISO: string): Promise<PhysicalMeeting[]> {
  const url =
    `${GRAPH}/me/calendarView?startDateTime=${encodeURIComponent(fromISO)}&endDateTime=${encodeURIComponent(toISO)}` +
    `&$select=subject,location,isOnlineMeeting,attendees,organizer,start,end&$orderby=start/dateTime&$top=50`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Prefer: 'outlook.timezone="Europe/Paris"' },
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`Graph calendarView ${r.status}: ${detail.slice(0, 200)}`);
  }
  const data = await r.json();
  const events: any[] = data.value ?? [];

  return events
    .filter((e) => !e.isOnlineMeeting && (e.location?.address || e.location?.displayName))
    .map((e) => {
      // Entreprise = domaine d'un participant EXTERNE (≠ domaine de l'organisateur).
      const orgDomain = emailDomain(e.organizer?.emailAddress?.address);
      const external = (e.attendees ?? [])
        .map((a: any) => a?.emailAddress)
        .filter((ea: any) => ea?.address && emailDomain(ea.address) !== orgDomain && ea.type !== "resource");
      const ext = external[0];
      const domain = emailDomain(ext?.address);
      return {
        id: String(e.id ?? ""),
        company: domain ? companyFromDomain(domain) : undefined,
        domain: domain || undefined,
        address: formatAddress(e.location),
        contact_name: ext?.name || undefined,
        datetime: e.start?.dateTime ?? "",
      };
    });
}

// Crée un BROUILLON (pas d'envoi). POST /me/messages -> renvoie l'id du draft.
export async function createDraft(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
): Promise<{ id: string; webLink?: string }> {
  const r = await fetch(`${GRAPH}/me/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      body: { contentType: "Text", content: body },
      toRecipients: to ? [{ emailAddress: { address: to } }] : [],
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`Graph createDraft ${r.status}: ${detail.slice(0, 200)}`);
  }
  const j = await r.json();
  return { id: String(j.id ?? ""), webLink: j.webLink };
}
