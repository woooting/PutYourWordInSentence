import { useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useExerciseStore } from '@/stores/useExerciseStore'
import { generateSentences } from '@/lib/api'

/** 全局重新生成按钮，用原单词列表重新调用 AI */
export function RegenerateButton() {
  const { inputWords, startGenerate, setSentences } = useExerciseStore()

  const handleRegenerate = useCallback(async () => {
    if (inputWords.length < 20) return
    startGenerate()

    try {
      const result = await generateSentences(inputWords)
      setSentences(result.sentences)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI生成失败，请稍后重试'
      toast.error(msg)
      useExerciseStore.setState({ phase: 'input' })
    }
  }, [inputWords, startGenerate, setSentences])

  return (
    <Button
      variant="ghost"
      onClick={handleRegenerate}
      className="h-8 px-3.5 rounded-xl text-text-secondary hover:text-text hover:bg-surface-alt transition-all duration-200 text-xs font-medium"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1.5"
      >
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
      </svg>
      Regenerate
    </Button>
  )
}
