export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
	createdAt: number;
	updatedAt: number;
}

export interface ChatRequest {
	conversation_id: string;
	role: 'user';
	content: string;
}

export interface ChatResponse {
	sessionToken: string;
	conversation_id: string;
}

export interface HistoryResponse {
	conversation_id: string;
	data: Message[];
}
