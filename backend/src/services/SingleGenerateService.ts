import type { SingleGenerateResponse } from '@project/shared'
import { generateSentencesWithAI } from './AIService'
import { SystemError } from '../errors/SystemError'

/**
 * 将句子首字母大写。
 */
function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 转义字符串中的正则特殊字符。
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 为单个单词生成新句子并完成挖空加工。
 */
export async function singleGenerateService(
  word: string,
  apiKey: string
): Promise<SingleGenerateResponse> {
  const { success, failed } = await generateSentencesWithAI([word], apiKey)

  if (success.length === 0) {
    const reason = failed[0]?.reason ?? 'AI 生成失败'
    throw new SystemError(reason)
  }

  const result = success[0]
  const lowerWord = word.toLowerCase()

  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i')
  const tokens = result.sentence.split(/\s+/)
  let blankIndex = 0

  for (let i = 0; i < tokens.length; i++) {
    const cleanToken = tokens[i].replace(/[^\w]/g, '')
    if (cleanToken.toLowerCase() === lowerWord) {
      tokens[i] = '________'
      blankIndex = i
      const blankSentence = capitalizeFirstLetter(tokens.join(' '))
      return {
        sentence: {
          word,
          completeSentence: capitalizeFirstLetter(result.sentence),
          blankSentence,
          blankIndex,
          chinese: result.chinese,
        },
      }
    }
  }

  const match = result.sentence.match(regex)
  if (match) {
    const beforeTokens = result.sentence.substring(0, match.index!).trimEnd().split(/\s+/)
    blankIndex = beforeTokens.length - (result.sentence.substring(0, match.index!).endsWith(' ') ? 0 : 1)
    const blankSentence = capitalizeFirstLetter(result.sentence.replace(regex, '________'))
    return {
      sentence: {
        word,
        completeSentence: capitalizeFirstLetter(result.sentence),
        blankSentence,
        blankIndex,
        chinese: result.chinese,
      },
    }
  }

  throw new SystemError('生成的句子不包含目标单词')
}
