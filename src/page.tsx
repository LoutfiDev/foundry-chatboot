import { useState } from "react";
import { nanoid } from "nanoid"

import { Sidebar } from "@/components/layouts/sidebar";
import { Welcome } from "@/components/layouts/welcome";
import { Chat } from "@/components/layouts/chat";
import type { Chat as ChatType } from "@/types/chat";


export default function Page() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);
  const [chats, setChats] = useState<ChatType[]>([
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
          source: [
            { 
              filename: "Digital Realm Explanation",
              url: "https://example.com/digital-realm"
            },
            {
              filename: "AI Capabilities Overview",
              url: "https://example.com/ai-capabilities"
            }
          ],
          timestamp: new Date(Date.now() - 1000 * 60 * 29)
        }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 29)
    }
  ]);

  const handleNewChat = () => {
    setInitialPrompt(undefined);
    setSelectedChatId(nanoid());
  };

  const handleSelectChat = (chatId: string) => {
    setInitialPrompt(undefined);
    setSelectedChatId(chatId);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInitialPrompt(suggestion);
    setSelectedChatId(nanoid());
  };

  // Handle first message submission to create a new chat
  const handleFirstMessage = (firstMessage: string, id: string) => {
    const newChatId = id;
    const now = new Date();
    
    // Create title from first message (max 50 chars)
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;

    const newChat: ChatType = {
      id: newChatId,
      title: title,
      messages: [
        {
          id: nanoid(),
          role: "user",
          content: firstMessage,
          timestamp: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    // Add new chat to the beginning of the list
    setChats(prev => [newChat, ...prev]);
    
    // Switch to the new chat
    setInitialPrompt(undefined);
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