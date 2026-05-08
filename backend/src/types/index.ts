import type { SentenceItem } from '@project/shared'

export type { GenerateRequest, GenerateResponse, SentenceItem } from '@project/shared'

export type { BusinessError } from '../errors/BusinessError'
export type { SystemError } from '../errors/SystemError'

export interface AIGeneratedSentence {
  word: string
  sentence: string
}

export interface BlankResult {
  word: string
  completeSentence: string
  blankSentence: string
  blankIndex: number
}

export interface GenerateError {
  word: string
  reason: string
}

export interface GenerateResult {
  success: BlankResult[]
  failed: GenerateError[]
}
