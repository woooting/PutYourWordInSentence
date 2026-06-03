import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { singleGenerateRequestSchema } from '@project/shared'
import { BusinessError } from '../errors/BusinessError'
import { singleGenerateService } from '../services/SingleGenerateService'

/**
 * POST /api/generate/single 处理器：校验单词 → 调用单句生成服务 → 返回统一响应。
 */
export async function singleGenerateController(c: Context) {
  const start = Date.now()
  const body = await c.req.json()
  console.log(`[generate/single] <- POST word: ${body?.word}`)

  const parsed = singleGenerateRequestSchema.safeParse(body)

  if (!parsed.success) {
    console.log(`[generate/single] -> 拒绝: 参数不合法`)
    throw new BusinessError('请求参数格式不合法')
  }

  const { DEEPSEEK_API_KEY } = env(c)
  const result = await singleGenerateService(parsed.data.word, DEEPSEEK_API_KEY)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`[generate/single] -> OK (${elapsed}s)`)
  return c.json({ code: 0, msg: 'ok', data: result })
}
