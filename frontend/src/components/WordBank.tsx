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
    <div className="w-full p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-500 mb-3">词库 — 拖拽单词到下方句子的空位中</p>
      <div className="flex flex-wrap gap-2 justify-center">
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
        'px-4 py-2 rounded-full text-sm font-medium select-none transition-all',
        isUsed
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through'
          : 'bg-white border-2 border-blue-400 text-blue-700 cursor-grab hover:bg-blue-50 hover:scale-105 active:cursor-grabbing shadow-sm',
        isDragging && !isUsed && 'opacity-50 shadow-lg'
      )}
      style={style}
    >
      {word}
    </div>
  )
}
