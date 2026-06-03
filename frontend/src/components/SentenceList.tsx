import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { SentenceItem } from '@project/shared'
import { useSentences, useGroupStates, useShowChinese, useExerciseStore } from '@/stores/useExerciseStore'
import { regenerateSentence } from '@/lib/api'
import { SentenceCard } from './SentenceCard'

const GROUP_SIZE = 5

interface SentenceListProps {
  groupIdx: number
  focusedBlankIdx: number
}

/** 当前组的句子列表容器，按组索引切片渲染 5 个 SentenceCard */
export function SentenceList({ groupIdx, focusedBlankIdx }: SentenceListProps) {
  const sentences = useSentences()
  const groupStates = useGroupStates()
  const showChinese = useShowChinese()
  const replaceSentence = useExerciseStore((s) => s.replaceSentence)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)

  const start = groupIdx * GROUP_SIZE
  const end = start + GROUP_SIZE
  const groupSentences: SentenceItem[] = sentences.slice(start, end)
  const groupState = groupStates[groupIdx] || {}

  const handleRegenerate = useCallback(
    async (globalIndex: number) => {
      const sentence = sentences[globalIndex]
      if (!sentence) return
      setRegeneratingIndex(globalIndex)
      try {
        const result = await regenerateSentence(sentence.word)
        replaceSentence(globalIndex, result.sentence)
        toast.success('句子已更新')
      } catch (err) {
        const msg = err instanceof Error ? err.message : '生成失败'
        toast.error(msg)
      } finally {
        setRegeneratingIndex(null)
      }
    },
    [sentences, replaceSentence]
  )

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
            onRegenerate={regeneratingIndex === globalIndex ? undefined : handleRegenerate}
            isFocused={focusedBlankIdx === globalIndex}
          />
        )
      })}
    </div>
  )
}
