import { generateResponseSchema, singleGenerateResponseSchema } from '@project/shared'
import type { GenerateResponse, SingleGenerateResponse } from '@project/shared'
import { http } from './http'

/** 健康检查，验证后端连通性 */
export async function fetchHealth(): Promise<{ timestamp: string }> {
  const { data } = await http.get('/health')
  return data as { timestamp: string }
}

/** 提交单词列表调用 AI 生成句子，返回前用 Zod 校验响应结构 */
export async function generateSentences(words: string[]): Promise<GenerateResponse> {
  const { data } = await http.post('/generate', { words })
  return generateResponseSchema.parse(data)
}

/** 为单个单词重新生成句子 */
export async function regenerateSentence(word: string): Promise<SingleGenerateResponse> {
  const { data } = await http.post('/generate/single', { word })
  return singleGenerateResponseSchema.parse(data)
}
