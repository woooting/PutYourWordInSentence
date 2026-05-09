import type { ErrorHandler } from 'hono'
import { BusinessError } from '../errors/BusinessError'
import { SystemError } from '../errors/SystemError'

/**
 * 全局错误处理中间件：将 BusinessError/SystemError/未处理异常统一转为固定响应格式。
 */
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof BusinessError) {
    return c.json({ code: 1, msg: err.message, data: null })
  }

  if (err instanceof SystemError) {
    console.error('[SystemError]', err.message, err.stack)
    return c.json({ code: 2, msg: err.message, data: null })
  }

  console.error('[UnhandledError]', err.message, err.stack)
  return c.json({ code: 2, msg: '系统繁忙', data: null })
}
