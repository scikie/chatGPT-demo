# ChatGPT Demo

基于 Svelte 3 构建的类 ChatGPT 聊天网站前端应用。

## 功能特性

- 聊天对话 - 与AI助手进行对话交互
- 流式响应 - 使用 SSE (Server-Sent Events) 实现流式输出
- 历史记录 - 侧边栏显示历史对话记录
- 新建对话 - 可创建新的对话会话
- 响应式设计 - 支持移动端和桌面端

## 技术栈

- Svelte 3.55.0
- Rollup (构建工具)
- @brewer/beerui (UI组件库)
- sirv (静态文件服务器)

## 目录结构

```
chatgpt/
├── docs/                    # 文档目录
├── public/                  # 静态资源目录
│   ├── assets/image/        # 图片资源
│   │   ├── chat_avatar.png      # AI头像
│   │   ├── user_avatar.png      # 用户头像(深色)
│   │   └── user_avatar_light.png # 用户头像(浅色)
│   ├── build/               # 构建输出目录
│   │   ├── bundle.js
│   │   ├── bundle.css
│   │   └── bundle.js.map
│   ├── favicon.png
│   ├── global.css           # 全局样式
│   └── index.html           # 入口HTML
├── src/                     # 源代码目录
│   ├── components/          # 组件目录
│   │   ├── Chat.svelte      # 聊天主组件
│   │   ├── ChatMessage.svelte   # AI消息组件
│   │   ├── History.svelte   # 历史记录侧边栏
│   │   └── UserMessage.svelte   # 用户消息组件
│   ├── App.svelte           # 根组件
│   └── main.js              # 入口文件
├── scripts/                 # 脚本目录
├── package.json
├── rollup.config.js         # Rollup配置
├── .gitignore
├── LICENSE
└── README.md
```

## 组件说明

| 组件 | 文件 | 说明 |
|------|------|------|
| App | `App.svelte` | 根组件，管理消息列表和历史记录状态 |
| Chat | `Chat.svelte` | 聊天主界面，处理消息发送和流式接收 |
| ChatMessage | `ChatMessage.svelte` | AI回复消息展示组件 |
| UserMessage | `UserMessage.svelte` | 用户消息展示组件 |
| History | `History.svelte` | 左侧历史记录侧边栏 |

## API 接口

后端服务需运行在 `http://localhost:8888`，提供以下接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/chat` | POST | 发送消息，返回 sessionToken 和 conversation_id |
| `/chat/stream?sessionToken=` | GET | SSE 流式获取AI回复 |
| `/history?conversation_id=` | GET | 获取指定会话的历史消息 |

### 请求/响应示例

**POST /chat**
```json
// Request
{
  "conversation_id": "",
  "role": "user",
  "content": "你好"
}

// Response
{
  "sessionToken": "xxx",
  "conversation_id": "xxx"
}
```

**GET /history?conversation_id=xxx**
```json
// Response
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

访问 `http://localhost:5000` 查看应用。

### 生产构建

```bash
npm run build
```

### 运行生产版本

```bash
npm run start
```

## 注意事项

- 需要先启动后端服务 (默认端口 8888)
- 开发模式下支持热重载和浏览器自动刷新
