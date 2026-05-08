export class SystemError extends Error {
  code = 2 as const

  constructor(message = '系统繁忙') {
    super(message)
    this.name = 'SystemError'
  }
}
