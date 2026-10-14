export const canSpeak = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text) {
  if (!canSpeak()) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
  return true
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel()
}

export const INSTRUCTIONS =
  'Welcome to Drawsound. First, choose a photo of a drawing, or try one of the example drawings. ' +
  'Drawsound listens to the colors, lines and shapes, and turns them into a song. ' +
  'Then press Play. You can pick a different sound, or ask for a new version of the song. ' +
  'In the Explore by sound section, use the arrow keys to hear each part of the drawing, from top left to bottom right.'
