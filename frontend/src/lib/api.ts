import { generateResponseSchema } from '@project/shared'
import type { GenerateResponse } from '@project/shared'
import { http } from './http'

export async function fetchHealth(): Promise<{ timestamp: string }> {
  const { data } = await http.get('/health')
  return data as { timestamp: string }
}

export async function generateSentences(words: string[]): Promise<GenerateResponse> {
  const { data } = await http.post('/generate', { words })
  return generateResponseSchema.parse(data)
}
