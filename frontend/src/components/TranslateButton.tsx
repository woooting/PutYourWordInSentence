import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useExerciseStore } from '@/stores/useExerciseStore'

/** 中英翻译切换按钮，控制句子卡片底部中文释义的显隐 */
export function TranslateButton() {
  const toggleChinese = useExerciseStore((s) => s.toggleChinese)

  const handleClick = useCallback(() => {
    toggleChinese()
  }, [toggleChinese])

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
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
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
      Translate
    </Button>
  )
}
