# ChatGPT Demo

基于 SvelteKit + Svelte 5 构建的类 ChatGPT 聊天网站前端应用。

## 功能特性

- 聊天对话 - 与 AI 助手进行对话交互
- 流式响应 - 使用 SSE (Server-Sent Events) 实现流式输出
- Markdown 渲染 - 支持代码高亮和 Markdown 格式显示
- 历史记录 - 侧边栏显示和管理历史对话
- 多会话管理 - 支持新建、重命名、删除会话
- 主题切换 - 支持深色/浅色主题切换
- 响应式设计 - 支持移动端和桌面端

## 技术栈

- Svelte 5.55+ (使用 Runes 响应式语法)
- SvelteKit 2.57+
- TypeScript
- TailwindCSS 3.4+
- marked + highlight.js (Markdown 渲染)

## 目录结构

```
chatgpt/
├── src/
│   ├── lib/
│   │   ├── components/         # UI 组件
│   │   │   ├── ChatInput.svelte      # 输入框组件
│   │   │   ├── ChatMessage.svelte    # 消息展示组件
│   │   │   ├── MarkdownRenderer.svelte # Markdown 渲染
│   │   │   ├── Sidebar.svelte        # 侧边栏
│   │   │   └── StreamingMessage.svelte # 流式消息展示
│   │   ├── stores/             # 状态管理
│   │   │   ├── chat.svelte.ts       # 聊天状态
│   │   │   └── theme.svelte.ts      # 主题状态
│   │   └── types/              # TypeScript 类型定义
│   │       └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte     # 根布局
│   │   ├── +layout.ts         # 布局数据加载
│   │   └── +page.svelte       # 主页面
│   ├── app.css                # 全局样式 (TailwindCSS)
│   ├── app.html               # HTML 模板
│   └── app.d.ts               # 类型声明
├── static/
│   └── assets/image/          # 图片资源
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

## 组件说明

| 组件 | 文件 | 说明 |
|------|------|------|
| Sidebar | `Sidebar.svelte` | 左侧侧边栏，包含新建对话、历史记录、主题切换 |
| ChatInput | `ChatInput.svelte` | 底部输入框，支持多行输入和发送消息 |
| ChatMessage | `ChatMessage.svelte` | 单条消息展示，区分用户和 AI |
| MarkdownRenderer | `MarkdownRenderer.svelte` | Markdown 内容渲染，支持代码高亮 |
| StreamingMessage | `StreamingMessage.svelte` | 流式输出时的临时消息展示 |

## API 接口

后端服务需运行在 `http://localhost:8888`，提供以下接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/chat` | POST | 发送消息，返回 sessionToken 和 conversation_id |
| `/chat/stream?sessionToken=` | GET | SSE 流式获取 AI 回复 |
| `/history?conversation_id=` | GET | 获取指定会话的历史消息 |

### 请求/响应示例

**POST /chat**
```json
{
  "conversation_id": "",
  "role": "user",
  "content": "你好"
}
```

响应：
```json
{
  "sessionToken": "xxx",
  "conversation_id": "xxx"
}
```

**GET /history?conversation_id=xxx**

响应：
```json
{
  "conversation_id": "xxx",
  "data": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好，有什么可以帮您？" }
  ]
}
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 类型检查

```bash
npm run check
```

### 生产构建

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 状态管理

使用 Svelte 5 的 Runes 语法 (`$state`, `$derived`, `$effect`) 进行状态管理：

- `chatStore` - 管理会话列表、消息、加载状态等
- `themeStore` - 管理主题切换

数据持久化通过 `localStorage` 实现。

## 注意事项

1. 需要先启动后端服务 (默认端口 8888)
2. 会话数据保存在浏览器 localStorage 中
3. 首次使用会自动创建新对话
