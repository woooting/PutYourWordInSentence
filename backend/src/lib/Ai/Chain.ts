// TODO: Phase 2 - implement LangChain chain
// import { ChatOpenAI } from '@langchain/openai'
// import { ChatPromptTemplate } from '@langchain/core/prompts'
// import { StringOutputParser } from '@langchain/core/output_parsers'
// import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './Prompts'
//
// const model = new ChatOpenAI({
//   modelName: 'deepseek-chat',
//   openAIApiKey: process.env.DEEPSEEK_API_KEY,
//   configuration: { baseURL: 'https://api.deepseek.com' },
// })
//
// const prompt = ChatPromptTemplate.fromMessages([
//   ['system', SYSTEM_PROMPT],
//   ['human', USER_PROMPT_TEMPLATE],
// ])
//
// export const sentenceChain = prompt.pipe(model).pipe(new StringOutputParser())
