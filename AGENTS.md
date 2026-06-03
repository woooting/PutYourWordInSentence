## 项目概述

**Sentence Builder** —— 英文遣词造句练习应用。

用户输入一组英文单词，AI 为每个单词生成包含该词的完整句子并将目标词挖空，用户通过拖拽单词到句子空位完成填空练习。

核心流程：输入单词 → AI 生成句子 → 分组展示 → 拖拽填空 → 判对验证 → 翻页/完成 → 错题回顾。

## 技术栈

- **Monorepo**：npm workspaces（shared / backend / frontend）
- **共享层**：TypeScript + Zod（前后端共享类型与校验 schema）
- **前端**：React 19 + Vite 8 + TypeScript 6 + TailwindCSS v4 + shadcn/ui + Zustand 5 + @dnd-kit 6 + Axios
- **后端**：Hono.js 4 (Node.js) + LangChain + DeepSeek API + Prisma + tsx
- **AI**：DeepSeek v4-flash（通过 OpenAI 兼容接口），LangChain 编排调用链

## 沟通规范

在生成思考内容时，必须使用中文。
始终用中文输出内容。
