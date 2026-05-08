# BACKEND_FIX.md — 后端架构修复

## 修复清单

### 1. 文件改名 PascalCase
```
routes/generate.ts                   → routes/GenerateRoute.ts
controllers/generateController.ts    → controllers/GenerateController.ts
services/generateService.ts          → services/GenerateService.ts
services/aiService.ts                → services/AIService.ts
lib/ai/prompts.ts                    → lib/Ai/Prompts.ts
lib/ai/chain.ts                      → lib/Ai/Chain.ts
lib/db/prisma.ts                     → lib/Db/Prisma.ts
schemas/generate.ts                  → schemas/Generate.ts
```

### 2. 新增文件
```
errors/BusinessError.ts        # class BusinessError extends Error { code = 1 }
errors/SystemError.ts          # class SystemError extends Error { code = 2 }
middlewares/ResponseWrapper.ts # Hono middleware: 包装响应为 {code,msg,data}
middlewares/ErrorHandler.ts    # Hono onError: 捕获 BusinessError/SystemError
```

### 3. 统一响应格式
- 成功: { code: 0, msg: "ok", data: T }
- 业务错误: { code: 1, msg: "描述", data: null }
- 系统异常: { code: 2, msg: "系统繁忙", data: null }

### 4. 环境变量修复
- index.ts 中 process.env.PORT → 通过 Hono env() 或 import.meta.env
- .env 补全 DEEPSEEK_API_KEY、DATABASE_URL、PORT 常量

### 5. 错误处理修复
- GenerateController.ts 去掉 try/catch
- GenerateService.ts throw BusinessError 替代 throw Error
- onError 中间件统一捕获所有异常

### 6. Health check 格式统一
- GET /api/health 返回 { code: 0, msg: "ok", data: { timestamp } }
