import { type FormEventHandler, useState, useCallback } from 'react';
import type { Chat as ChatType, Message as MessageType } from "@/types/chat";
import { cn, convertChatToUIMessages } from '@/lib/utils';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai/conversation';
import { Loader } from '@/components/ai/loader';
import { Message, MessageContent } from '@/components/ai/message';
import { Action, Actions } from '@/components/ai/actions';
import { Response } from '@/components/ai/response';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai/source';
import { Button } from '@/components/ui/button';
import { CopyIcon, MicIcon, PaperclipIcon, RefreshCcwIcon, RotateCcwIcon } from 'lucide-react';

interface ChatProps {
  chat?: ChatType;
}

const models = [
  {
    name: 'Gemini 2.5 Flash',
    value: 'gemini-2.5-flash',
  },
  {
    name: 'Gemini 2.5 Pro',
    value: 'gemini-2.5-pro',
  },
];


export function Chat({ chat }: ChatProps) {

  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);

  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    })
    // messages: chat ? convertChatToUIMessages(chat) : [],
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();

    const hasText = Boolean(input);
    if (!(hasText)) {
      return;
    }
    sendMessage(
      { text: input },
      { body: { model: model } }
    );
    setInput('');

  }, [input]);


  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500" />
            <span className="font-medium text-sm">AI Assistant</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-muted-foreground text-xs">
            {models.find(m => m.value === model)?.name}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
        >
          <RotateCcwIcon className="size-4" />
          <span className="ml-1">Reset</span>
        </Button>
      </div>

      {/* Main content area with conversation and prompt */}
      <div className={cn("relative flex flex-1 overflow-hidden", messages.length === 0 && "flex-col justify-center")}>
        <div className="mx-auto flex w-full flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-center text-2xl text-muted-foreground">
                What can I help with?
              </p>
            </div>
          ) : (
            <Conversation className="flex-1 overflow-hidden pb-4">
              <ConversationContent className="pb-30 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              (part) => part.type === 'source-url',
                            ).length
                          }
                        />
                        {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                      </Sources>
                    )}
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Message key={`${message.id}-${i}`} from={message.role}>
                              <MessageContent>
                                <Response>
                                  {part.text}
                                </Response>
                              </MessageContent>
                              {message.role === 'assistant' && i === messages.length - 1 && (
                                <Actions>
                                  <Action
                                    onClick={() => regenerate()}
                                    label="Retry"
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </Action>
                                  <Action
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </Action>
                                </Actions>
                              )}
                            </Message>
                          );
                        case 'reasoning':
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                ))}
                {status === 'submitted' && <Loader />}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}
        </div>

        {/* Fixed prompt input at bottom */}
        <div className={cn("pointer-events-none w-full py-4", messages.length > 0 ? "absolute inset-x-0 bottom-0" : "static")}>
          <PromptInput
            onSubmit={handleSubmit}
            className="pointer-events-auto max-w-3xl mx-auto">
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about development, coding, or technology..."
              disabled={status === 'streaming'}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputButton disabled={status === 'streaming'}>
                  <PaperclipIcon size={16} />
                </PromptInputButton>
                <PromptInputButton disabled={status === 'streaming'}>
                  <MicIcon size={16} />
                  <span>Voice</span>
                </PromptInputButton>
                <PromptInputModelSelect
                  value={model}
                  onValueChange={setModel}
                  disabled={status === 'streaming'}
                >
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((model) => (
                      <PromptInputModelSelectItem key={model.name} value={model.value}>
                        {model.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!input.trim() || status === 'streaming'}
                status={status}
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}