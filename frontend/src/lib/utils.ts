import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SentenceItem } from '@project/shared'

/** 合并 Tailwind CSS 类名，自动处理冲突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 将数组按指定大小分片，返回二维数组 */
export function groupSentences<T>(arr: T[], groupSize: number): T[][] {
  const groups: T[][] = []
  for (let i = 0; i < arr.length; i += groupSize) {
    groups.push(arr.slice(i, i + groupSize))
  }
  return groups
}

/** 从数组中随机抽取指定数量的元素 */
export function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/** Fisher-Yates 洗牌，返回新数组 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const GROUP_SIZE = 5

/**
 * 计算当前组的词库单词列表（5正确+5干扰，去重后随机排列）
 * 用于键盘快捷键获取词库顺序和 WordBank 组件渲染
 */
export function getWordBankWords(
  sentences: SentenceItem[],
  groupIdx: number
): string[] {
  const groupStart = groupIdx * GROUP_SIZE
  const groupEnd = groupStart + GROUP_SIZE
  const correctWords = sentences
    .slice(groupStart, groupEnd)
    .map((item) => item.word)

  const otherWords = sentences
    .filter((_, i) => i < groupStart || i >= groupEnd)
    .map((item) => item.word)

  const distractorWords = pickRandom(otherWords, GROUP_SIZE)
  const allWords = [...correctWords, ...distractorWords]
  const unique = [...new Set(allWords.map((w) => w.toLowerCase()))]
  return unique.sort(() => Math.random() - 0.5)
}
