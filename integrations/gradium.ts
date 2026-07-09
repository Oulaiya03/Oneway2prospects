// Gradium TTS : transforme brief.audio_text en audio (la fiche entreprise a ecouter
// dans les transports). Code promo GTM-HACK. Side challenge "Best use of Gradium".
// API : POST https://api.gradium.ai/api/post/speech/tts  (header x-api-key)
//   body { text, voice_id, output_format:"wav", only_audio:true } -> audio brut (bytes)
// Voix FR (ex) : Marie BbLb4TxdlrldgpHI (F), Leo axlOaUiFyOZhy4nv (H), Thomas 8nsAoui8Y5RK9PYw (H)

const TTS_URL = "https://api.gradium.ai/api/post/speech/tts";
const DEFAULT_VOICE_ID = "BbLb4TxdlrldgpHI"; // Marie (FR, feminine, adulte)

export type TtsResult = { audioBase64: string; contentType: string };

export async function textToSpeech(
  text: string,
  opts: { voiceId?: string; format?: string } = {},
): Promise<TtsResult> {
  const key = process.env.GRADIUM_API_KEY;
  if (!key) throw new Error("GRADIUM_API_KEY manquante (voir .env)");

  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice_id: opts.voiceId ?? DEFAULT_VOICE_ID,
      output_format: opts.format ?? "wav",
      only_audio: true,
    }),
  });
  if (!res.ok) throw new Error(`gradium tts ${res.status}: ${await res.text()}`);

  const buf = Buffer.from(await res.arrayBuffer());
  return { audioBase64: buf.toString("base64"), contentType: res.headers.get("content-type") ?? "audio/wav" };
}

// Data URI prete a coller dans un <audio src="..."> cote front.
export function toDataUri(r: TtsResult): string {
  return `data:${r.contentType};base64,${r.audioBase64}`;
}
