# PLAN: 英文遣词造句 - 网页端应用

## 当前状态
- Phase 1 & 2 已完成
- AI 提示词 & LangChain 集成已就绪
- 后端 API 可接收请求并调用 DeepSeek 生成句子

---

## 一、需求确认汇总

| 项目 | 决定 |
|------|------|
| 最少输入单词数 | **20个**，不足弹出提示 |
| 挖空策略 | **每个单词对应1个句子，每个句子仅挖1个空** |
| 词库区单词数 | 每组**10个**（5个正确 + 5个干扰项） |
| 组间导航 | **翻页式**（上/下一组按钮） |
| 数据持久化 | **仅内存/会话**，刷新丢失，MVP不接DB |
| 运行时 | Node.js (tsx) + npm(包管理) |

### 核心交互流程
```
用户输入 >=20 个单词 → 调用 DeepSeek API 生成句子 → 
按5句/组分页 → 每组上方展示10个词库单词（5正确+5干扰）→ 
用户拖拽单词到句子空位 → 正确显示✅、错误显示❌并触发震动动画 → 
翻页完成下一组 → 支持整体重新生成
```

---

## 二、你未提及但需注意的点

1. **单词输入UI**：建议 tag 式输入，支持逗号/空格/回车分隔，可逐个删除 tag，应有去重逻辑
2. **AI 响应时间**：20+单词生成可能需要 15-30 秒，需要 loading 动画（建议逐条流式展示）
3. **AI 输出容错**：AI 可能返回格式错误、某单词无法造句、句子不含该单词等情况，需要后端正则校验 + 单句重试
4. **DeepSeek API Key**：通过 `.env` 注入，绝不暴露到前端
5. **句子级别重新生成**：除了全局重生成，建议每个句子卡片提供单独的重生成按钮
6. **干扰词选取策略**：从其他组的单词中随机抽取，避免与当前组正确词重复
7. **已完成组的保护**：翻页后已填写正确的组应保留答案不可修改，错误答案可重新拖拽
8. **移动端拖拽**：`@dnd-kit` 已支持 touch，但需注意词库区和句子区的滚动冲突
9. **Rate Limiting**：后端对生成接口做简单的频率限制（基于 IP）
10. **CORS**：前后端分离部署时 Hono 需配置 cors 中间件
11. **Hono.js 在 Bun 上的运行方式**：`bun run src/index.ts` 原生支持 TS，无需额外构建

---

## 三、技术架构

