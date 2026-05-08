import { z } from 'zod'

export const generateRequestSchema = z.object({
  words: z
    .array(
      z.string().min(1, 'Word cannot be empty').max(30, 'Word too long')
    )
    .min(20, 'At least 20 words required')
    .max(100, 'Maximum 100 words allowed'),
})

export const sentenceItemSchema = z.object({
  word: z.string(),
  completeSentence: z.string(),
  blankSentence: z.string(),
  blankIndex: z.number().int().nonnegative(),
})

export const generateResponseSchema = z.object({
  sentences: z.array(sentenceItemSchema),
})

export type GenerateRequest = z.infer<typeof generateRequestSchema>
export type GenerateResponse = z.infer<typeof generateResponseSchema>
export type SentenceItem = z.infer<typeof sentenceItemSchema>
