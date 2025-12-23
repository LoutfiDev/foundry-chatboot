export const chatKeys = {
  all: ['chats'] as const,
  
  conversations: {
    all: () => [...chatKeys.all, 'conversations'] as const,
    detail: (id: string) => 
      [...chatKeys.conversations.all(), id] as const,
  },
  
  messages: {
    byConversation: (conversationId: string) =>
      [...chatKeys.conversations.detail(conversationId), 'messages'] as const,
  },
};