import { useState } from "react";
import { chatApi } from "@/api/chatApi";


import { Sidebar } from "@/components/layouts/sidebar";
import { Welcome } from "@/components/layouts/welcome";
import { Chat } from "@/components/layouts/chat";
import { useConversations, useAddConversations } from "@/hooks/useConversation";


export default function Page() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);
  
  // Use React Query to manage conversations
  const { data: chats = [] } = useConversations();
  const addConversation = useAddConversations();

  const handleNewChat = async () => {
    setInitialPrompt(undefined);
    const newChatId = await chatApi.createNewChat().then(res => res.id);
    setSelectedChatId(newChatId);
  };

  const handleSelectChat = (chatId: string) => {
    setInitialPrompt(undefined);
    setSelectedChatId(chatId);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const newChatId = await chatApi.createNewChat().then(res => res.id);
    setInitialPrompt(suggestion);
    setSelectedChatId(newChatId);
  };

  // Handle first message submission to create a new chat
  const handleFirstMessage = (firstMessage: string, chatId: string) => {
    // Create new conversation with the existing chatId
    addConversation.mutate({ firstMessage, conversationId: chatId });
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <div className="flex h-screen">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <div className="flex flex-1 flex-col">
        {selectedChatId === null ? 
          <Welcome onSuggestionClick={handleSuggestionClick} />
          : 
          <Chat 
            key={selectedChatId}
            chatId={selectedChatId}
            chat={selectedChat}
            initialPrompt={initialPrompt}
            onFirstMessage={handleFirstMessage}
          />
        }
      </div>
    </div>
  );
}
