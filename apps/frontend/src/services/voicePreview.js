export function playVoicePreview({ script, language, voice }) {
  if (!("speechSynthesis" in window)) {
    return "Browser voice preview is unavailable";
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(script);
  utterance.lang = language === "Uzbek" ? "uz-UZ" : "en-US";
  utterance.rate = voice === "Confident" ? 0.96 : 1.04;
  utterance.pitch = voice === "Confident" ? 0.92 : 1.05;
  window.speechSynthesis.speak(utterance);

  return "Playing voice preview";
}
