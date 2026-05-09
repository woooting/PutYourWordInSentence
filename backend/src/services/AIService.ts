import { createSentenceChain } from '../lib/Ai/Chain'
import type { AIGeneratedSentence } from '../types'
import { SystemError } from '../errors/SystemError'

const MAX_RETRIES = 2
const BATCH_SIZE = 20
const INVOKE_THRESHOLD = 30

function extractJson(raw: string): string {
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) return codeBlock[1].trim()
  const arrayMatch = raw.match(/\[[\s\S]*\]/)
  if (arrayMatch) return arrayMatch[0]
  return raw.trim()
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sentenceContainsWord(sentence: string, word: string): boolean {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i')
  return regex.test(sentence)
}

function parseAIResponse(raw: string): { word: string; sentence: string }[] {
  const jsonStr = extractJson(raw)
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new SystemError('AI 返回格式异常，无法解析 JSON')
  }
  if (!Array.isArray(parsed)) {
    throw new SystemError('AI 返回格式异常，未返回数组')
  }
  return parsed as { word: string; sentence: string }[]
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

async function callAI(words: string[], apiKey: string): Promise<{ word: string; sentence: string }[]> {
  const chain = createSentenceChain(apiKey)

  if (words.length <= INVOKE_THRESHOLD) {
    const raw = await chain.invoke({ words: words.join(', ') })
    return parseAIResponse(raw)
  }

  const chunks = chunkArray(words, BATCH_SIZE)
  const inputs = chunks.map((chunk) => ({ words: chunk.join(', ') }))
  const rawResults = await chain.batch(inputs)

  const allResults: { word: string; sentence: string }[] = []
  for (const raw of rawResults) {
    allResults.push(...parseAIResponse(raw))
  }
  return allResults
}

export async function generateSentencesWithAI(
  words: string[],
  apiKey: string
): Promise<AIGeneratedSentence[]> {
  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    throw new SystemError('DeepSeek API Key 未配置')
  }

  let pending = [...words]
  const results: AIGeneratedSentence[] = []

  for (let attempt = 0; attempt <= MAX_RETRIES && pending.length > 0; attempt++) {
    try {
      const aiResult = await callAI(pending, apiKey)

      const stillFailed: string[] = []
      for (const word of pending) {
        const match = aiResult.find(
          (item) => item.word?.toLowerCase() === word.toLowerCase()
        )
        if (!match || !sentenceContainsWord(match.sentence, word)) {
          stillFailed.push(word)
        } else {
          results.push({ word, sentence: match.sentence })
        }
      }
      pending = stillFailed
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error
    }
  }

  if (pending.length > 0) {
    throw new SystemError(`部分单词生成失败: ${pending.join(', ')}`)
  }

  return results
}
