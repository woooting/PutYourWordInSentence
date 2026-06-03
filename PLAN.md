# PLAN: 英文遣词造句 - 网页端应用

## 当前状态
- Phase 1 ~ 13 全部完成
- 后端 API 完整：Zod 校验 → AI 批量生成 → 单句重新生成 → 挖空加工
- 前端完整：输入 → 拖拽填空 → 判对 → 翻页 → 错题回顾 + 统计面板
- 深色模式、键盘快捷键、语音朗读 (TTS) 均已实现

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

- [x] 3.1 创建 Zod schema（`backend/src/schemas/generate.ts`）
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
- [x] 3.2 实现 Controller（参数校验 + 去重处理）
  - 校验 words 数量 >= 20
  - 对 words 去重（trim + toLowerCase），如果去重后 < 20 则报错
- [x] 3.3 实现 Service（编排调用）
  - 调用 `aiService.generateSentences(words)`
  - 对返回结果做句子加工（挖空 + 首字母大写规范化）
  - 返回完整响应
- [x] 3.4 添加错误处理
  - AI调用超时（30s）
  - JSON解析失败 → 返回 502
  - 部分单词生成失败 → 返回成功部分 + 失败列表
- [x] 3.5 验证
  - 测试20个单词正常请求
  - 测试19个单词拒绝请求
  - 测试含中文/特殊字符的拒绝

### Phase 4 - 前端核心 UI
**目标**：完整的交互界面

- [x] 4.1 单词输入区（`WordInput.tsx`）
  - Tag 式输入：输入框 + Enter/逗号/空格 添加单词 tag
  - 每个 tag 可点击 × 删除
  - 实时显示已输入单词数量
  - 不足20个时"生成句子"按钮 disabled + 文字提示
  - 自动去重（输入时忽略重复）
- [x] 4.2 句子卡片（`SentenceCard.tsx`）
  - 使用 shadcn `Card` 组件
  - 显示挖空句子，空位处为 `useDroppable` DropZone
  - 已填入单词时，DropZone 显示该单词
  - 正确状态：绿色边框 + 右侧 ✅ icon + 单词不可移除
  - 错误状态：红色边框 + 右侧 ❌ icon + 单词可被新拖入覆盖
  - 未填充状态：虚线边框占位
- [x] 4.3 词库区（`WordBank.tsx`）
  - 显示当前组的10个单词（5正确 + 5干扰，随机排列）
  - 每个单词为 `useDraggable` 元素
  - 使用 shadcn `Badge` 样式
  - 已正确拖入的单词变灰不可拖拽
  - 错误拖入后单词回到词库（或不回，看设计——按需求说单词停留在句子中，所以不回词库但可被覆盖）
- [x] 4.4 翻页组件（`GroupPagination.tsx`）
  - "上一组" / "下一组" 按钮
  - 当前组序号 / 总组数 显示（如 "第 2/4 组"）
  - 当前组未全部正确填写时"下一组"做二次确认提示
  - 最后一组显示"完成"而非"下一组"
- [x] 4.5 重新生成按钮（`RegenerateButton.tsx`）
  - 全局"重新生成所有句子"按钮（shadcn `Button` variant="outline"）
  - 每个 `SentenceCard` 右上角单独的重生成图标按钮

### Phase 5 - 拖拽逻辑 & 状态管理
**目标**：完整的拖拽交互 + 状态流转

- [x] 5.1 安装 @dnd-kit
  - `@dnd-kit/core` + `@dnd-kit/utilities`
  - 根组件包裹 `<DndContext>`
- [x] 5.2 实现 `useExercise` hook（核心状态）
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
- [x] 5.3 实现 `useDragDrop` hook
  - 封装 `onDragStart` / `onDragEnd` / `onDragOver` 事件
  - 正确处理：更新句子状态、标记 word 已用
  - 错误处理：触发震动动画
- [x] 5.4 震动动画 CSS
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
- [x] 5.5 完成状态
  - 当前组所有句子均正确填写后，自动弹出一行提示"本组完成！"
  - 全部组完成 → phase 变为 `completed`，显示总结界面

### Phase 8 - 句子单独换题
**目标**：每个句子卡片支持单独重新生成该句

- [x] 8.1 后端 API：`POST /api/generate/single`
  - 接收单个单词，返回一个包含该单词的新句子
  - 复用现有 AIService 的单句生成逻辑（单次调用，提示词聚焦单个句子质量）
  - 校验返回结果（必须包含目标单词）
- [x] 8.2 前端 SentenceCard 换题按钮
  - 卡片右上角换题按钮（已有 UI，补充 handler）
  - 点击后调用单句生成 API，显示局部 loading
  - 新句子返回后替换当前 slot（重置该卡片的填写状态）
  - 换题后词库区同步更新（当前组正确词不变，干扰词不变）
- [x] 8.3 验证：单句换题后拖拽填空正常，翻页保护不受影响

