// Test isole de gradium.ts. Lancer : npm run test:gradium
// Genere l'audio de la fiche entreprise (scenario Allianz) et l'ecrit en .wav local.
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { textToSpeech } from "./gradium";

const TEXT =
  process.argv[2] ??
  "Allianz France is a major insurer based in La Defense, Paris. You have a meeting with Viviane Lindenmann, their Employer Brand Manager, about redesigning the careers website. Great timing: Allianz is actively promoting its employer brand and hiring right now, so there is real appetite for this conversation.";

async function main() {
  console.log("Generating audio (Gradium TTS, EN flagship voice Emma, human settings)...");
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
