// Test isole de sillage.ts. Lancer : npm run test:sillage
// Lit le cache local data/signals.json (genere depuis un run Sillage reel).
import { getSignals, getSignalsForCompany } from "./sillage";

function main() {
  const all = getSignals();
  console.log(`\n[1] Signaux en cache : ${all.length}`);
  if (all.length === 0) {
    console.log("    (cache vide — relancer un run Sillage puis regenerer data/signals.json)");
    return;
  }
  all.forEach((s, i) =>
    console.log(`    ${i + 1}. [${s.type}] ${s.person ?? "?"} @ ${s.company ?? "?"} — ${s.summary.slice(0, 90)}`),
  );

  const company = process.argv[2] ?? "Allianz";
  const hits = getSignalsForCompany(company);
  console.log(`\n[2] Signaux pour "${company}" : ${hits.length}`);
  hits.forEach((s) => console.log(`    • ${s.person} — ${s.summary.slice(0, 90)}\n      ${s.source_url}`));

  console.log("\n[OK] sillage.ts lit et filtre les signaux reels.\n");
}

main();
