# Backend AGENTS.md

## 技术栈
Hono.js · Bun · TypeScript · Zod · Prisma · LangChain

## 三层架构铁律
- 路由层：只定义路径 + 绑定 controller
- 控制器层：Zod 校验入参 + 调 service + 返回统一格式
- 服务层：业务逻辑 + AI 调用 + DB 操作
- 禁止路由层直接调第三方 API 或访问数据库
- 禁止 controller 包含业务逻辑
- 禁止 service 访问 Hono Context（c.req / c.json）

## 目录结构
src/
  routes/           # 路由文件 PascalCase（GenerateRoute.ts）
  controllers/      # 控制器 PascalCase（GenerateController.ts）
  services/         # 服务 PascalCase（GenerateService.ts、AIService.ts）
  schemas/          # 从 @project/shared re-export，禁止在此新增
  types/            # 后端特有类型 PascalCase
  lib/              # 基础设施（Ai/Prompts.ts、Db/Prisma.ts）
  middlewares/      # 中间件（ResponseWrapper.ts、ErrorHandler.ts）
  errors/           # 错误类（BusinessError.ts、SystemError.ts）

## 命名铁律
- 文件名：PascalCase（GenerateController.ts、AIService.ts）
- 变量/函数：camelCase（uniqueWords、generateSentences）
- 类型/接口：PascalCase（GenerateResult）
- 禁止文件名含横线或下划线

## 统一响应格式
所有接口必须返回 { code, msg, data }
  code = 0  成功，data 有值
  code = 1  业务错误（参数非法、单词不足），msg 描述原因
  code = 2  系统异常（AI 超时、DB 断连），msg 固定"系统繁忙"
- 禁止返回格式不一致的 JSON

## 错误处理
- Service 层 throw BusinessError(code=1) 或 SystemError(code=2)
- onError 中间件统一捕获，自动转为 { code, msg, data: null }
- 系统异常写 console.error，业务错误不写日志

## 环境变量
- 使用 Hono env()：import { env } from 'hono/adapter'
- const { DEEPSEEK_API_KEY } = env(c)
- 禁止 process.env 硬读

## 模块化
- 一个功能一个模块，每个模块独占 Route + Controller + Service
- 禁止跨模块 import service
- 公共逻辑（AI 调用、DB 实例）放 lib/

## 导入顺序
1. 第三方 (hono, zod, @langchain/...)
2. @project/shared
3. ../lib/..., ../errors/..., ../middlewares/...
4. ./
   组间空一行

## 禁止清单
- 禁止路由层调 API/DB
- 禁止 controller 含业务逻辑
- 禁止 service 访问 Hono Context
- 禁止 process.env
- 禁止响应格式不统一
- 禁止 any 类型
- 禁止文件名非 PascalCase
- 禁止 import 未使用的依赖
