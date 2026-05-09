import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useExerciseStore, usePhase, useCurrentGroup, useIsGroupComplete } from '@/stores/useExerciseStore'
import { WordInput } from '@/components/WordInput'
import { WordBank } from '@/components/WordBank'
import { SentenceList } from '@/components/SentenceList'
import { GroupPagination } from '@/components/GroupPagination'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { RegenerateButton } from '@/components/RegenerateButton'

function InputPhase() {
  return <WordInput />
}

function LoadingPhase() {
  return <LoadingOverlay />
}

function ExercisingPhase() {
  const groupIdx = useCurrentGroup()
  const isComplete = useIsGroupComplete(groupIdx)
  const checkAnswer = useExerciseStore((s) => s.checkAnswer)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">English Sentence Builder</h1>
          <RegenerateButton />
        </div>

        <div className="mb-6">
          <WordBank groupIdx={groupIdx} />
        </div>

        <SentenceList groupIdx={groupIdx} />

        {isComplete && (
          <p className="text-center text-green-600 font-semibold mt-4 animate-bounce">
            🎉 本组完成！
          </p>
        )}

        <GroupPagination groupIdx={groupIdx} />
      </div>
    </DndContext>
  )
}

function CompletedPhase() {
  const resetAll = useExerciseStore((s) => s.resetAll)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 全部完成！
        </h1>
        <p className="text-gray-600 mb-6">
          你已完成所有句子的填空练习，太棒了！
        </p>
        <button
          onClick={resetAll}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          再来一组
        </button>
      </div>
    </div>
  )
}

export function App() {
  const phase = usePhase()

  if (phase === 'loading') return <LoadingPhase />
  if (phase === 'exercising') return <ExercisingPhase />
  if (phase === 'completed') return <CompletedPhase />
  return <InputPhase />
}
