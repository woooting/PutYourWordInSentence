export class BusinessError extends Error {
  code = 1 as const

  constructor(message: string) {
    super(message)
    this.name = 'BusinessError'
  }
}
