// Text-to-speech service with gender support
export function speakText(text: string, gender: "male" | "female", onEnd?: () => void): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)

  // Set voice based on gender
  const voices = window.speechSynthesis.getVoices()
  const selectedVoice =
    gender === "female"
      ? voices.find((v) => v.name.toLowerCase().includes("female")) || voices[1]
      : voices.find((v) => v.name.toLowerCase().includes("male")) || voices[0]

  if (selectedVoice) {
    utterance.voice = selectedVoice
  }

  utterance.rate = 1.0
  utterance.pitch = gender === "female" ? 1.2 : 0.8

  if (onEnd) {
    utterance.onend = onEnd
  }

  window.speechSynthesis.speak(utterance)
  return utterance
}

export function stopSpeech(): void {
  window.speechSynthesis.cancel()
}
