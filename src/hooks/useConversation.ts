import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/lib/query/chatKeys";
import { nanoid } from "nanoid";
import type { Chat, Message } from "@/types/chat";


/*
  * Step-by-step explanation of the code:
    * 1. Cancel any outgoing refetches
    * 2. Snapshot the previous values
    * 3. Execute CRUD Operation Optimistically
    * 4. Return a context object with the snapshotted values
    * 5. Roll back on error
    * 6. Always refetch after error or success
*/


// ============= QUERY HOOKS =============

/**
 * Hook to fetch all conversations
 * Returns conversations from cache (persisted in sessionStorage)
 */
export const useConversations = () => {
  return useQuery({
    queryKey: chatKeys.conversations.all(),
    queryFn: async () => {
      // Initially returns empty array, populated through mutations
      return [] as Chat[];
    },
    initialData: [],
  });
};

/**
 * Hook to fetch messages for a specific conversation
 */
export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: chatKeys.messages.byConversation(conversationId),
    queryFn: async () => {
      // Initially returns empty array, populated through mutations
      return [] as Message[];
    },
    initialData: [],
    enabled: !!conversationId,
  });
};


// ============= MUTATION HOOKS =============

/**
 * Mutation to create a new conversation
 * Follows 6-step optimistic update pattern
 */
export const useAddConversations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { firstMessage: string; conversationId: string }) => {
      // Just return the conversation data - no API call needed for now
      return variables;
    },
    onMutate: async (variables) => {
      const { firstMessage, conversationId } = variables;
      // 1. Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: chatKeys.conversations.all() 
      });

      // 2. Snapshot the previous values
      const previousConversations = queryClient.getQueryData<Chat[]>(
        chatKeys.conversations.all()
      );

      // 3. Execute CRUD Operation Optimistically
      const newConversation: Chat = {
        id: conversationId,
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<Chat[]>(
        chatKeys.conversations.all(),
        (old = []) => [newConversation, ...old]
      );

      // Initialize empty messages cache for this conversation
      queryClient.setQueryData(
        chatKeys.messages.byConversation(newConversation.id),
        []
      );

      // 4. Return a context object with the snapshotted values
      return { previousConversations, newConversation };
    },
    onError: (_err, _variables, context) => {
      // 5. Roll back on error
      if (context?.previousConversations) {
        queryClient.setQueryData(
          chatKeys.conversations.all(),
          context.previousConversations
        );
      }
    },
    // Note: No onSettled/invalidateQueries needed since we're not making API calls
    // The optimistic update in onMutate is the source of truth
  });
};

/**
 * Mutation to update an existing conversation
 * Used to update title or metadata after streaming completes
 */
export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      updates 
    }: { 
      conversationId: string; 
      updates: Partial<Chat> 
    }) => {
      return { conversationId, updates };
    },
    onMutate: async ({ conversationId, updates }) => {
      // 1. Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: chatKeys.conversations.all() 
      });

      // 2. Snapshot the previous values
      const previousConversations = queryClient.getQueryData<Chat[]>(
        chatKeys.conversations.all()
      );

      // 3. Execute CRUD Operation Optimistically
      queryClient.setQueryData<Chat[]>(
        chatKeys.conversations.all(),
        (old = []) => old.map(chat => 
          chat.id === conversationId 
            ? { ...chat, ...updates, updatedAt: new Date() }
            : chat
        )
      );

      // 4. Return a context object with the snapshotted values
      return { previousConversations };
    },
    onError: (_err, _variables, context) => {
      // 5. Roll back on error
      if (context?.previousConversations) {
        queryClient.setQueryData(
          chatKeys.conversations.all(),
          context.previousConversations
        );
      }
    },
  });
};

/**
 * Mutation to add a message to a conversation
 * Follows 6-step optimistic update pattern
 */
export const useAddMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Message) => {
      // For now, just return the message (no API call)
      return message;
    },
    onMutate: async (newMessage) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: chatKeys.messages.byConversation(conversationId) 
      });

      // 2. Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>(
        chatKeys.messages.byConversation(conversationId)
      );

      // 3. Optimistically update
      queryClient.setQueryData<Message[]>(
        chatKeys.messages.byConversation(conversationId),
        (old = []) => [...old, newMessage]
      );

      // 4. Return context with snapshot
      return { previousMessages };
    },
    onError: (_err, _newMessage, context) => {
      // 5. Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages.byConversation(conversationId),
          context.previousMessages
        );
      }
    },
  });
};

/**
 * Mutation to update an existing message
 * Used for streaming updates to assistant messages
 */
export const useUpdateMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      updates 
    }: { 
      messageId: string; 
      updates: Partial<Message> 
    }) => {
      return { messageId, updates };
    },
    onMutate: async ({ messageId, updates }) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: chatKeys.messages.byConversation(conversationId) 
      });

      // 2. Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>(
        chatKeys.messages.byConversation(conversationId)
      );

      // 3. Optimistically update
      queryClient.setQueryData<Message[]>(
        chatKeys.messages.byConversation(conversationId),
        (old = []) => old.map(msg => 
          msg.id === messageId 
            ? { ...msg, ...updates }
            : msg
        )
      );

      // 4. Return context with snapshot
      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      // 5. Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages.byConversation(conversationId),
          context.previousMessages
        );
      }
    },
  });
};
