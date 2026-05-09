import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './Prompts'

/**
 * 创建 LangChain 链：ChatPromptTemplate → ChatOpenAI(DeepSeek) → StringOutputParser。
 */
export function createSentenceChain(apiKey: string) {
  const model = new ChatOpenAI({
    model: 'deepseek-v4-flash',
    apiKey: apiKey,
    configuration: {
      baseURL: 'https://api.deepseek.com',
    },
    temperature: 0.7,
    timeout: 30000,
  })

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    ['user', USER_PROMPT_TEMPLATE],
  ])

  return prompt.pipe(model).pipe(new StringOutputParser())
}
