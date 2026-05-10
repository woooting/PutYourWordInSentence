import { useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { pickRandom } from '@/lib/utils'
import { useSentences, useGroupStates } from '@/stores/useExerciseStore'

const GROUP_SIZE = 5

interface WordBankProps {
  groupIdx: number
}

/**
 * 词库区：显示当前组的10个可拖拽单词（5正确+5干扰）
 * 已正确拖入的单词变灰不可拖拽
 */
export function WordBank({ groupIdx }: WordBankProps) {
  const sentences = useSentences()
  const groupStates = useGroupStates()

  const { correctWords, distractorWords } = useMemo(() => {
    const groupStart = groupIdx * GROUP_SIZE
    const groupEnd = groupStart + GROUP_SIZE
    const correctWords = sentences
      .slice(groupStart, groupEnd)
      .map((item) => item.word)

    const otherWords = sentences
      .filter((_, i) => i < groupStart || i >= groupEnd)
      .map((item) => item.word)

    const distractorWords = pickRandom(otherWords, GROUP_SIZE)

    return { correctWords, distractorWords }
  }, [sentences, groupIdx])

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
      <div className="grid grid-cols-2 gap-2.5 place-items-center">
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
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({
      id: draggableId,
      data: { type: 'word-bank', word },
      disabled: isUsed,
    })

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
        isDragging && !isUsed && 'opacity-0 scale-95'
      )}
    >
      {word}
    </div>
  )
}
