import type { GenerateResponse } from '../types'
import { BusinessError } from '../errors/BusinessError'
import { generateSentencesWithAI } from './AIService'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function createBlank(sentence: string, word: string): { blankSentence: string; blankIndex: number } {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i')
  const tokens = sentence.split(/\s+/)

  for (let i = 0; i < tokens.length; i++) {
    const cleanToken = tokens[i].replace(/[^\w]/g, '')
    if (cleanToken.toLowerCase() === word.toLowerCase()) {
      tokens[i] = '________'
      return { blankSentence: capitalizeFirstLetter(tokens.join(' ')), blankIndex: i }
    }
  }

  const match = sentence.match(regex)
  if (!match) {
    return { blankSentence: capitalizeFirstLetter(sentence), blankIndex: 0 }
  }

  const beforeMatch = sentence.substring(0, match.index!)
  const beforeTokens = beforeMatch.split(/\s+/)
  const wordIndex = beforeTokens.length - (beforeMatch.endsWith(' ') ? 0 : 1)
  const blankSentence = capitalizeFirstLetter(sentence.replace(regex, '________'))

  return { blankSentence, blankIndex: wordIndex }
}

export async function generateService(words: string[], apiKey: string): Promise<GenerateResponse> {
  const uniqueWords = [...new Set(words.map((w) => w.trim().toLowerCase()).filter((w) => w.length > 0))]

  if (uniqueWords.length < 20) {
    throw new BusinessError('至少需要20个不重复的单词')
  }

  const aiSentences = await generateSentencesWithAI(uniqueWords, apiKey)

  const sentences = aiSentences.map(({ word, sentence }) => {
    const { blankSentence, blankIndex } = createBlank(sentence, word)
    return {
      word,
      completeSentence: capitalizeFirstLetter(sentence),
      blankSentence,
      blankIndex,
    }
  })

  return { sentences }
}
