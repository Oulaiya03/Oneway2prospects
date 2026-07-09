// Test isole de Gradium TTS. Lancer : npx tsx integrations/test-gradium.ts
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { textToSpeech } from "./gradium";

const txt =
  "Bonjour, ceci est un test de la fiche entreprise en audio, generee par Gradium pour DeskOffer.";

const audio = await textToSpeech(txt);
writeFileSync("data/brief.wav", audio);
console.log(`OK -> data/brief.wav (${audio.length} octets)`);
