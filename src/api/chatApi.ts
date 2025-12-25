import axiosClient from './axiosCient';
import type { Message as ChatMessage } from '@/types/chat';

/**
 * Chat list item returned from GET /chats
 */
export interface ChatListItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}


/**
 * Response from POST /users/new-chat
 */
export interface NewChatResponse {
  id: string;
}

// CRUD API functions using Axios client
export const chatApi = {
  /**
   * Get all chats for the authenticated user
   */
  getChats: async (): Promise<ChatListItem[]> => {
    const response = await axiosClient.get('/chats');
    return response.data;
  },

  /**
   * Get a specific chat by ID with all messages
   */
  getChatById: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await axiosClient.get(`/chats/${chatId}`);
    return response.data;
  },

  /**
   * Create a new chat
   */
  createNewChat: async (): Promise<NewChatResponse> => {
    const response = await axiosClient.post('/users/new-chat', {});
    return response.data;
  },
};
