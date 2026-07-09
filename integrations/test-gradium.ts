// Test isole de gradium.ts. Lancer : npm run test:gradium
// Genere l'audio de la fiche entreprise (scenario Allianz) et l'ecrit en .wav local.
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { textToSpeech } from "./gradium";

const TEXT =
  process.argv[2] ??
  "Allianz France, assureur majeur basé à La Défense. Vous avez rendez-vous avec Viviane Lindenmann, responsable marque employeur, sur la refonte du site carrière. Bon moment pour y aller : Allianz communique activement sur sa marque employeur et son recrutement.";

async function main() {
  console.log("Génération audio (Gradium TTS, voix FR Marie)...");
  const r = await textToSpeech(TEXT);
  const out = "data/brief-allianz.wav";
  writeFileSync(out, Buffer.from(r.audioBase64, "base64"));
  const ko = ((r.audioBase64.length * 3) / 4 / 1024).toFixed(0);
  console.log(`\n[OK] Audio écrit : ${out} (${r.contentType}, ~${ko} Ko)`);
  console.log("Ouvre le fichier pour écouter la fiche entreprise. 🎙️\n");
}

main().catch((err) => {
  console.error("\n[ERREUR]", err.message);
  process.exit(1);
});