```
┌──────────────────────────────────────────────────┐
│                    Frontend                        │
│  React 18 + Vite + TailwindCSS + shadcn/ui        │
│  @dnd-kit/core (拖拽)                              │
│  状态: useState + useReducer                       │
└──────────────────────┬───────────────────────────┘
                       │ POST /api/generate
                       ▼
┌──────────────────────────────────────────────────┐
│                    Backend                         │
│  Hono.js (Bun 运行时)                              │
│  ┌──────────┐  ┌────────────┐  ┌───────────────┐ │
│  │ Routes   │→│Controllers │→│   Services     │ │
│  │ (路由)   │  │ (参数校验) │  │ (业务+AI+DB)  │ │
│  └──────────┘  └────────────┘  └───────┬───────┘ │
│                                         │          │
│                            ┌────────────┴───────┐ │
│                            │  LangChain/LangGraph│ │
│                            │  (DeepSeek API)     │ │
│                            └────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 后端三层职责

| 层 | 职责 |
|----|------|
| **Routes** | 定义路由路径、HTTP方法，绑定 Controller |
| **Controllers** | Zod 参数校验、请求/响应格式化、调用 Service |
| **Services** | 核心业务逻辑、AI 调用、句子加工（挖空） |

---

## 四、项目目录结构

```
Put the word in sentence/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui 组件
│   │   │   ├── WordInput.tsx          # 单词输入区（tag编辑器）
│   │   │   ├── WordBank.tsx           # 上方词库区（可拖拽单词）
│   │   │   ├── SentenceCard.tsx       # 句子卡片（含挖空DropZone）
│   │   │   ├── SentenceList.tsx       # 当前组5个句子的容器
│   │   │   ├── GroupPagination.tsx    # 上/下一组 + 页码
│   │   │   ├── RegenerateButton.tsx   # 重新生成按钮
│   │   │   └── LoadingOverlay.tsx     # 生成中loading
│   │   ├── hooks/
│   │   │   ├── useExercise.ts         # 核心练习状态管理
│   │   │   └── useDragDrop.ts         # 拖拽逻辑封装
│   │   ├── lib/
│   │   │   ├── api.ts                 # fetch 封装
│   │   │   └── utils.ts              # 工具函数
│   │   ├── types/
│   │   │   └── index.ts              # 前端类型定义
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                 # Tailwind + shake动画
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── generate.ts           # POST /api/generate
│   │   ├── controllers/
│   │   │   └── generateController.ts # Zod校验 + 响应格式化
│   │   ├── services/
│   │   │   ├── generateService.ts    # 句子生成编排
│   │   │   └── aiService.ts          # LangChain/LangGraph 调用
│   │   ├── schemas/
│   │   │   └── generate.ts           # Zod schema
│   │   ├── lib/
│   │   │   ├── ai/
│   │   │   │   ├── prompts.ts        # 系统提示词 + 用户提示词模板
│   │   │   │   └── chain.ts          # LangChain chain 定义
│   │   │   └── db/
│   │   │       └── prisma.ts         # Prisma client 单例
│   │   ├── types/
│   │   │   └── index.ts             # 共享类型
│   │   └── index.ts                  # Hono app 入口
│   ├── prisma/
│   │   └── schema.prisma            # 预留DB schema
│   ├── package.json
│   └── tsconfig.json
│
├── .env                              # DEEPSEEK_API_KEY + DATABASE_URL
├── .gitignore
└── PLAN.md                           # 本文档
```

---

## 五、分步实现计划

### Phase 1 - 项目脚手架搭建
**目标**：前后端项目可启动，基础联通

- [x] 1.1 初始化后端项目
  - 创建 `backend/`，`npm init`，安装依赖：`hono`, `@hono/node-server`, `zod`, `prisma`, `@prisma/client`
  - 配置 `tsconfig.json` (target: ESNext, module: ESNext, strict)
  - 创建 Hono 入口 `src/index.ts`，CORS 中间件，监听 3001 端口
  - 创建健康检查路由 `GET /api/health`
  - 配置 `.env` 读取
- [x] 1.2 初始化前端项目
  - `npm create vite@latest frontend -- --template react-ts`
  - 安装依赖：`tailwindcss`, `@tailwindcss/vite`, `@dnd-kit/core`, `@dnd-kit/utilities`
  - 安装 `shadcn/ui` 并初始化（根据 shadcn 最新文档）
  - 添加 shadcn 组件：`button`, `card`, `input`, `badge`
  - 配置 Tailwind + postcss
  - 创建基础 `App.tsx`，验证能调用后端 `/api/health`
- [x] 1.3 配置 vite proxy
  - `vite.config.ts` 中配置 proxy：`/api` → `http://localhost:3001`
- [x] 1.4 验证
  - 启动前后端，前端页面能成功请求后端 health 接口并显示返回结果

### Phase 2 - AI 提示词 & LangChain 集成
**目标**：设计并验证提示词，AI 能稳定返回可用句子

- [x] 2.1 设计系统提示词（`backend/src/lib/ai/prompts.ts`）
  ```
  你需要扮演一个有10年经验的英语外教。
  目标用户是中国英语学习者（B1-B2水平）。
  
  规则：
  1. 接收一组英文单词，为每个单词生成一个包含该单词的自然英文句子
  2. 句子必须来自真实生活场景（职场、社交、旅行、学习、购物、健康等）
  3. 句子长度15-25词，中级难度，不能过于简单
  4. 句子必须语法正确，母语者读起来自然
  5. 每个句子中，目标单词仅出现一次
  6. 多样化场景，避免所有句子都是同一个主题
  
  输出格式：严格返回JSON数组，每个元素格式：
  {"word": "原单词", "sentence": "包含该单词的完整句子"}
  只返回JSON，不要任何额外文字。
  ```
- [x] 2.2 安装 LangChain 依赖
  - `@langchain/core`, `@langchain/openai`（DeepSeek 兼容 OpenAI 格式）
