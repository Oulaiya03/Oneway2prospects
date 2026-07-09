// Dev B : Microsoft Graph (M365). Token recupere via NextAuth (Azure AD) cote web/.
// Scopes : Calendars.Read, Mail.ReadWrite. GOTCHA : admin consent en tenant corporate.

const GRAPH = "https://graph.microsoft.com/v1.0";

export type PhysicalMeeting = {
  id: string; company?: string; domain?: string; address: string;
  contact_name?: string; datetime: string;
};

// Lit l'agenda et garde seulement les RDV PHYSIQUES (isOnlineMeeting=false + location adresse).
export async function getPhysicalMeetings(accessToken: string, fromISO: string, toISO: string): Promise<PhysicalMeeting[]> {
  // GET /me/calendarView?startDateTime=..&endDateTime=..
  // filtrer : !event.isOnlineMeeting && event.location?.address
  // deduire domain via l'email de l'attendee externe -> entreprise
  throw new Error("getPhysicalMeetings: a implementer (Dev B)");
}

// Cree un BROUILLON (pas d'envoi). POST /me/messages
export async function createDraft(accessToken: string, to: string, subject: string, body: string): Promise<{ id: string }> {
  throw new Error("createDraft: a implementer (Dev B)");
}
