import type { SentenceItem } from '@project/shared'
import { useSentences, useGroupStates, useShowChinese } from '@/stores/useExerciseStore'
import { SentenceCard } from './SentenceCard'

const GROUP_SIZE = 5

interface SentenceListProps {
  groupIdx: number
}

export function SentenceList({ groupIdx }: SentenceListProps) {
  const sentences = useSentences()
  const groupStates = useGroupStates()
  const showChinese = useShowChinese()

  const start = groupIdx * GROUP_SIZE
  const end = start + GROUP_SIZE
  const groupSentences: SentenceItem[] = sentences.slice(start, end)
  const groupState = groupStates[groupIdx] || {}

  const handleRegenerate = (_globalIndex: number) => {
    // TODO: single sentence regeneration, Phase 5+
  }

  return (
    <div className="flex flex-col gap-3.5">
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
            showChinese={showChinese}
            onRegenerate={handleRegenerate}
          />
        )
      })}
    </div>
  )
}
