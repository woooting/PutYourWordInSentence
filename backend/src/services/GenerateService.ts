import type { GenerateResponse } from '../types'
import { BusinessError } from '../errors/BusinessError'

export async function generateService(words: string[]): Promise<GenerateResponse> {
  const uniqueWords = [...new Set(words.map((w) => w.trim().toLowerCase()).filter((w) => w.length > 0))]

  if (uniqueWords.length < 20) {
    throw new BusinessError('至少需要20个不重复的单词')
  }

  const sentences = uniqueWords.map((word) => ({
    word,
    completeSentence: `This is a placeholder sentence with the word "${word}".`,
    blankSentence: `This is a placeholder sentence with the word "________".`,
    blankIndex: 9,
  }))

  return { sentences }
}
