# SvelteKit 静态打包指南

本文档记录将 SvelteKit 项目打包为静态文件供 Rust 后端使用的过程。

## 目标

将 SvelteKit 项目打包成纯静态文件（HTML/CSS/JS），交给 Rust 后端作为前端页面托管。

## 步骤概览

### 1. 安装静态适配器

SvelteKit 默认使用 `adapter-auto`，需要改为 `adapter-static`：

```bash
npm install -D @sveltejs/adapter-static
```

### 2. 修改 svelte.config.js

```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html'  // SPA 模式，支持前端路由
    })
  }
};

export default config;
```

`fallback: 'index.html'` 的作用：所有未匹配的路由都返回 index.html，让前端路由处理。

### 3. 添加预渲染配置

在 `src/routes/+layout.ts` 中添加：

```ts
export const prerender = true;
export const ssr = false;
```

- `prerender: true` - 构建时生成静态 HTML
- `ssr: false` - 禁用服务端渲染，纯客户端渲染

### 4. 执行构建

```bash
npm run build
```

输出目录：`build/`

## 遇到的问题及解决方案

### 问题一：package.json 无法解析

**错误信息：**
```
npm error JSONParseError: Unexpected token "/" 
```

**原因：**
package.json 不支持注释，但项目中使用了 JSDoc 风格的注释。

**解决：**
删除 package.json 中的所有注释，保持纯 JSON 格式。

### 问题二：PostCSS 解析错误

**错误信息：**
```
SyntaxError: [postcss] Unexpected token, expected ","
```

**原因：**
其他配置文件（postcss.config.js、tailwind.config.js 等）中的注释被错误解析。

**解决：**
简化所有配置文件，仅保留必要的 JSDoc 类型注解（以 `/**` 开头的单行注释），删除多行注释。

修改前（有问题）：
```js
/**
 * 这是多行注释
 * 可能导致解析错误
 */
export default { ... }
```

修改后（正常）：
```js
/** @type {import('tailwindcss').Config} */
export default { ... }
```

### 问题三：缺少 favicon.svg

**错误信息：**
```
Error: 404 /favicon.svg (linked from /)
```

**原因：**
app.html 中引用了 favicon.svg，但 static 目录下不存在该文件。

**解决：**
在 `static/` 目录创建 favicon.svg 文件：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#10a37f"/>
  <text x="50" y="70" font-size="60" text-anchor="middle" fill="white">C</text>
</svg>
```

## 最终目录结构

构建完成后，`build/` 目录包含：

```
build/
├── _app/              # SvelteKit 运行时文件
│   └── immutable/     # 带哈希的静态资源（可永久缓存）
├── assets/           # 静态资源（图片等）
├── favicon.svg       # 网站图标
├── index.html       # 入口页面
└── robots.txt       # 爬虫配置
```

## Rust 后端集成示例

### Actix-web

```rust
use actix_files::Files;
use actix_web::{App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            // 静态文件服务
            .service(Files::new("/", "./build")
                .index_file("index.html"))
            // API 路由
            // .service(your_api_routes)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

### Axum

```rust
use axum::Router;
use tower_http::services::{ServeDir, ServeFile};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .nest_service("/", 
            ServeDir::new("build")
                .fallback(ServeFile::new("build/index.html"))
        );
        // .merge(api_routes);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

## 注意事项

1. **API 地址**：前端代码中硬编码的 API 地址（如 `localhost:8888`）需要根据部署环境调整。

2. **跨域问题**：如果前后端分离部署，需要配置 CORS。

3. **路由模式**：SPA 模式下，所有路由都返回 index.html，后端需要正确处理。

4. **构建优化**：构建时会有 chunk 大小警告，可通过动态导入优化：
   ```js
   // 按需加载大组件
   const HeavyComponent = import('./HeavyComponent.svelte');
   ```

## 总结

| 步骤 | 操作 |
|------|------|
| 1 | 安装 @sveltejs/adapter-static |
| 2 | 修改 svelte.config.js，配置 adapter |
| 3 | 在 +layout.ts 添加 prerender 和 ssr 配置 |
| 4 | 检查配置文件注释问题 |
| 5 | 确保静态资源完整 |
| 6 | 执行 npm run build |
