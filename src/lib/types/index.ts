/**
 * ============================================================
 * 📚 类型定义文件 - types/index.ts
 * ============================================================
 * 
 * 【什么是 TypeScript 接口？】
 * 接口（Interface）用于定义对象的结构和类型
 * 它是 TypeScript 的核心特性，提供类型检查
 * 
 * 【为什么需要类型定义？】
 * 1. 代码提示：IDE 能提供更好的自动补全
 * 2. 类型检查：编译时发现潜在错误
 * 3. 文档作用：明确数据结构
 * 4. 重构安全：修改类型会自动提示所有相关代码
 */

/**
 * 【消息接口】
 * 表示一条聊天消息
 * 
 * 【详解各个字段】
 */
export interface Message {
	/**
	 * 消息唯一标识符
	 * 使用字符串类型，通常是由 UUID 或类似算法生成
	 */
	id: string;
	
	/**
	 * 消息角色
	 * 
	 * 【联合类型 Union Type】
	 * 'user' | 'assistant' 表示只能是这两个值之一
	 * - 'user': 用户发送的消息
	 * - 'assistant': AI 的回复
	 * 
	 * 【为什么不用 string？】
	 * 使用联合类型可以：
	 * 1. 限制取值范围
	 * 2. 避免拼写错误
	 * 3. 提供更好的类型提示
	 */
	role: 'user' | 'assistant';
	
	/**
	 * 消息内容
	 * 纯文本格式，可能包含 Markdown 语法
	 */
	content: string;
	
	/**
	 * 时间戳
	 * Unix 时间戳（毫秒）
	 * 
	 * 【为什么用 number 不用 Date？】
	 * JSON 序列化时 Date 会变成字符串
	 * 存储到 localStorage 时需要简单类型
	 */
	timestamp: number;
}

/**
 * 【对话接口】
 * 表示一个完整的对话会话
 */
export interface Conversation {
	/**
	 * 对话唯一标识符
	 */
	id: string;
	
	/**
	 * 对话标题
	 * 默认为"新对话"，有消息后会自动生成
	 */
	title: string;
	
	/**
	 * 消息列表
	 * Message[] 表示 Message 类型的数组
	 */
	messages: Message[];
	
	/**
	 * 创建时间
	 */
	createdAt: number;
	
	/**
	 * 最后更新时间
	 * 用于排序（最新更新的在前面）
	 */
	updatedAt: number;
}

/**
 * 【聊天请求接口】
 * 发送给后端的 API 请求格式
 */
export interface ChatRequest {
	/**
	 * 对话 ID
	 * 用于后端关联对话上下文
	 */
	conversation_id: string;
	
	/**
	 * 发送者角色
	 * 固定为 'user'
	 * 
	 * 【字面量类型】
	 * 这里不是联合类型，而是固定的字面量
	 * 表示 role 只能是 'user' 这一个值
	 */
	role: 'user';
	
	/**
	 * 消息内容
	 */
	content: string;
}

/**
 * 【聊天响应接口】
 * 后端返回的 API 响应格式
 */
export interface ChatResponse {
	/**
	 * 会话令牌
	 * 用于后续的流式传输请求
	 * 
	 * 【为什么需要 sessionToken？】
	 * 流式传输（SSE）需要一个标识符来匹配请求和响应
	 */
	sessionToken: string;
	
	/**
	 * 对话 ID
	 * 后端可能返回新的或已存在的对话 ID
	 */
	conversation_id: string;
}

/**
 * 【历史消息响应接口】
 * 获取历史消息的 API 响应格式
 */
export interface HistoryResponse {
	/**
	 * 对话 ID
	 */
	conversation_id: string;
	
	/**
	 * 消息列表
	 */
	data: Message[];
}
