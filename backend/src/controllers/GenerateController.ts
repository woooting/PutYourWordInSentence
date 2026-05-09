import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { generateRequestSchema } from '../schemas/Generate'
import { generateService } from '../services/GenerateService'
import { BusinessError } from '../errors/BusinessError'

/**
 * POST /api/generate 处理器：校验入参 → 去重 → 调用生成服务 → 返回统一响应。
 */
export async function generateController(c: Context) {
  const body = await c.req.json()
  const parsed = generateRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw new BusinessError('请求参数格式不合法')
  }

  const uniqueWords = [...new Set(
    parsed.data.words.map((w: string) => w.trim().toLowerCase())
  )]

  if (uniqueWords.length < 20) {
    throw new BusinessError('去重后单词不足20个，请补充')
  }

  const { DEEPSEEK_API_KEY } = env(c)
  const result = await generateService(uniqueWords, DEEPSEEK_API_KEY)
  return c.json({ code: 0, msg: 'ok', data: result })
}
