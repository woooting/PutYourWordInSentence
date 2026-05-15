# Frontend AGENTS.md

## 技术栈
React 19 · Vite 8 · TypeScript 6 · TailwindCSS v4 · shadcn/ui · Zustand · @dnd-kit · Axios

## 目录约定
src/
  components/        # 组件 PascalCase（SentenceCard.tsx）
    ui/              # shadcn 组件，禁止手动修改
  hooks/             # Hook camelCase（useExercise.ts）
  stores/            # Store camelCase（useExerciseStore.ts）
  lib/               # 工具 camelCase（api.ts、cn.ts、utils.ts）
  types/             # 类型 index.ts

## 命名铁律
- 组件文件名：PascalCase（SentenceCard.tsx）
- Hook/Store/工具文件名：camelCase（useExercise.ts、api.ts）
- 变量/函数名：camelCase（inputWords、handleDragEnd）
- 类型/接口名：PascalCase（ExercisePhase、DragData）
- 禁止 default export（组件使用 named export）
- 禁止文件名含横线或下划线

## 类型铁律
1. API 边界类型从 @project/shared 导入，禁止在前端重复定义
2. 前端特有类型（ExercisePhase、DragData、GroupResult）写在 types/
3. 纯类型用 import type，禁止 import 带运行时代码的类型文件

## Zustand Store（stores/useExerciseStore.ts）
- 单 store，禁止拆分
- 导出 selector 供组件订阅，禁止组件直接访问 store.getState()
- action 只做纯数据更新，禁止在 action 内调 API

  状态字段：
    phase       : 'input' | 'loading' | 'exercising' | 'completed'
    inputWords  : string[]
    sentences   : SentenceItem[]          // 从 API 获取的完整列表
    currentGroup: number
    groupStates : Record<number, {         // currentGroup → 填写状态
      [blankIdx: number]: { placedWord: string | null, isCorrect: boolean }
    }>
    getWordBank  : () => string[]         // 派生：当前组10个词(5正确+5干扰)

## 组件铁律
- 函数组件 + TypeScript，禁止 class 组件、禁止 default export
- 单向数据流，禁止子组件直接写父级/Zustand 以外的方式跨组件通信
- 组件 ≤200 行，超过拆子组件
- 事件处理函数用 useCallback，计算值用 useMemo，避免 render 内 new object

## 拖拽交互规范
- WordBank 中的单词 → 拖到 → SentenceCard 的 DropZone
- 正确：锁定该 DropZone（绿色+✅），该单词从可用词库扣除，禁止再拖
- 错误：单词留在 DropZone（红色+❌+震动），仍可拖到其他空位，词库位置留空
- DndContext 单层包裹 ExerciseContainer，禁止嵌套
- onDragEnd 中调 store action 更新 groupStates

## 样式规范
- 优先 shadcn/ui 组件（Button、Card、Badge、Input）
- 项目特有样式用 @utility 定义在 index.css：
    .drop-zone          // 虚线边框 + cursor-grab
    .drop-zone-correct  // border-green-500 + bg-green-50
    .drop-zone-incorrect// border-red-500 + bg-red-50
    .animate-shake      // 已定义
- className 拼接用 cn()，禁止 template literal + 条件判断
- 禁止内联 style、禁止 CSS Module

## API 调用规范（lib/api.ts）
- Axios 实例，baseURL = ''（Vite proxy 转发 /api → localhost:3001）
- 每个接口封装为函数，返回前用 @project/shared 的 Zod schema 校验：

    async function generateSentences(words: string[]) {
      const { data } = await apiClient.post('/api/generate', { words })
      return generateResponseSchema.parse(data)
    }

- 错误在调用方 try/catch 处理，禁止在 api 层弹 toast

## 注释规范
- 所有函数必须添加 JSDoc 注释，简要描述函数作用
- 函数入参和返回值类型由 TypeScript 类型标注，JSDoc 无需重复 `@param` / `@returns`
- 以下函数无需 JSDoc：
  - handleXxx 事件处理函数
  - store 的简单 selector（usePhase、useSentences 等，函数体仅一行取值）
  - store 的简单 action 包装函数（setXxx、toggleXxx 等，仅调用 set）
- 工具函数、业务逻辑函数、组件、复杂 hook 必须写 JSDoc

## 导入顺序
1. 第三方库 (react, zustand, @dnd-kit, axios)
2. @project/shared
3. @/ 别名 (components, lib, stores)
4. 相对路径 ./
   组间空一行

## 禁止清单
- 禁止 render 中创建对象/函数（不用 useCallback/useMemo 的情况）
- 禁止超过 3 层三元表达式
- 禁止直接改 store 状态（必须走 action）
- 禁止在 useEffect 中做同步状态派生（用 selector 或 useMemo）
- 禁止 any 类型
- 禁止 import 未使用的依赖
