import type { Context } from 'hono'
import { env } from 'hono/adapter'
import { generateRequestSchema } from '../schemas/Generate'
import { generateService } from '../services/GenerateService'
import { BusinessError } from '../errors/BusinessError'

export async function generateController(c: Context) {
  const body = await c.req.json()
  const parsed = generateRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw new BusinessError('请求参数格式不合法')
  }

  const { DEEPSEEK_API_KEY } = env(c)
  const result = await generateService(parsed.data.words, DEEPSEEK_API_KEY)
  return c.json({ code: 0, msg: 'ok', data: result })
}
