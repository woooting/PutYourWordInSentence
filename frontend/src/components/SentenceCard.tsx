import { useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { SentenceItem } from '@project/shared'
import type { BlankState } from '@/types'
import { SpeakButton } from './SpeakButton'

const shakeKeyframes: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(6px)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(0)' },
]

const shakeOptions: KeyframeAnimationOptions = {
  duration: 400,
  easing: 'ease-in-out',
}

interface SentenceCardProps {
  sentence: SentenceItem
  globalIndex: number
  groupIdx: number
  blankState: BlankState
  showChinese: boolean
  onRegenerate?: (globalIndex: number) => void
  isFocused?: boolean
}

/**
 * 句子卡片：展示挖空句子，DropZone 接收拖拽单词
 * 正确绿色锁定，错误红色 + Web Animations API 震动
 */
export function SentenceCard({
  sentence,
  globalIndex,
  groupIdx,
  blankState,
  showChinese,
  onRegenerate,
  isFocused,
}: SentenceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)
  const droppableId = `blank:${groupIdx}:${globalIndex}`
  const { isOver, setNodeRef } = useDroppable({ id: droppableId })

  const { placedWord, isCorrect, shakeStamp } = blankState
  const filled = placedWord !== null

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (shakeStamp > 0 && placedWord && !isCorrect && cardRef.current) {
      cardRef.current.animate(shakeKeyframes, shakeOptions)
    }
  }, [shakeStamp, placedWord, isCorrect])

  let zoneClass = 'drop-zone'
  if (filled) {
    zoneClass = isCorrect ? 'drop-zone drop-zone-correct' : 'drop-zone drop-zone-incorrect'
  } else if (isOver) {
    zoneClass = 'drop-zone border-primary bg-primary-light border-solid'
  }
  if (isFocused && !filled) {
    zoneClass += ' border-primary ring-2 ring-primary/30'
  }

  const parts = sentence.blankSentence.split('________')

  return (
    <div
      ref={cardRef}
      className={cn(
        'bg-surface border border-border-light rounded-2xl p-3 sm:p-4 transition-all duration-200 hover:shadow-sm',
        filled && isCorrect && 'border-success/40 bg-success-bg/50'
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 text-sm sm:text-base leading-7 sm:leading-8 text-text">
          <span className="text-text-secondary">{parts[0]}</span>
          <span ref={setNodeRef} className={cn('mx-1 sm:mx-1.5', zoneClass)}>
            {placedWord ? (
              <span
                className={cn(
                  'font-medium text-xs sm:text-sm',
                  isCorrect ? 'text-success' : 'text-error'
                )}
              >
                {placedWord}
              </span>
            ) : (
              <span className="text-text-muted text-[10px] sm:text-xs">drop here</span>
            )}
          </span>
          <span className="text-text-secondary">{parts[1]}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <SpeakButton text={sentence.completeSentence} />
          {filled && (
            <span
              className={cn(
                'text-base sm:text-lg font-serif',
                isCorrect ? 'text-success' : 'text-error'
              )}
            >
              {isCorrect ? '✓' : '✗'}
            </span>
          )}
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(globalIndex)}
              className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all duration-200"
              title="Regenerate this sentence"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-3.5 sm:h-3.5"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showChinese && sentence.chinese && (
        <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
          {sentence.chinese}
        </p>
      )}
    </div>
  )
}
