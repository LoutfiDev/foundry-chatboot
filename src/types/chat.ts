/**
 * Represents a single message in a chat conversation.
 * Messages can be from the user, assistant (AI), or system.
 */
export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
}

/**
 * Represents a complete chat conversation containing multiple messages.
 * Each chat has a unique ID and maintains a history of all messages exchanged.
 */
export interface Chat {
	id: string;
	title: string;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Represents the global state for the chat application.
 * This interface is designed to work with state management (e.g., React Context, Redux).
 * It tracks all chats, the currently active chat, loading states, and any errors.
 */
export interface ChatState {
	chats: Chat[];
	currentChatId: string | null;
	isLoading: boolean;
	error: string | null;
}