// Test isole de discovery.ts. Lancer : npm run test:discovery
// Scenario demo : voisins autour du RDV Allianz (1 Cours Michelet, Puteaux / La Defense).
import { neighbors } from "./discovery";

const ADDRESS = process.argv[2] ?? "1 Cours Michelet 92800 Puteaux";
const radius = Number(process.argv[3] ?? 300);

async function main() {
  console.log(`\nVoisins autour de "${ADDRESS}" (rayon ${radius}m)...`);
  const list = await neighbors(ADDRESS, radius, 15);
  console.log(`-> ${list.length} entreprises (triees par distance) :`);
  list.forEach((n, i) =>
    console.log(`  ${i + 1}. ${n.name} — ${n.distance_m}m — ${n.address} [${n.category ?? "?"}]`),
  );
  if (list.length === 0) console.log("  (aucun voisin — adresse introuvable ?)");
  else console.log("\n[OK] discovery.ts sort les voisins reels via API Gouv.\n");
}

main().catch((err) => {
  console.error("\n[ERREUR]", err.message);
  process.exit(1);
});
