import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { generateRequestSchema } from '../schemas/Generate'
import { generateService } from '../services/GenerateService'
import { BusinessError } from '../errors/BusinessError'

/**
 * POST /api/generate 处理器：校验入参 → 去重 → 调用生成服务 → 返回统一响应。
 */
export async function generateController(c: Context) {
  const start = Date.now()
  const body = await c.req.json()
  const wordCount = Array.isArray(body?.words) ? body.words.length : 0
  console.log(`[generate] <- POST ${wordCount} words`)

  const parsed = generateRequestSchema.safeParse(body)

  if (!parsed.success) {
    console.log(`[generate] -> 拒绝: 参数不合法`)
    throw new BusinessError('请求参数格式不合法')
  }

  const uniqueWords = [...new Set(
    parsed.data.words.map((w: string) => w.trim().toLowerCase())
  )]

  if (uniqueWords.length < 20) {
    console.log(`[generate] -> 拒绝: 去重后仅 ${uniqueWords.length} 个单词`)
    throw new BusinessError('去重后单词不足20个，请补充')
  }

  const { DEEPSEEK_API_KEY } = env(c)
  const result = await generateService(uniqueWords, DEEPSEEK_API_KEY)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`[generate] -> OK ${result.sentences.length}句 成功, ${result.failed.length}句 失败 (${elapsed}s)`)
  return c.json({ code: 0, msg: 'ok', data: result })
}
