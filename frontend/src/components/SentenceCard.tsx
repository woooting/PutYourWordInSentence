import { useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { SentenceItem } from '@project/shared'
import type { BlankState } from '@/types'

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
  onRegenerate?: (globalIndex: number) => void
}

export function SentenceCard({
  sentence,
  globalIndex,
  groupIdx,
  blankState,
  onRegenerate,
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

  const parts = sentence.blankSentence.split('________')

  return (
    <div
      ref={cardRef}
      className={cn(
        'bg-surface border border-border-light rounded-2xl p-4 transition-all duration-200 hover:shadow-sm',
        filled && isCorrect && 'border-success/40 bg-success-bg/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 text-base leading-8 text-text">
          <span className="text-text-secondary">{parts[0]}</span>
          <span ref={setNodeRef} className={cn('mx-1.5', zoneClass)}>
            {placedWord ? (
              <span
                className={cn(
                  'font-medium text-sm',
                  isCorrect ? 'text-success' : 'text-error'
                )}
              >
                {placedWord}
              </span>
            ) : (
              <span className="text-text-muted text-xs">drop here</span>
            )}
          </span>
          <span className="text-text-secondary">{parts[1]}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {filled && (
            <span
              className={cn(
                'text-lg font-serif',
                isCorrect ? 'text-success' : 'text-error'
              )}
            >
              {isCorrect ? '✓' : '✗'}
            </span>
          )}
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(globalIndex)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all duration-200"
              title="Regenerate this sentence"
            >
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
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
