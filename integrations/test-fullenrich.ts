// Test isole de fullenrich.ts (regle d'or Dev B : chaque outil testable seul).
// Lancer : npm run test:fe
// Scenario demo : decideurs chez Nexity (La Defense).
// ATTENTION credits : search + enrich consomment des credits FullEnrich.
//   -> limite basse (5) + on enrichit seulement les 2 premiers (work email = 1 credit/contact).
import "dotenv/config";
import { searchPeople, startEnrich, getEnrichResult } from "./fullenrich";

const COMPANY = process.argv[2] ?? "Nexity";
const TITLES = process.argv[3]?.split(",") ?? ["Directeur", "Head", "VP", "Responsable"];

async function main() {
  console.log(`\n[1] Recherche de decideurs chez "${COMPANY}" (titres: ${TITLES.join(", ")})...`);
  const people = await searchPeople(COMPANY, TITLES, 5);
  console.log(`    -> ${people.length} personnes trouvees :`);
  people.forEach((p, i) =>
    console.log(`    ${i + 1}. ${p.first_name} ${p.last_name} — ${p.title ?? "?"} @ ${p.company_name ?? p.domain ?? "?"}`),
  );
  if (people.length === 0) {
    console.log("    (aucun resultat — essaie un autre nom de boite ou d'autres titres)");
    return;
  }

  const sample = people.slice(0, 2);
  console.log(`\n[2] Enrichissement (work email) des ${sample.length} premiers...`);
  const { enrichment_id } = await startEnrich(sample);
  console.log(`    enrichment_id = ${enrichment_id} (polling...)`);

  const enriched = await getEnrichResult(enrichment_id);
  console.log(`\n[3] Resultat :`);
  enriched.forEach((e) =>
    console.log(`    ${e.first_name} ${e.last_name} — ${e.work_email ?? "(email non trouve)"} [${e.email_status ?? "-"}]`),
  );
  console.log("\n[OK] FullEnrich repond de la vraie data. Chemin critique securise.\n");
}

main().catch((err) => {
  console.error("\n[ERREUR]", err.message);
  process.exit(1);
});
