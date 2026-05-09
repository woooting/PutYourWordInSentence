/**
 * 系统异常，前端收到 code=2，消息固定为"系统繁忙"。
 */
export class SystemError extends Error {
  code = 2 as const

  constructor(message = '系统繁忙') {
    super(message)
    this.name = 'SystemError'
  }
}
