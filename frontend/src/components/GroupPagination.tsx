import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useExerciseStore, useGroupTotal, useIsGroupComplete } from '@/stores/useExerciseStore'

interface GroupPaginationProps {
  groupIdx: number
}

export function GroupPagination({ groupIdx }: GroupPaginationProps) {
  const nextGroup = useExerciseStore((s) => s.nextGroup)
  const prevGroup = useExerciseStore((s) => s.prevGroup)
  const totalGroups = useGroupTotal()
  const isComplete = useIsGroupComplete(groupIdx)
  const isLastGroup = groupIdx === totalGroups - 1

  const handleNext = useCallback(() => {
    if (!isComplete) {
      const confirmed = window.confirm('当前组还有未完成的句子，确定要跳转到下一组吗？')
      if (!confirmed) return
    }
    nextGroup()
  }, [isComplete, nextGroup])

  const handlePrev = useCallback(() => {
    prevGroup()
  }, [prevGroup])

  return (
    <div className="flex items-center justify-between mt-4">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={groupIdx === 0}
      >
        上一组
      </Button>

      <span className="text-sm text-gray-500">
        第 {groupIdx + 1} / {totalGroups} 组
      </span>

      {isLastGroup ? (
        <Button onClick={nextGroup}>完成</Button>
      ) : (
        <Button onClick={handleNext}>
          下一组
        </Button>
      )}
    </div>
  )
}
