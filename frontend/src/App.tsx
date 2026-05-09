import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
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
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-7">
          <h1 className="font-serif text-2xl font-medium text-text tracking-tight">
            Sentence Builder
          </h1>
          <RegenerateButton />
        </div>

        <div className="mb-7">
          <WordBank groupIdx={groupIdx} />
        </div>

        <SentenceList groupIdx={groupIdx} />

        {isComplete && (
          <p className="text-center text-success font-medium mt-5 animate-fade-in-up select-none">
            This group is complete
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
    <div className="min-h-screen flex items-center justify-center bg-cream px-5">
      <div className="text-center animate-fade-in-up">
        <div className="mb-6">
          <svg
            className="mx-auto text-primary"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-medium text-text mb-3 tracking-tight">
          All complete
        </h1>
        <p className="text-text-secondary mb-8 text-base leading-relaxed">
          You have finished all the sentence exercises.
        </p>
        <Button
          onClick={resetAll}
          className="bg-primary hover:bg-primary-hover text-surface rounded-xl px-7 py-2.5 h-auto text-sm font-medium shadow-none transition-all duration-200 hover:shadow-md"
        >
          Start new exercise
        </Button>
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
