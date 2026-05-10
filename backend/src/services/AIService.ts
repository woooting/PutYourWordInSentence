import { createSentenceChain } from '../lib/Ai/Chain'
import type { AIGeneratedSentence } from '../types'
import { SystemError } from '../errors/SystemError'

const MAX_RETRIES = 2
const BATCH_SIZE = 20
const INVOKE_THRESHOLD = 30

/**
 * 从 AI 原始回复中提取 JSON 字符串。
 * 兼容 AI 返回 markdown 代码块、裸数组、或夹杂额外文字的情况。
 */
function extractJson(raw: string): string {
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) return codeBlock[1].trim()
  const arrayMatch = raw.match(/\[[\s\S]*\]/)
  if (arrayMatch) return arrayMatch[0]
  return raw.trim()
}

/**
 * 转义字符串中的正则特殊字符，使其作为普通字面参与正则匹配。
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 检查句子中是否包含目标单词（整词匹配，大小写不敏感）。
 */
function sentenceContainsWord(sentence: string, word: string): boolean {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i')
  return regex.test(sentence)
}

/**
 * 解析 AI 返回的原始字符串为句子数组，校验 JSON 结构合法性。
 */
function parseAIResponse(raw: string): AIGeneratedSentence[] {
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
  for (const item of parsed) {
    if (!item.word || !item.sentence || !item.chinese) {
      throw new SystemError('AI 返回格式异常，缺少必填字段')
    }
  }
  return parsed as AIGeneratedSentence[]
}

/**
 * 将数组按指定大小切分为若干子数组。
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * 调用 AI 为给定单词生成句子。单词数 ≤30 时单次 invoke，>30 时按每批20词并行 batch。
 */
async function callAI(words: string[], apiKey: string): Promise<AIGeneratedSentence[]> {
  const chain = createSentenceChain(apiKey)

  if (words.length <= INVOKE_THRESHOLD) {
    const raw = await chain.invoke({ words: words.join(', ') })
    return parseAIResponse(raw)
  }

  const chunks = chunkArray(words, BATCH_SIZE)
  const inputs = chunks.map((chunk) => ({ words: chunk.join(', ') }))
  const rawResults = await chain.batch(inputs)

  const allResults: AIGeneratedSentence[] = []
  for (const raw of rawResults) {
    allResults.push(...parseAIResponse(raw))
  }
  return allResults
}

/**
 * 为一批单词生成句子，失败单词自动重试（最多2次）。返回成功和失败的单词列表。
 */
export async function generateSentencesWithAI(
  words: string[],
  apiKey: string
): Promise<{ success: AIGeneratedSentence[]; failed: { word: string; reason: string }[] }> {
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
          results.push({ word, sentence: match.sentence, chinese: match.chinese })
        }
      }
      pending = stillFailed
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error
    }
  }

  return {
    success: results,
    failed: pending.map((word) => ({ word, reason: 'AI 生成句子失败或句子不包含目标单词' })),
  }
}
