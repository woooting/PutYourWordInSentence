import { useCallback, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragStartEvent,
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
import { TranslateButton } from '@/components/TranslateButton'

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
  const [activeWord, setActiveWord] = useState<string | null>(null)

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

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col">
        <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border-light">
          <h1 className="font-serif text-xl font-medium text-text tracking-tight">
            Sentence Builder
          </h1>
          <div className="flex items-center gap-1">
            <TranslateButton />
            <RegenerateButton />
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="lg:flex-[7] flex flex-col order-2 lg:order-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <SentenceList groupIdx={groupIdx} />
              {isComplete && (
                <p className="text-center text-success font-medium mt-5 animate-fade-in-up select-none">
                  This group is complete
                </p>
              )}
            </div>
            <div className="shrink-0 px-5 py-3 border-t border-border-light">
              <GroupPagination groupIdx={groupIdx} />
            </div>
          </div>

          <div className="lg:flex-[3] lg:shrink-0 flex border-t lg:border-t-0 lg:border-l border-border-light order-1 lg:order-2 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3">
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
