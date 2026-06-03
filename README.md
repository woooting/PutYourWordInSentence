# Sentence Builder

英文遣词造句练习应用。输入一组英文单词，AI 为每个单词生成包含该词的完整句子并将目标词挖空，用户通过拖拽单词到句子空位完成填空练习。

## 技术栈

- **Monorepo**：npm workspaces
- **前端**：React 19 + Vite 8 + TypeScript 6 + TailwindCSS v4 + shadcn/ui + Zustand 5 + @dnd-kit 6
- **后端**：Hono.js 4 (Node.js) + LangChain + DeepSeek API
- **共享层**：TypeScript + Zod

## 快速开始

### 环境要求

- Node.js >= 18
- DeepSeek API Key

### 安装

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 启动开发服务器

```bash
# 同时启动前后端
npm run dev -w backend & npm run dev -w frontend
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001

## 使用方法

1. 输入至少 20 个英文单词（用回车、逗号或空格分隔）
2. 点击"Generate Sentences"，AI 生成包含每个单词的句子
3. 将右侧词库中的单词拖拽到句子空位中
4. 完成当前组后点击 Next 进入下一组
5. 全部完成后查看练习结果和错题回顾

### 快捷键

| 按键 | 功能 |
|------|------|
| `Tab` / `Shift+Tab` | 跳转下一个/上一个空位 |
| `1` ~ `0` | 选择词库对应单词填入当前空位 |

## 项目结构

```
├── shared/          # 共享类型与校验 schema
├── backend/         # Hono.js API 服务
│   └── src/
│       ├── routes/        # 路由层
│       ├── controllers/   # 控制器层
│       ├── services/      # 服务层（业务逻辑 + AI）
│       └── lib/Ai/        # LangChain + 提示词
└── frontend/        # React SPA
    └── src/
        ├── components/    # UI 组件
        ├── stores/        # Zustand 状态管理
        └── lib/           # API 封装 + 工具函数
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |
| `POST` | `/api/generate` | 批量生成句子 |
| `POST` | `/api/generate/single` | 单句重新生成 |
