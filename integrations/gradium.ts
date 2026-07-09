// Gradium TTS : transforme un texte (brief.audio_text) en audio (la fiche a ecouter
// dans les transports). Code promo hackathon : GTM-HACK. Side challenge "Best use of Gradium".
// REST : POST https://api.gradium.ai/api/post/speech/tts  (auth header x-api-key)
//   only_audio:true -> renvoie les bytes audio bruts.

const TTS_URL = "https://api.gradium.ai/api/post/speech/tts";

// voice_id par defaut = une voix EN (Emma). Pour une voix FR, mets GRADIUM_VOICE_ID
// (catalogue : 237 voix / 5 langues sur le dashboard Gradium).
export async function textToSpeech(
  text: string,
  opts: { voiceId?: string; format?: string } = {},
): Promise<Buffer> {
  const key = process.env.GRADIUM_API_KEY;
  if (!key) throw new Error("GRADIUM_API_KEY manquante (voir .env)");
  const voice_id = opts.voiceId || process.env.GRADIUM_VOICE_ID || "YTpq7expH9539ERJ";
  const output_format = opts.format || "wav";

  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id, output_format, only_audio: true }),
  });
  if (!res.ok) throw new Error(`Gradium TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}
