import type { Context } from 'hono'
import { generateRequestSchema } from '../schemas/Generate'
import { generateService } from '../services/GenerateService'
import { BusinessError } from '../errors/BusinessError'

export async function generateController(c: Context) {
  const body = await c.req.json()
  const parsed = generateRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw new BusinessError('请求参数格式不合法')
  }

  const result = await generateService(parsed.data.words)
  return c.json({ code: 0, msg: 'ok', data: result })
}
