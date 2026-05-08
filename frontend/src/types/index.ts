export type { GenerateRequest, GenerateResponse } from '@project/shared'

export type { SentenceItem as Sentence } from '@project/shared'

export type ExercisePhase = 'input' | 'loading' | 'exercising' | 'completed'

export interface Group {
  sentences: import('@project/shared').SentenceItem[]
  correctWords: string[]
  distractorWords: string[]
}

export interface GroupResult {
  [sentenceIndex: number]: {
    placedWord: string | null
    isCorrect: boolean
  }
}

export type DragItemType = 'word-bank' | 'sentence-blank'

export interface DragData {
  type: DragItemType
  word: string
  sourceId: string
}
