import { useCallback, useEffect, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SentenceItem } from '@project/shared'
import type { BlankState } from '@/types'
import { Button } from '@/components/ui/button'

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
  const [shakeKey, setShakeKey] = useState(0)
  const droppableId = `blank:${groupIdx}:${globalIndex}`
  const { isOver, setNodeRef } = useDroppable({ id: droppableId })

  const { placedWord, isCorrect } = blankState
  const filled = placedWord !== null

  useEffect(() => {
    if (placedWord && !isCorrect) {
      setShakeKey((k) => k + 1)
    }
  }, [placedWord])

  let zoneClass = 'drop-zone'
  if (filled) {
    zoneClass = isCorrect ? 'drop-zone drop-zone-correct' : 'drop-zone drop-zone-incorrect'
  } else if (isOver) {
    zoneClass = 'drop-zone ring-2 ring-blue-400 bg-blue-50'
  }

  const parts = sentence.blankSentence.split('________')

  const handleRegenerate = useCallback(() => {
    onRegenerate?.(globalIndex)
  }, [globalIndex, onRegenerate])

  return (
    <Card
      className={cn(filled && !isCorrect && shakeKey > 0 && 'animate-shake')}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex-1 text-base leading-8">
          {parts[0]}
          <span ref={setNodeRef} className={cn('mx-1', zoneClass)}>
            {placedWord || (
              <span className="text-gray-300 text-sm">drop here</span>
            )}
          </span>
          {parts[1]}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {filled && isCorrect && (
            <span className="text-green-win text-lg font-bold">✅</span>
          )}
          {filled && !isCorrect && (
            <span className="text-red-lose text-lg font-bold">❌</span>
          )}
          {onRegenerate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRegenerate}
              title="重新生成此句"
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
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
