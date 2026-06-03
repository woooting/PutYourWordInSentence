import { useCallback, useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useExerciseStore, usePhase, useCurrentGroup, useIsGroupComplete, useSentences, useGroupStates } from '@/stores/useExerciseStore'
import { getWordBankWords } from '@/lib/utils'
import { WordInput } from '@/components/WordInput'
import { WordBank } from '@/components/WordBank'
import { SentenceList } from '@/components/SentenceList'
import { GroupPagination } from '@/components/GroupPagination'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { RegenerateButton } from '@/components/RegenerateButton'
import { TranslateButton } from '@/components/TranslateButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MistakeReview } from '@/components/MistakeReview'

const GROUP_SIZE = 5

/** 输入阶段：展示单词输入面板 */
function InputPhase() {
  return <WordInput />
}

/** 加载阶段：显示全屏 loading 遮罩 */
function LoadingPhase() {
  return <LoadingOverlay />
}

/** 练习阶段：DndContext 包裹词库+句子列表+翻页，处理拖拽判题 + 键盘快捷键 */
function ExercisingPhase() {
  const groupIdx = useCurrentGroup()
  const isComplete = useIsGroupComplete(groupIdx)
  const checkAnswer = useExerciseStore((s) => s.checkAnswer)
  const sentences = useSentences()
  const groupStates = useGroupStates()
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [focusedBlankIdx, setFocusedBlankIdx] = useState<number>(-1)

  const wordBankWords = useMemo(
    () => getWordBankWords(sentences, groupIdx),
    [sentences, groupIdx]
  )

  const groupStart = groupIdx * GROUP_SIZE
  const blankIndices = useMemo(
    () => Array.from({ length: GROUP_SIZE }, (_, i) => groupStart + i),
    [groupStart]
  )

  const handleKeyboard = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key

      if (key === 'Tab') {
        e.preventDefault()
        const currentGroupState = groupStates[groupIdx] ?? {}

        if (e.shiftKey) {
          const prev = blankIndices
            .slice()
            .reverse()
            .find((bi) => {
              const bs = currentGroupState[bi]
              return bi < focusedBlankIdx ? (bs ? !bs.isCorrect : true) : false
            })
          setFocusedBlankIdx(prev ?? blankIndices[0])
        } else {
          const next = blankIndices.find((bi) => {
            const bs = currentGroupState[bi]
            return bi > focusedBlankIdx ? (bs ? !bs.isCorrect : true) : false
          })
          setFocusedBlankIdx(next ?? blankIndices[0])
        }
        return
      }

      if (/^[1-9]|0$/.test(key)) {
        e.preventDefault()
        const num = parseInt(key) - 1
        const word = wordBankWords[num]
        if (!word) return

        const targetIdx = focusedBlankIdx >= 0 ? focusedBlankIdx : blankIndices[0]
        const targetGroup = groupState[targetIdx]
        if (!targetGroup || targetGroup.isCorrect) return

        checkAnswer(groupIdx, targetIdx, word)
        const nextUnfilled = blankIndices.find((bi) => {
          const bs = groupStates[groupIdx]?.[bi]
          return bi > targetIdx ? (bs ? !bs.isCorrect : true) : false
        })
        setFocusedBlankIdx(nextUnfilled ?? -1)
      }
    },
    [groupIdx, groupStates, blankIndices, wordBankWords, focusedBlankIdx, checkAnswer]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const word = String(event.active.data.current?.word ?? '')
    if (word) setActiveWord(word)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveWord(null)
      const { active, over } = event
      if (!over) return

      const word = String(active.data.current?.word ?? '')
      if (!word) return

      const overId = String(over.id)
      const match = overId.match(/^blank:(\d+):(\d+)$/)
      if (!match) return

      const gIdx = parseInt(match[1])
      const blankIdx = parseInt(match[2])
      checkAnswer(gIdx, blankIdx, word)
    },
    [checkAnswer]
  )

  const handleContainerClick = useCallback(() => {
    if (focusedBlankIdx < 0 && blankIndices.length > 0) {
      setFocusedBlankIdx(blankIndices[0])
    }
  }, [focusedBlankIdx, blankIndices])

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col" onKeyDown={handleKeyboard} tabIndex={-1}>
        <header className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border-light">
          <h1 className="font-serif text-lg sm:text-xl font-medium text-text tracking-tight">
            Sentence Builder
          </h1>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <ThemeToggle />
            <TranslateButton />
            <RegenerateButton />
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" onClick={handleContainerClick}>
          <div className="lg:flex-[7] flex flex-col order-2 lg:order-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4">
              <SentenceList groupIdx={groupIdx} focusedBlankIdx={focusedBlankIdx} />
              {isComplete && (
                <p className="text-center text-success font-medium mt-5 animate-fade-in-up select-none text-sm sm:text-base">
                  This group is complete
                </p>
              )}
            </div>
            <div className="shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 border-t border-border-light">
              <GroupPagination groupIdx={groupIdx} />
            </div>
          </div>

          <div className="lg:flex-[3] lg:shrink-0 flex border-t lg:border-t-0 lg:border-l border-border-light order-1 lg:order-2 overflow-hidden max-h-[40vh] lg:max-h-none">
            <div className="flex-1 overflow-y-auto p-2 sm:p-3">
              <WordBank groupIdx={groupIdx} />
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeWord ? (
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-surface border border-border text-text shadow-lg scale-105 select-none">
            {activeWord}
          </span>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

/** 完成阶段：展示错题回顾页，无错题时展示 Perfect 空状态 */
function CompletedPhase() {
  return <MistakeReview />
}

/** 根组件，根据 phase 切换 input→loading→exercising→completed 四个阶段 */
export function App() {
  const phase = usePhase()

  if (phase === 'loading') return <LoadingPhase />
  if (phase === 'exercising') return <ExercisingPhase />
  if (phase === 'completed') return <CompletedPhase />
  return <InputPhase />
}
