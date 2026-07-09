// Gradium TTS : transforme brief.audio_text en audio (la fiche entreprise a ecouter
// dans les transports). Code promo GTM-HACK. Side challenge "Best use of Gradium".
// Langues : FR, EN, DE, ES, PT.

export async function textToSpeech(text: string): Promise<{ audioUrl?: string; audioBase64?: string }> {
  // TODO : appeler l'API Gradium (TTS) avec GRADIUM_API_KEY -> renvoyer l'audio
  throw new Error("textToSpeech: a implementer (Gradium TTS)");
}
