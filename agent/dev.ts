// Test / visualisation de l'agent en local. Lancer : npm run agent:dev
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { runDeskOffer } from "./loop";
import { textToSpeech } from "../integrations/gradium";

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

console.log("=== RUN AGENT (vrais tools) ===\n");
const result = await runDeskOffer(meeting as any, admin as any);
console.log("\n=== RESULTAT (contrat JSON) ===");
console.log(JSON.stringify(result, null, 2));

// Bonus Gradium : generer la fiche entreprise en AUDIO (si la cle est presente).
if (process.env.GRADIUM_API_KEY && result?.brief?.audio_text) {
  try {
    const audio = await textToSpeech(result.brief.audio_text);
    writeFileSync("data/brief.wav", audio);
    console.log(`\n🎧 Fiche audio Gradium -> data/brief.wav (${audio.length} octets)`);
  } catch (e: any) {
    console.log("\nGradium TTS (ignore):", e.message);
  }
}