### Phase 9 - 深色模式
**目标**：支持浅色/深色主题切换

- [x] 9.1 TailwindCSS v4 dark 模式配置
  - Vite 插件配置 `darkMode: 'class'`
  - 在 TailwindCSS 配置中启用 dark 变体
- [x] 9.2 主题变量适配
  - `index.css` 中所有 `@theme` 自定义令牌增加 dark 对应值
  - 奶油风配色 → 深色：背景降低亮度，文字提高亮度，保持可读性
- [x] 9.3 ThemeToggle 组件
  - shadcn 风格切换按钮（sun/moon icon）
  - 使用 `class` 策略在 `<html>` 上切换 `dark` class
  - 状态持久化到 `localStorage`，下次访问自动应用
- [x] 9.4 验证：切换后所有组件（Card、Button、Badge、输入区、词库区、句子卡片）颜色正确，动画正常

### Phase 10 - 学习统计面板
**目标**：每轮练习结束后展示详细学习数据

- [x] 10.1 数据采集（useExerciseStore 扩展）
  - `attempts: Record<string, { correct: number; wrong: number; lastAnswer: string }>` — 每个词的尝试记录
  - `startTime: number` — 本轮开始时间戳（开始拖拽时记录）
  - 已有 `mistakes` 数据可直接复用
- [x] 10.2 MistakeReview 扩展为 StatisticsPanel
  - 顶部统计卡片：总题数、正确率、耗时、薄弱词数量
  - 正确率用环形进度条展示
  - 中间保留原有错题回顾列表
  - 底部新增「薄弱词」卡片（只展示错 ≥2 次的词，点击可加入收藏/重点复习）
- [x] 10.3 Perfect 状态增强
  - 零错题时除原有"Perfect"展示外，补充"用时XX秒"等数据
- [x] 10.4 验证：各组正确率计算准确，计时准确，刷新后数据丢失（符合 MVP 预期）

### Phase 11 - 键盘快捷键
**目标**：拖拽之外支持键盘快速选词填空

- [x] 11.1 快捷键映射设计
  - 数字键 `1`~`0` 对应词库区第 1~10 个单词
  - `Tab` 切换到下一个空位，`Shift+Tab` 切换到上一个
  - `Enter` 确认填入当前选中词到当前高亮空位
  - 已正确锁定的空位自动跳过
- [x] 11.2 键盘导航实现
  - useExerciseStore 新增 `focusedBlankIndex: number | null` 状态
  - 页面级 `onKeyDown` 监听（挂载在 ExercisePhase 容器上）
  - 被选中的 DropZone 显示高亮边框（`ring-2 ring-blue-400`）
  - 选中 DropZone 后按数字键直接填入对应词库位置单词
- [x] 11.3 提示引导
  - 词库区每个单词 Badge 上显示对应数字角标（`1`~`0`）
  - 首次进入练习时展示轻提示"可使用数字键快速选词"
- [x] 11.4 验证：键盘填词判对逻辑与拖拽一致，正确锁定/错误震动均正常，Tab 导航跳过已完成空位

### Phase 12 - 语音朗读 (TTS)
**目标**：每个句子支持朗读发音

- [x] 12.1 Web Speech API 封装
  - 创建 `lib/speech.ts`，封装 `window.speechSynthesis`
  - 支持英语语音（优先 `en-US`，fallback 到任意 `en-*`）
  - 语速 0.9（适中），音高默认
- [x] 12.2 SpeakButton 组件
  - 喇叭图标按钮（shadcn `Button` variant="ghost" size="icon"）
  - 放置在每个 SentenceCard 左侧（标题区）
  - 点击朗读完整句子，朗读中 icon 显示声波动画
  - 朗读结束后自动停止
- [x] 12.3 验证：点击按钮浏览器朗读英文句子，语速适中，切换句子后前一条朗读停止

### Phase 13 - 收尾
**目标**：代码规范、README、全流程验收

- [x] 13.1 前端 TypeScript 类型检查通过
- [x] 13.2 后端 TypeScript 类型检查通过
- [x] 13.3 `.gitignore` 完善（node_modules, .env, dist）
- [x] 13.4 编写简要 README（启动方式 + 环境变量说明）
- [x] 13.5 最终全流程手动测试（含深色模式、键盘操作、TTS、统计面板）

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
| Phase 8 | 单句换题正常、词库同步更新、翻页保护不受影响 |
| Phase 9 | 深色/浅色切换正常、所有组件配色一致、动画正常 |
| Phase 10 | 正确率/耗时/薄弱词统计准确、Perfect 状态增强 |
| Phase 11 | 键盘填词判对正确、Tab 导航正常、角标显示正确 |
| Phase 12 | 朗读发音正常、语速适中、切换句子后前一条停止 |
| Phase 13 | TS检查通过、README 完备、全流程手动测试 |
