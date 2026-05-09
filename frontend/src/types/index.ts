import type { SentenceItem } from '@project/shared'

export type { GenerateRequest, GenerateResponse } from '@project/shared'
export type { SentenceItem as Sentence } from '@project/shared'

export type ExercisePhase = 'input' | 'loading' | 'exercising' | 'completed'

export interface Group {
  sentences: SentenceItem[]
  correctWords: string[]
  distractorWords: string[]
}

export interface BlankState {
  placedWord: string | null
  isCorrect: boolean
}

export interface GroupState {
  [blankIndex: number]: BlankState
}

export type DragItemType = 'word-bank' | 'sentence-blank'

export interface DragData {
  type: DragItemType
  word: string
  sourceId: string
}
