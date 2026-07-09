// Test / visualisation de l'agent en local. Lancer : npm run agent:dev
import "dotenv/config";
import { runDeskOffer } from "./loop";

// Scenario aligne sur le cache de signaux d'Oulaiya (secteur assurance : Allianz, AXA...).
const meeting = {
  company: "Allianz France",
  address: "1 cours Michelet, 92800 Puteaux", // La Defense
  contact_name: "Contact RDV",
  datetime: "2026-07-14T15:30:00",
};
const admin = {
  icp: { titles: ["Directeur Marketing", "Directeur Marque Employeur", "Head of Digital", "DRH"], sectors: ["assurance"], sizes: ["1000+"] },
  offer: "conseil marque & marque employeur",
};

console.log("=== RUN AGENT (mock tools) ===\n");
const result = await runDeskOffer(meeting as any, admin as any);
console.log("\n=== RESULTAT (contrat JSON) ===");
console.log(JSON.stringify(result, null, 2));
