// Test / visualisation de l'agent en local. Lancer : npm run agent:dev
import "dotenv/config";
import { runDeskOffer } from "./loop";

const meeting = {
  company: "Nexity",
  address: "19 rue de Vienne, 75008 Paris",
  contact_name: "Contact RDV",
  datetime: "2026-07-14T15:30:00",
};
const admin = {
  icp: { titles: ["VP Data", "Head of Digital", "Directeur Marque Employeur"], sectors: ["immobilier"], sizes: ["1000+"] },
  offer: "conseil data & marque employeur",
};

console.log("=== RUN AGENT (mock tools) ===\n");
const result = await runDeskOffer(meeting as any, admin as any);
console.log("\n=== RESULTAT (contrat JSON) ===");
console.log(JSON.stringify(result, null, 2));
