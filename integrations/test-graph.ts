// Test isole de graph.ts. Lancer : npm run test:graph
// Necessite un token Graph valide (recupere apres login NextAuth cote web/, ~1h de validite).
// Colle-le dans .env : GRAPH_ACCESS_TOKEN=eyJ...   (NE PAS commiter, c'est gitignore via .env)
import "dotenv/config";
import { getPhysicalMeetings } from "./graph";

async function main() {
  const token = process.env.GRAPH_ACCESS_TOKEN;
  if (!token) {
    console.log("GRAPH_ACCESS_TOKEN manquant dans .env — connecte-toi via l'app (NextAuth) et colle le token.");
    return;
  }
  const now = new Date();
  const from = new Date(now.getTime() - 2 * 864e5).toISOString(); // -2 jours
  const to = new Date(now.getTime() + 30 * 864e5).toISOString(); // +30 jours

  console.log("Lecture des RDV physiques dans l'agenda...");
  const meetings = await getPhysicalMeetings(token, from, to);
  console.log(`-> ${meetings.length} RDV physiques :`);
  meetings.forEach((m) =>
    console.log(`  • ${m.datetime} — ${m.subject ?? "?"} @ ${m.address} — contact: ${m.contact_name ?? "?"} (${m.domain ?? "?"})`),
  );
  console.log("\n[OK] graph.ts lit l'agenda Outlook.\n");
}

main().catch((err) => {
  console.error("\n[ERREUR]", err.message);
  process.exit(1);
});
