import { useState } from "react";

import { Sidebar } from "@/components/layouts/sidebar";
import { Welcome } from "@/components/layouts/welcome";
import { Chat } from "@/components/layouts/chat";
import type { Chat as ChatType } from "@/types/chat";

export default function Page() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const chats: ChatType[] = [
    {
      id: "1",
      title: "Can you fly?",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "Can you fly?",
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: "m2",
          role: "assistant",
          content: "Not on my own! I exist only in the digital realm...",
          timestamp: new Date(Date.now() - 1000 * 60 * 29)
        }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 29)
    }
  ];

  const handleNewChat = () => {
    setSelectedChatId("new");
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // In a real app, this would start a new chat with the suggestion
    setSelectedChatId("new");
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
        {selectedChatId === null ? (
          <Welcome onSuggestionClick={handleSuggestionClick} />
        ) : selectedChatId === "new" ? (
          <Chat key="new" />
        ) : (
          <Chat key={selectedChatId} chat={selectedChat} />
        )}
      </div>
    </div>
  );
}