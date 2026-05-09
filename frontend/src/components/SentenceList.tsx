import type { SentenceItem } from '@project/shared'
import { useSentences, useGroupStates } from '@/stores/useExerciseStore'
import { SentenceCard } from './SentenceCard'

const GROUP_SIZE = 5

interface SentenceListProps {
  groupIdx: number
}

export function SentenceList({ groupIdx }: SentenceListProps) {
  const sentences = useSentences()
  const groupStates = useGroupStates()

  const start = groupIdx * GROUP_SIZE
  const end = start + GROUP_SIZE
  const groupSentences: SentenceItem[] = sentences.slice(start, end)
  const groupState = groupStates[groupIdx] || {}

  const handleRegenerate = (_globalIndex: number) => {
    // TODO: 单句重新生成逻辑，Phase 5+ 实现
  }

  return (
    <div className="flex flex-col gap-3">
      {groupSentences.map((sentence, i) => {
        const globalIndex = start + i
        const blankState = groupState[globalIndex] || {
          placedWord: null,
          isCorrect: false,
        }
        return (
          <SentenceCard
            key={globalIndex}
            sentence={sentence}
            globalIndex={globalIndex}
            groupIdx={groupIdx}
            blankState={blankState}
            onRegenerate={handleRegenerate}
          />
        )
      })}
    </div>
  )
}
