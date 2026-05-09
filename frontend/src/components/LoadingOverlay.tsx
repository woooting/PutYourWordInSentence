import { useEffect, useState } from 'react'

export function LoadingOverlay() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-flex gap-1 mb-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-lg text-gray-600">
          AI 正在为你生成句子{dots}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          这可能需要 15-30 秒，请耐心等待
        </p>
      </div>
    </div>
  )
}
