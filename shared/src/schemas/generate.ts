import { z } from 'zod'

export const generateRequestSchema = z.object({
  words: z
    .array(
      z.string()
        .min(1, 'Word cannot be empty')
        .max(30, 'Word too long')
        .regex(/^[a-zA-Z]+$/, 'Only English letters allowed')
    )
    .min(20, 'At least 20 words required')
    .max(100, 'Maximum 100 words allowed'),
})

export const sentenceItemSchema = z.object({
  word: z.string(),
  completeSentence: z.string(),
  blankSentence: z.string(),
  blankIndex: z.number().int().nonnegative(),
  chinese: z.string(),
})

export const failedItemSchema = z.object({
  word: z.string(),
  reason: z.string(),
})

export const generateResponseSchema = z.object({
  sentences: z.array(sentenceItemSchema),
  failed: z.array(failedItemSchema),
})

export type GenerateRequest = z.infer<typeof generateRequestSchema>
export type GenerateResponse = z.infer<typeof generateResponseSchema>
export type SentenceItem = z.infer<typeof sentenceItemSchema>
export type FailedItem = z.infer<typeof failedItemSchema>
