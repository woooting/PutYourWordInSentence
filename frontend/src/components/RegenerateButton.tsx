import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useExerciseStore } from '@/stores/useExerciseStore'
import { generateSentences } from '@/lib/api'

export function RegenerateButton() {
  const { inputWords, startGenerate, setSentences } = useExerciseStore()

  const handleRegenerate = useCallback(async () => {
    if (inputWords.length < 20) return
    startGenerate()

    try {
      const result = await generateSentences(inputWords)
      setSentences(result.sentences)
    } catch {
      useExerciseStore.setState({ phase: 'input' })
    }
  }, [inputWords, startGenerate, setSentences])

  return (
    <Button variant="outline" onClick={handleRegenerate}>
      重新生成所有句子
    </Button>
  )
}
