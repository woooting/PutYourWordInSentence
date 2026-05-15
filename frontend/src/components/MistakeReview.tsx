import { useMemo, useCallback } from 'react'
import type { SentenceItem } from '@project/shared'
import { Button } from '@/components/ui/button'
import { useExerciseStore, useSentences, useGroupStates, useShowChinese } from '@/stores/useExerciseStore'
import { TranslateButton } from '@/components/TranslateButton'
import { cn } from '@/lib/utils'
import type { BlankState } from '@/types'

interface MistakeItem {
  globalIndex: number
  sentence: SentenceItem
  blankState: BlankState
}

function MistakeCard({ item, showChinese }: { item: MistakeItem; showChinese: boolean }) {
  const { sentence, blankState } = item
  const { placedWord, isCorrect, shakeStamp } = blankState
  const parts = sentence.blankSentence.split('________')

  return (
    <div className="bg-surface border border-border-light rounded-2xl p-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-1.5 shrink-0 inline-block w-2 h-2 rounded-full',
            isCorrect ? 'bg-success' : 'bg-error'
          )}
        />

        <div className="flex-1 min-w-0">
          <p className="text-base leading-8 text-text">
            <span className="text-text-secondary">{parts[0]}</span>
            <span className="font-medium text-primary bg-primary-light/60 px-1 rounded">
              {sentence.word}
            </span>
            <span className="text-text-secondary">{parts[1]}</span>
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={cn('font-medium', isCorrect ? 'text-success' : 'text-error')}>
              {isCorrect ? `尝试 ${shakeStamp} 次后答对` : `未答对，尝试 ${shakeStamp} 次`}
            </span>
            {!isCorrect && placedWord && (
              <>
                <span className="text-text-muted">&middot;</span>
                <span className="text-text-muted">
                  你的答案: <span className="font-medium text-error">{placedWord}</span>
                </span>
              </>
            )}
          </div>

          {showChinese && sentence.chinese && (
            <p className="mt-2 text-sm text-text-muted leading-relaxed">{sentence.chinese}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** 错题回顾页：展示所有有过错误尝试的句子，无错题时展示 Perfect 空状态 */
export function MistakeReview() {
  const sentences = useSentences()
  const groupStates = useGroupStates()
  const showChinese = useShowChinese()
  const resetAll = useExerciseStore((s) => s.resetAll)

  const mistakes = useMemo(() => {
    const items: MistakeItem[] = []
    for (const gKey of Object.keys(groupStates)) {
      const gIdx = parseInt(gKey)
      const groupState = groupStates[gIdx]
      if (!groupState) continue
      for (const sKey of Object.keys(groupState)) {
        const blankState = groupState[parseInt(sKey)]
        if (!blankState || blankState.shakeStamp <= 0) continue
        const globalIndex = parseInt(sKey)
        const sentence = sentences[globalIndex]
        if (!sentence) continue
        items.push({ globalIndex, sentence, blankState })
      }
    }
    return items
  }, [sentences, groupStates])

  const handleRestart = useCallback(() => {
    resetAll()
  }, [resetAll])

  if (mistakes.length === 0) {
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
            Perfect!
          </h1>
          <p className="text-text-secondary mb-8 text-base leading-relaxed">
            全部答对，没有错题。
          </p>
          <Button
            onClick={handleRestart}
            className="bg-primary hover:bg-primary-hover text-surface rounded-xl px-7 py-2.5 h-auto text-sm font-medium shadow-none transition-all duration-200 hover:shadow-md"
          >
            Start new exercise
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border-light">
        <h1 className="font-serif text-xl font-medium text-text tracking-tight">
          错题回顾
        </h1>
        <TranslateButton />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-text-secondary text-sm">
            共 {mistakes.length} 道错题
          </p>
          {mistakes.map((item) => (
            <MistakeCard
              key={item.globalIndex}
              item={item}
              showChinese={showChinese}
            />
          ))}
        </div>
      </main>

      <footer className="shrink-0 flex justify-center px-5 py-4 border-t border-border-light">
        <Button
          onClick={handleRestart}
          className="bg-primary hover:bg-primary-hover text-surface rounded-xl px-7 py-2.5 h-auto text-sm font-medium shadow-none transition-all duration-200 hover:shadow-md"
        >
          重新开始
        </Button>
      </footer>
    </div>
  )
}
