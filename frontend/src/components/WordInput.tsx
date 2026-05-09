import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useExerciseStore } from '@/stores/useExerciseStore'
import { generateSentences } from '@/lib/api'

export function WordInput() {
  const { inputWords, setInputWords, startGenerate, setSentences } =
    useExerciseStore()

  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        English Sentence Builder
      </h1>

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">
          输入至少 20 个英文单词，用逗号、空格或回车分隔
        </p>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入单词后按回车添加..."
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {inputWords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg min-h-[60px]">
          {inputWords.map((word, index) => (
            <Badge
              key={`${word}-${index}`}
              variant="secondary"
              className="text-base py-1.5 px-3 cursor-pointer hover:bg-gray-200 transition-colors group"
              onClick={() => removeWord(index)}
            >
              {word}
              <span className="ml-1.5 text-gray-400 group-hover:text-red-500 transition-colors">
                ×
              </span>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          已输入{' '}
          <span
            className={
              inputWords.length >= 20 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'
            }
          >
            {inputWords.length}
          </span>{' '}
          / 20 个单词
        </span>
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="min-w-[120px]"
        >
          {isLoading ? '生成中...' : '生成句子'}
        </Button>
      </div>

      {!canGenerate && inputWords.length > 0 && (
        <p className="text-sm text-amber-600 mt-3">
          还需要至少 {20 - inputWords.length} 个单词才能生成句子
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-3 p-3 bg-red-50 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}
