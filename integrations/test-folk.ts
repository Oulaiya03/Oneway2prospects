// Test isole de folk.ts. Lancer : npm run test:folk
// Lit la base warm locale data/folk-people.csv (export Folk, LOCAL only).
import { searchContacts, warmBase } from "./folk";

async function main() {
  const base = warmBase();
  console.log(`\nBase warm Folk : ${base.length} contacts connus.`);

  const query = process.argv[2] ?? "Thomas Bouvier";
  console.log(`\nRecherche warm : "${query}"`);
  const r = await searchContacts(query);
  console.log(`  known: ${r.known}${r.count != null ? ` (${r.count})` : ""}`);
  if (r.note) console.log(`  ${r.note}`);

  // Apercu : les decideurs marque employeur / communication deja connus
  console.log(`\nQuelques warm (ICP DeskOffer) :`);
  base
    .filter((c) => /marque employeur|communication|marketing|rse|rh|marque/i.test(c.jobTitle ?? ""))
    .slice(0, 6)
    .forEach((c) => console.log(`  • ${c.fullName} — ${c.jobTitle}`));

  console.log("\n[OK] folk.ts lit la base warm reelle.\n");
}

main().catch((err) => {
  console.error("\n[ERREUR]", err.message);
  process.exit(1);
});
