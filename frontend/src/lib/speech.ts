/** 获取英语语音对象，优先 en-US，fallback 到任意 en-* */
function getEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang.startsWith('en') && v.localService) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  )
}

/** 朗读指定文本，语速适中，返回是否成功 */
export function speak(text: string): boolean {
  if (!window.speechSynthesis) return false

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)

  const voice = getEnglishVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.pitch = 1

  window.speechSynthesis.speak(utterance)
  return true
}

/** 停止当前朗读 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

/** 检查是否正在朗读 */
export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false
}