- [x] 2.3 实现 `aiService.ts`
  - 使用 `ChatOpenAI` 指向 DeepSeek API endpoint (`https://api.deepseek.com`)
  - 使用 `ChatPromptTemplate` + `StringOutputParser`
  - 将响应 JSON.parse，用 Zod 校验结构
  - 校验后处理：正则确认每个句子确实包含对应单词（不区分大小写）
  - 失败单词自动重试（最多2次）
- [x] 2.4 实现句子挖空加工
  - 在 `generateService.ts` 中，将每句中的目标单词（首次出现）替换为 `________`
  - 记录挖空位置索引，返回给前端
- [x] 2.5 验证
  - 用 Postman/curl 测试 `POST /api/generate`，传入20个单词，检查返回结构和质量

### Phase 3 - 后端 API 完成
**目标**：完整的 POST /api/generate 接口

- [ ] 3.1 创建 Zod schema（`backend/src/schemas/generate.ts`）
  ```ts
  // 请求
  { words: string[] }  // min:20, max:100, 每个word: 1-30字符, 纯英文字母
  
  // 响应
  {
    sentences: {
      word: string;              // 原单词
      completeSentence: string;  // 完整句子
      blankSentence: string;     // 挖空后句子
      blankIndex: number;        // 空位在句子中的单词序号(0-based)
    }[];
  }
  ```
- [ ] 3.2 实现 Controller（参数校验 + 去重处理）
  - 校验 words 数量 >= 20
  - 对 words 去重（trim + toLowerCase），如果去重后 < 20 则报错
- [ ] 3.3 实现 Service（编排调用）
  - 调用 `aiService.generateSentences(words)`
  - 对返回结果做句子加工（挖空 + 首字母大写规范化）
  - 返回完整响应
- [ ] 3.4 添加错误处理
  - AI调用超时（30s）
  - JSON解析失败 → 返回 502
  - 部分单词生成失败 → 返回成功部分 + 失败列表
- [ ] 3.5 验证
  - 测试20个单词正常请求
  - 测试19个单词拒绝请求
  - 测试含中文/特殊字符的拒绝

### Phase 4 - 前端核心 UI
**目标**：完整的交互界面

- [ ] 4.1 单词输入区（`WordInput.tsx`）
  - Tag 式输入：输入框 + Enter/逗号/空格 添加单词 tag
  - 每个 tag 可点击 × 删除
  - 实时显示已输入单词数量
  - 不足20个时"生成句子"按钮 disabled + 文字提示
  - 自动去重（输入时忽略重复）
- [ ] 4.2 句子卡片（`SentenceCard.tsx`）
  - 使用 shadcn `Card` 组件
  - 显示挖空句子，空位处为 `useDroppable` DropZone
  - 已填入单词时，DropZone 显示该单词
  - 正确状态：绿色边框 + 右侧 ✅ icon + 单词不可移除
  - 错误状态：红色边框 + 右侧 ❌ icon + 单词可被新拖入覆盖
  - 未填充状态：虚线边框占位
- [ ] 4.3 词库区（`WordBank.tsx`）
  - 显示当前组的10个单词（5正确 + 5干扰，随机排列）
  - 每个单词为 `useDraggable` 元素
  - 使用 shadcn `Badge` 样式
  - 已正确拖入的单词变灰不可拖拽
  - 错误拖入后单词回到词库（或不回，看设计——按需求说单词停留在句子中，所以不回词库但可被覆盖）
- [ ] 4.4 翻页组件（`GroupPagination.tsx`）
  - "上一组" / "下一组" 按钮
  - 当前组序号 / 总组数 显示（如 "第 2/4 组"）
  - 当前组未全部正确填写时"下一组"做二次确认提示
  - 最后一组显示"完成"而非"下一组"
- [ ] 4.5 重新生成按钮（`RegenerateButton.tsx`）
  - 全局"重新生成所有句子"按钮（shadcn `Button` variant="outline"）
  - 每个 `SentenceCard` 右上角单独的重生成图标按钮

### Phase 5 - 拖拽逻辑 & 状态管理
**目标**：完整的拖拽交互 + 状态流转

