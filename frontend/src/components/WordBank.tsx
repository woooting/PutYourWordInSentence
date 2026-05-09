import { useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { useWordBank, useGroupStates } from '@/stores/useExerciseStore'

interface WordBankProps {
  groupIdx: number
}

export function WordBank({ groupIdx }: WordBankProps) {
  const { correctWords, distractorWords } = useWordBank(groupIdx)
  const groupStates = useGroupStates()

  const usedCorrectWords = useMemo(() => {
    const groupState = groupStates[groupIdx]
    if (!groupState) return new Set<string>()
    return new Set(
      Object.values(groupState)
        .filter((bs) => bs.isCorrect && bs.placedWord)
        .map((bs) => bs.placedWord!.toLowerCase())
    )
  }, [groupStates, groupIdx])

  const shuffled = useMemo(() => {
    const allWords = [...correctWords, ...distractorWords]
    const unique = [...new Set(allWords.map((w) => w.toLowerCase()))]
    return unique.sort(() => Math.random() - 0.5)
  }, [correctWords, distractorWords])

  return (
    <div className="w-full p-5 bg-surface rounded-2xl border border-border-light">
      <p className="text-xs text-text-muted mb-3.5 tracking-wide uppercase">
        Word Bank
      </p>
      <div className="flex flex-wrap gap-2.5 justify-center">
        {shuffled.map((word) => (
          <DraggableWordCard
            key={word}
            word={word}
            isUsed={usedCorrectWords.has(word.toLowerCase())}
          />
        ))}
      </div>
    </div>
  )
}

function DraggableWordCard({
  word,
  isUsed,
}: {
  word: string
  isUsed: boolean
}) {
  const draggableId = `word:${word.toLowerCase()}`
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: draggableId,
      data: { type: 'word-bank', word },
      disabled: isUsed,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium select-none transition-all duration-200',
        isUsed &&
          'bg-surface-alt text-text-muted cursor-not-allowed opacity-50',
        !isUsed &&
          'bg-surface border border-border text-text cursor-grab hover:border-primary hover:text-primary hover:shadow-sm hover:-translate-y-0.5 active:cursor-grabbing active:scale-95',
        isDragging && !isUsed && 'opacity-60 shadow-lg scale-105'
      )}
      style={style}
    >
      {word}
    </div>
  )
}
