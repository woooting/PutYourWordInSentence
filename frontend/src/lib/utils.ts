import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