- [ ] 5.1 安装 @dnd-kit
  - `@dnd-kit/core` + `@dnd-kit/utilities`
  - 根组件包裹 `<DndContext>`
- [ ] 5.2 实现 `useExercise` hook（核心状态）
  ```ts
  interface ExerciseState {
    phase: 'input' | 'loading' | 'exercising' | 'completed';
    allSentences: Sentence[];           // 全部生成的句子
    currentGroup: number;               // 当前组索引 (0-based)
    groups: Group[];                    // 预分组好的数据
    groupResults: Record<string, boolean>; // 每组的填写结果
  }
  ```
  - 分组逻辑：输入时按5个一组切割
  - 词库生成逻辑：当前组5个正确词 + 从其他组随机抽5个干扰词
  - 判对逻辑：拖入单词 === 该空位的正确单词时标记正确
- [ ] 5.3 实现 `useDragDrop` hook
  - 封装 `onDragStart` / `onDragEnd` / `onDragOver` 事件
  - 正确处理：更新句子状态、标记 word 已用
  - 错误处理：触发震动动画
- [ ] 5.4 震动动画 CSS
  ```css
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .animate-shake {
    animation: shake 0.4s ease-in-out;
  }
  ```
- [ ] 5.5 完成状态
  - 当前组所有句子均正确填写后，自动弹出一行提示"本组完成！"
  - 全部组完成 → phase 变为 `completed`，显示总结界面

### Phase 6 - 联调 & 边界处理
**目标**：前后端联调通过，处理边界情况

- [ ] 6.1 Loading 状态
  - 调用生成 API 时显示 LoadingOverlay
  - 建议：模拟逐条展示动画（即使一次性返回，前端延时渲染也有好的体验）
- [ ] 6.2 错误提示
  - 网络错误 → toast 提示 "网络异常，请重试"
  - AI 返回异常 → toast 提示 "AI生成失败，请稍后重试"
  - 使用 shadcn `sonner` (toast) 组件
- [ ] 6.3 已正确句子保护
  - 翻页后返回，正确填充的句子保持绿色锁定状态
- [ ] 6.4 响应式适配
  - 桌面端为主要目标，移动端做基本适配
  - 词库区在小屏幕改为横向滚动

### Phase 7 - 收尾
**目标**：代码规范、README

- [ ] 7.1 前端 TypeScript 类型检查通过
- [ ] 7.2 后端 TypeScript 类型检查通过
- [ ] 7.3 添加 `.gitignore`（node_modules, .env, dist）
- [ ] 7.4 编写简要 README（启动方式 + 环境变量说明）
- [ ] 7.5 最终手动全流程测试

---

## 六、关键设计决策说明

### 为什么词库放10个而非5个
每组5个句子5个空，若词库只放5个词，则用户仅做简单一一对应。放入10个（5正确 + 5干扰）可增加辨析难度，提升学习效果。

### 为什么后端做挖空
AI 直接返回挖空后的句子不可靠（可能挖错词、格式不一致）。后端拿到完整句子后，精确匹配目标单词位置做替换，100%准确。

### 为什么不用数据库持久化
MVP 阶段的核心价值在于 AI 生成 + 拖拽练习，无用户系统、无历史记录需求。加DB会增加部署复杂度（需PostgreSQL实例）。Prisma schema 保留以备后续扩展。

### 关于 LangGraph
当前实现中 LangChain chain 已能满足需求（prompt → model → parse）。若后续需要多步 AI 工作流（如：生成 → 质检 → 重生成不合格项），可引入 LangGraph 做状态图编排。MVP 阶段先预留但不强制使用。

---

## 七、验证清单

| 阶段 | 验证项 |
|------|--------|
| Phase 1 | 前后端启动、health 接口通、proxy 生效 |
| Phase 2 | AI prompt 返回质量、JSON 解析成功、挖空正确 |
| Phase 3 | 20词正常返回、19词被拒、特殊字符被拒、超时处理 |
| Phase 4 | 输入区功能完整、卡片渲染正确、翻页正常 |
| Phase 5 | 拖拽正确匹配✅、拖拽错误❌+震动、完成后锁定 |
| Phase 6 | Loading动画、错误toast、翻回保护、移动端基本可用 |
| Phase 7 | TS检查通过、全流程手动测试 |
