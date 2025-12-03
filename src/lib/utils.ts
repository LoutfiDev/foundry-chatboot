import type { UIMessage } from "ai";
import type { Chat as ChatType } from "@/types/chat";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertChatToUIMessages(chat: ChatType) : UIMessage[] {
  return chat.messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text', text: msg.content }],
  }));
}
