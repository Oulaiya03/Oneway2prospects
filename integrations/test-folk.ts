// Test isole de folk.ts. Lancer : npm run test:folk
// Sans FOLK_API_KEY -> fallback known:false (normal, Folk est un bonus).
import "dotenv/config";
import { searchContacts } from "./folk";

const QUERY = process.argv[2] ?? "Viviane Lindenmann";

async function main() {
  console.log(`\nRecherche warm dans Folk : "${QUERY}"...`);
  const r = await searchContacts(QUERY);
  console.log(`  known: ${r.known}${r.count != null ? ` (${r.count})` : ""}`);
  if (r.note) console.log(`  note: ${r.note}`);
  console.log("\n[OK] folk.ts repond (warm ou fallback).\n");
}

main().catch((err) => {
  console.error("\n[ERREUR]", err.message);
  process.exit(1);
});
