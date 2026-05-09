/**
 * 业务异常，前端收到 code=1 及对应的错误消息。
 */
export class BusinessError extends Error {
  code = 1 as const

  constructor(message: string) {
    super(message)
    this.name = 'BusinessError'
  }
}
