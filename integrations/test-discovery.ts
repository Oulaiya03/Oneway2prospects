// Test isole de discovery.ts. Lancer : npm run test:discovery
// Scenario demo : clients potentiels autour du RDV Allianz (1 Cours Michelet, Puteaux / La Defense).
import { prospectsGrouped } from "./discovery";

const ADDRESS = process.argv[2] ?? "1 Cours Michelet 92800 Puteaux";

async function main() {
  console.log(`\nClients potentiels autour de "${ADDRESS}"...`);
  const { same_building, nearby } = await prospectsGrouped(ADDRESS, {
    perimeterM: 250,
    excludeCompany: "Allianz", // les autres entites Allianz = job de FullEnrich (same_company)
  });

  console.log(`\n🏢 MÊME BÂTIMENT / dalle immédiate (${same_building.length}) — "je descends te voir" :`);
  same_building.forEach((n) => console.log(`   • ${n.name} — ${n.distance_m}m — ${n.address} [${n.category}]`));

  console.log(`\n🚶 PÉRIMÈTRE COURT (${nearby.length}) — la tournée :`);
  nearby.forEach((n) => console.log(`   • ${n.name} — ${n.distance_m}m — ${n.address} [${n.category}]`));

  if (same_building.length + nearby.length === 0) console.log("  (aucun voisin — adresse introuvable ?)");
  else console.log("\n[OK] discovery.ts classe les clients potentiels par proximite.\n");
}

main().catch((err) => {
  console.error("\n[ERREUR]", err.message);
  process.exit(1);
});
