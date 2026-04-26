/**
 * ============================================================
 * 📚 SvelteKit 类型声明文件 - app.d.ts
 * ============================================================
 * 
 * 【什么是 .d.ts 文件？】
 * .d.ts 是 TypeScript 的类型声明文件
 * 用于声明类型、接口、模块等
 * 不包含实现代码，只有类型定义
 * 
 * 【app.d.ts 的作用】
 * SvelteKit 的全局类型声明文件
 * 用于扩展 SvelteKit 的类型系统
 */

/**
 * 【声明全局命名空间】
 * 
 * declare global 表示声明全局可用的类型
 * 不需要导入即可使用
 */
declare global {
	/**
	 * 【App 命名空间】
	 * 
	 * SvelteKit 预定义了几个接口：
	 * - Error: 错误类型
	 * - Locals: 服务器端本地数据
	 * - PageData: 页面数据
	 * - PageState: 页面状态
	 * - Platform: 平台特定数据
	 * 
	 * 【使用场景】
	 * 这些接口可以扩展，添加自定义类型：
	 * 
	 * 示例：添加用户类型
	 * interface Locals {
	 *   user: {
	 *     id: string;
	 *     name: string;
	 *   } | null;
	 * }
	 * 
	 * 然后在服务端钩子中使用：
	 * export const handle: Handle = async ({ event, resolve }) => {
	 *   event.locals.user = await getUser(event);
	 *   return resolve(event);
	 * };
	 */
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

/**
 * 【空导出】
 * 
 * 【为什么需要 export {}？】
 * 在 TypeScript 中，包含顶级 import 或 export 的文件被视为模块
 * 没有 import/export 的文件被视为全局脚本
 * 
 * declare global 需要在模块上下文中使用
 * 所以需要 export {} 使文件成为模块
 */
export {};