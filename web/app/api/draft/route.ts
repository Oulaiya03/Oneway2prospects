// web/app/api/draft/route.ts
// Crée un BROUILLON Gmail (pas d'envoi) via l'API Gmail, sur validation du commercial.
import { getToken } from "next-auth/jwt";
import { createGmailDraft } from "../../../../integrations/google";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const jwt = await getToken({ req: req as never, secret: process.env.NEXTAUTH_SECRET });
    const token = (jwt as { accessToken?: string } | null)?.accessToken;
    if (!token) {
      return Response.json({ ok: false, error: "non connecté à Google" }, { status: 401 });
    }
    const { to, subject, body } = await req.json();
    if (!subject || !body) {
      return Response.json({ ok: false, error: "subject et body requis" }, { status: 400 });
    }
    const draft = await createGmailDraft(token, to ?? "", subject, body);
    return Response.json({ ok: true, draft });
  } catch (e) {
    const message = e instanceof Error ? e.message : "erreur Gmail";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
