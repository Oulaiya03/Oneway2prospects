// web/app/api/run/route.ts
// L'agent (agent/loop.ts) vit HORS du projet Next (monorepo). On NE l'importe PAS ici : sinon
// turbopack.root devrait pointer le monorepo, ce qui casse le React Client Manifest (SSR).
// Le run live se fait via `npm run agent:dev` (prouvé), et l'UI consomme une FIXTURE réelle
// (sortie agent figée) adaptée via web/lib/adapt.ts.

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    mode: "fixture",
    note: "Run agent live via `npm run agent:dev` ; l'UI consomme une fixture adaptée (web/lib/adapt.ts).",
    hasKeys: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      fullenrich: !!process.env.FULLENRICH_API_KEY,
      gradium: !!process.env.GRADIUM_API_KEY,
    },
  });
}

export async function POST() {
  return Response.json(
    { ok: false, error: "Agent live non embarqué dans le build web. Utiliser `npm run agent:dev` + la fixture." },
    { status: 501 },
  );
}
