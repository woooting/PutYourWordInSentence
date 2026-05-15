import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useExerciseStore } from '@/stores/useExerciseStore'
import { generateSentences } from '@/lib/api'

/** 单词输入区：Tag 式输入、自动去重、数量校验、调用生成 API */
export function WordInput() {
  const { inputWords, setInputWords, startGenerate, setSentences } =
    useExerciseStore()

  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** 解析输入文本为单词数组，去重后追加到列表 */
  const addWords = useCallback(
    (input: string) => {
      const newWords = input
        .split(/[,，\s]+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0 && /^[a-zA-Z]+$/.test(w))

      if (newWords.length === 0) return

      const existing = new Set(inputWords.map((w) => w.toLowerCase()))
      const uniqueNew = newWords.filter((w) => !existing.has(w))

      if (uniqueNew.length > 0) {
        setInputWords([...inputWords, ...uniqueNew])
      }
    },
    [inputWords, setInputWords]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (text.trim()) {
          addWords(text)
          setText('')
        }
      } 
    },
    [text, addWords]
  )

  /** 从列表中移除指定索引的单词 */
  const removeWord = useCallback(
    (index: number) => {
      setInputWords(inputWords.filter((_, i) => i !== index))
    },
    [inputWords, setInputWords]
  )

  const handleGenerate = useCallback(async () => {
    if (inputWords.length < 20) return
    setIsLoading(true)
    setError(null)
    startGenerate()

    try {
      const result = await generateSentences(inputWords)
      setSentences(result.sentences)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败'
      setError(msg)
      useExerciseStore.setState({ phase: 'input' })
    } finally {
      setIsLoading(false)
    }
  }, [inputWords, startGenerate, setSentences])

  const canGenerate = inputWords.length >= 20 && !isLoading

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl font-medium text-text tracking-tight mb-2">
          Sentence Builder
        </h1>
        <p className="text-text-secondary text-sm">
          Type or paste English words to generate fill-in-the-blank exercises
        </p>
      </div>

      <div className="mb-7">
        <p className="text-xs text-text-muted mb-2.5 tracking-wide uppercase">
          Enter at least 20 words
        </p>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a word and press Enter..."
          disabled={isLoading}
          className="h-11 rounded-xl border-border bg-surface px-4 text-text placeholder:text-text-muted focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 text-sm"
        />
      </div>

      {inputWords.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-7 p-5 bg-surface rounded-2xl border border-border-light min-h-[60px] animate-fade-in-up">
          {inputWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              onClick={() => removeWord(index)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-tag text-text text-sm font-medium rounded-full cursor-pointer transition-all duration-200 hover:bg-tag-hover hover:scale-105 select-none group"
            >
              {word}
              <span className="text-text-muted group-hover:text-error transition-colors duration-200 text-xs leading-none">
                ×
              </span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">
          <span
            className={
              inputWords.length >= 20
                ? 'text-success font-semibold'
                : 'text-error font-semibold'
            }
          >
            {inputWords.length}
          </span>
          <span className="text-text-muted"> / 20 words</span>
        </span>
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="min-w-[128px] h-10 rounded-xl bg-primary hover:bg-primary-hover text-surface shadow-none transition-all duration-200 hover:shadow-md disabled:opacity-40 text-sm font-medium"
        >
          {isLoading ? 'Generating...' : 'Generate Sentences'}
        </Button>
      </div>

      {!canGenerate && inputWords.length > 0 && (
        <p className="text-xs text-text-muted mt-4 pl-1">
          Need {20 - inputWords.length} more word{20 - inputWords.length > 1 ? 's' : ''} to generate
        </p>
      )}

      {error && (
        <div className="mt-5 p-4 bg-error-bg border border-error/30 rounded-xl animate-fade-in-up">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
    </div>
  )
}
