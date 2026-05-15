import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useExerciseStore, useGroupTotal, useIsGroupComplete } from '@/stores/useExerciseStore'

interface GroupPaginationProps {
  groupIdx: number
}

/** 翻页导航：上/下一组按钮 + 页码，最后一组变"完成"，未完成跳转时二次确认 */
export function GroupPagination({ groupIdx }: GroupPaginationProps) {
  const nextGroup = useExerciseStore((s) => s.nextGroup)
  const prevGroup = useExerciseStore((s) => s.prevGroup)
  const totalGroups = useGroupTotal()
  const isComplete = useIsGroupComplete(groupIdx)
  const isLastGroup = groupIdx === totalGroups - 1

  const handleNext = useCallback(() => {
    if (!isComplete) {
      const confirmed = window.confirm('Current group has unfinished sentences. Skip to next group?')
      if (!confirmed) return
    }
    nextGroup()
  }, [isComplete, nextGroup])

  const handlePrev = useCallback(() => {
    prevGroup()
  }, [prevGroup])

  return (
    <div className="flex items-center justify-between mt-7">
      <Button
        variant="ghost"
        onClick={handlePrev}
        disabled={groupIdx === 0}
        className="h-9 px-4 rounded-xl text-text-secondary hover:text-text hover:bg-surface-alt transition-all duration-200 text-sm font-medium disabled:opacity-30"
      >
        Previous
      </Button>

      <span className="text-sm text-text-muted tabular-nums select-none">
        {groupIdx + 1} / {totalGroups}
      </span>

      {isLastGroup ? (
        <Button
          onClick={nextGroup}
          className="h-9 px-5 rounded-xl bg-primary hover:bg-primary-hover text-surface shadow-none transition-all duration-200 hover:shadow-md text-sm font-medium"
        >
          Finish
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          className="h-9 px-5 rounded-xl bg-primary hover:bg-primary-hover text-surface shadow-none transition-all duration-200 hover:shadow-md text-sm font-medium"
        >
          Next
        </Button>
      )}
    </div>
  )
}
