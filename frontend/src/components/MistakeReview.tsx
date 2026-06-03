import { useMemo, useCallback, useState } from 'react'
import type { SentenceItem } from '@project/shared'
import { Button } from '@/components/ui/button'
import { useExerciseStore, useSentences, useGroupStates, useShowChinese, useStartTime } from '@/stores/useExerciseStore'
import { TranslateButton } from '@/components/TranslateButton'
import { ThemeToggle } from '@/components/ThemeToggle'
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
    <div className="bg-surface border border-border-light rounded-2xl p-3 sm:p-4 animate-fade-in-up">
      <div className="flex items-start gap-2 sm:gap-3">
        <span
          className={cn(
            'mt-1.5 shrink-0 inline-block w-2 h-2 rounded-full',
            isCorrect ? 'bg-success' : 'bg-error'
          )}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base leading-7 sm:leading-8 text-text">
            <span className="text-text-secondary">{parts[0]}</span>
            <span className="font-medium text-primary bg-primary-light/60 px-1 rounded text-xs sm:text-sm">
              {sentence.word}
            </span>
            <span className="text-text-secondary">{parts[1]}</span>
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs">
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
            <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">{sentence.chinese}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** 环形进度条，用于展示正确率 */
function ProgressRing({ accuracy, size = 64 }: { accuracy: number; size?: number }) {
  const strokeW = 5
  const r = (size - strokeW) / 2
  const c = Math.PI * r * 2
  const offset = c * (1 - accuracy / 100)

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-border-light)"
        strokeWidth={strokeW}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-success)"
        strokeWidth={strokeW}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        fill="var(--color-text)"
        fontSize={size * 0.2}
        fontWeight={600}
        className="[transform-box:fill-box] rotate-90 origin-center"
      >
        {Math.round(accuracy)}%
      </text>
    </svg>
  )
}

/** 格式化毫秒数为 MM:SS 格式 */
function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/** 错题回顾页：展示统计面板 + 错题列表 + 薄弱词，无错题时展示 Perfect 空状态 */
export function MistakeReview() {
  const sentences = useSentences()
  const groupStates = useGroupStates()
  const showChinese = useShowChinese()
  const startTime = useStartTime()
  const resetAll = useExerciseStore((s) => s.resetAll)
  const [completedAt] = useState(() => Date.now())

  const { mistakes, totalQuestions, correctCount, accuracy, elapsedMs, weakWords } = useMemo(() => {
    const items: MistakeItem[] = []
    const wordAttempts: Record<string, number> = {}

    for (const gKey of Object.keys(groupStates)) {
      const groupState = groupStates[parseInt(gKey)]
      if (!groupState) continue
      for (const sKey of Object.keys(groupState)) {
        const blankState = groupState[parseInt(sKey)]
        if (!blankState) continue
        const globalIndex = parseInt(sKey)
        const sentence = sentences[globalIndex]
        if (!sentence) continue
        if (blankState.shakeStamp > 0) {
          items.push({ globalIndex, sentence, blankState })
        }
        wordAttempts[sentence.word.toLowerCase()] =
          (wordAttempts[sentence.word.toLowerCase()] ?? 0) + blankState.shakeStamp
      }
    }

    const totalQuestions = sentences.length
    const allStates = Object.values(groupStates).flatMap((g) => Object.values(g))
    const correctCount = allStates.filter((bs: BlankState) => bs.isCorrect).length
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
    const elapsedMs = startTime ? completedAt - startTime : 0

    const weakWords = Object.entries(wordAttempts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .map(([word]) => word)

    return { mistakes: items, totalQuestions, correctCount, accuracy, elapsedMs, weakWords }
  }, [sentences, groupStates, startTime, completedAt])

  const handleRestart = useCallback(() => {
    resetAll()
  }, [resetAll])

  if (mistakes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4 sm:px-5">
        <div className="text-center animate-fade-in-up">
          <div className="mb-4 sm:mb-6">
            <svg
              className="mx-auto text-primary w-10 h-10 sm:w-14 sm:h-14"
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
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-text mb-2 sm:mb-3 tracking-tight">
            Perfect!
          </h1>
          <p className="text-text-secondary mb-2 sm:mb-3 text-sm sm:text-base leading-relaxed">
            全部答对，没有错题。
          </p>
          <p className="text-text-muted text-xs sm:text-sm mb-6 sm:mb-8">
            用时 {formatTime(elapsedMs)} &middot; {totalQuestions} 题全部正确
          </p>
          <Button
            onClick={handleRestart}
            className="bg-primary hover:bg-primary-hover text-surface rounded-xl px-5 sm:px-7 py-2 sm:py-2.5 h-auto text-xs sm:text-sm font-medium shadow-none transition-all duration-200 hover:shadow-md"
          >
            Start new exercise
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border-light">
        <h1 className="font-serif text-lg sm:text-xl font-medium text-text tracking-tight">
          练习结果
        </h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <TranslateButton />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-surface border border-border-light rounded-2xl p-4 sm:p-5 animate-fade-in-up">
            <h2 className="text-sm font-medium text-text-secondary mb-4">练习统计</h2>
            <div className="flex items-center gap-4 sm:gap-6">
              <ProgressRing accuracy={accuracy} size={72} />
              <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-muted text-xs">总题数</p>
                  <p className="text-text font-semibold">{totalQuestions}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">正确</p>
                  <p className="text-success font-semibold">{correctCount}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">用时</p>
                  <p className="text-text font-semibold">{formatTime(elapsedMs)}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">错题</p>
                  <p className="text-error font-semibold">{mistakes.length}</p>
                </div>
              </div>
            </div>
          </div>

          {weakWords.length > 0 && (
            <div className="bg-surface border border-border-light rounded-2xl p-4 sm:p-5 animate-fade-in-up">
              <h2 className="text-sm font-medium text-text-secondary mb-3">
                薄弱词 &middot; <span className="text-text-muted">{weakWords.length} 个</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {weakWords.map((word) => (
                  <span
                    key={word}
                    className="px-3 py-1.5 bg-error-bg border border-error/30 text-error text-xs sm:text-sm font-medium rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-sm font-medium text-text-secondary">
              错题回顾 &middot; <span className="text-text-muted">{mistakes.length} 道</span>
            </h2>
            {mistakes.map((item) => (
              <MistakeCard
                key={item.globalIndex}
                item={item}
                showChinese={showChinese}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="shrink-0 flex justify-center px-3 sm:px-5 py-3 sm:py-4 border-t border-border-light">
        <Button
          onClick={handleRestart}
          className="bg-primary hover:bg-primary-hover text-surface rounded-xl px-5 sm:px-7 py-2 sm:py-2.5 h-auto text-xs sm:text-sm font-medium shadow-none transition-all duration-200 hover:shadow-md"
        >
          重新开始
        </Button>
      </footer>
    </div>
  )
}
