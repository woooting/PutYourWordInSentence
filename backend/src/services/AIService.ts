// TODO: Phase 2 - integrate LangChain + DeepSeek API
// import { ChatOpenAI } from '@langchain/openai'
// import { ChatPromptTemplate } from '@langchain/core/prompts'
// import { StringOutputParser } from '@langchain/core/output_parsers'
// import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from '../lib/Ai/Prompts'

export async function generateSentencesWithAI(words: string[]) {
  return words.map((word) => ({
    word,
    sentence: `This is a placeholder sentence with the word "${word}".`,
  }))
}
