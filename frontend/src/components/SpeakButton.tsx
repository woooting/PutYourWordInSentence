import { useEffect, useState, useCallback } from 'react'
import { speak, isSpeaking } from '@/lib/speech'

interface SpeakButtonProps {
  text: string
}

/** 朗读按钮：点击朗读句子，朗读中显示声波动画 */
export function SpeakButton({ text }: SpeakButtonProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (playing && !isSpeaking()) {
        setPlaying(false)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [playing])

  const handleClick = useCallback(() => {
    if (playing) {
      window.speechSynthesis?.cancel()
      setPlaying(false)
      return
    }
    const ok = speak(text)
    if (ok) setPlaying(true)
  }, [text, playing])

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all duration-200"
      title={playing ? 'Stop' : 'Listen'}
    >
      {playing ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        >
          <rect x="6" y="4" width="4" height="16" className="origin-bottom animate-[sonar_0.8s_ease-in-out_infinite]" />
          <rect x="12" y="2" width="4" height="20" rx="0.5" className="origin-bottom animate-[sonar_1s_ease-in-out_infinite]" />
          <rect x="18" y="4" width="4" height="16" className="origin-bottom animate-[sonar_0.6s_ease-in-out_infinite]" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  )
}
