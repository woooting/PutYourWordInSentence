import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

const delayClasses = ['[animation-delay:0ms]', '[animation-delay:300ms]', '[animation-delay:600ms]']

/** 全屏 loading 遮罩，显示呼吸灯动画和动态省略号 */
export function LoadingOverlay() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 600)
    return () => clearInterval(timer)
  }, [])

  const dotElements = useMemo(
    () =>
      [0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'block w-2.5 h-2.5 rounded-full bg-primary animate-breathe',
            delayClasses[i]
          )}
        />
      )),
    []
  )

  return (
    <div className="fixed inset-0 bg-cream/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center animate-fade-in-up">
        <div className="mb-6 flex items-center justify-center gap-3">
          {dotElements}
        </div>
        <p className="text-base text-text-secondary font-medium">
          AI is generating sentences{dots}
        </p>
        <p className="text-sm text-text-muted mt-2.5">
          This may take 15-30 seconds
        </p>
      </div>
    </div>
  )
}
