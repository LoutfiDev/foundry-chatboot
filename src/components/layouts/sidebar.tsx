import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  MessageCircle,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chat as ChatType } from "@/types/chat";

import { useAuth } from "@/context/authContext";


interface SidebarProps {
  chats: ChatType[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export function Sidebar({ chats, selectedChatId, onNewChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(
    (chat) =>
      chat?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-muted flex w-80 flex-col border-r">
      {/* Header */}
      <div className="border-b p-4">
        <Button className="w-full" onClick={onNewChat}>
          <Plus />
          New Chat
        </Button>
      </div>

      {/* Recent Chats */}
      <div className="flex min-h-0 flex-col">
        <div className="px-4 py-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Recent Chats
            </h3>
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-2">
            <div className="space-y-1 pb-4">
              {filteredChats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "h-auto w-full justify-start p-3 text-left hover:bg-gray-100",
                    selectedChatId === chat.id && "bg-gray-100"
                  )}>
                  <div className="flex w-full items-start gap-2">
                    <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{chat.title}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-1 border border-t p-4 mt-auto">
        <Button variant="ghost" className="text-muted-foreground w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          className="text-muted-foreground w-full justify-start gap-2"
          onClick={useAuth().logout}    
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}