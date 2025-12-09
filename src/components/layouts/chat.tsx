import { type FormEventHandler, useState, useCallback, useEffect, useRef } from 'react';
import type { Chat as ChatType } from "@/types/chat";
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
import { Suggestions, Suggestion } from "@/components/ai/suggestion";
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

import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai/source';

import { Button } from '@/components/ui/button';
import { CopyIcon, MicIcon, PaperclipIcon, RefreshCcwIcon, RotateCcwIcon } from 'lucide-react';

interface ChatProps {
  chat?: ChatType;
  initialPrompt?: string;
  onFirstMessage?: (message: string) => void;
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

const starterPrompts = [
  "What can you help me with?",
  "Explain how AI works in simple terms",
  "Give me creative project ideas",
  "Help me learn something new today",
];



export function Chat({ chat, initialPrompt, onFirstMessage }: ChatProps) {

  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [isFirstMessage, setIsFirstMessage] = useState(!chat); // Track if this is a new chat
  const hasProcessedInitialPrompt = useRef(false); // Prevent duplicate processing

  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    messages: chat ? convertChatToUIMessages(chat) : [],
  });

  // Handle initial prompt - only pre-fill input or auto-submit once
  useEffect(() => {
    if (initialPrompt !== undefined && 
        isFirstMessage && 
        messages.length === 0 && 
        !hasProcessedInitialPrompt.current) {
      
      hasProcessedInitialPrompt.current = true; // Mark as processed
      
      // Call onFirstMessage before sending to create the chat entry
      if (onFirstMessage) {
        onFirstMessage(initialPrompt);
        setIsFirstMessage(false);
      }
      sendMessage(
        { text: initialPrompt },
        { body: { model: model } }
      );
    }
  }, [initialPrompt]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();

    const hasText = Boolean(input);
    if (!(hasText)) {
      return;
    }
    
    // If this is the first message in a new chat, notify parent
    if (isFirstMessage && onFirstMessage) {
      onFirstMessage(input);
      setIsFirstMessage(false);
    }
    
    sendMessage(
      { text: input },
      { body: { model: model } }
    );
    setInput('');

  }, [input]);

  const handleSuggestionClick = (suggestion: string) => {
    // If this is the first message in a new chat, notify parent
    if (isFirstMessage && onFirstMessage) {
      onFirstMessage(suggestion);
      setIsFirstMessage(false);
    }
    
    sendMessage(
      { text: suggestion },
      { body: { model: model } }
    );
  };


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
            <div className="max-w-3xl mx-auto flex flex-1 flex-col items-center justify-center px-2 gap-4">
              <p className="text-center text-2xl text-muted-foreground">
                What can I help with?
              </p>

              <Suggestions>
                {starterPrompts.map((prompt) => (
                  <Suggestion
                    key={prompt}
                    suggestion={prompt}
                    onClick={handleSuggestionClick}
                  />
                ))}
              </Suggestions>
            </div>
          ) : (
            <Conversation className="flex-1 overflow-hidden pb-4">
              <ConversationContent className="pb-30 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id}>
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
                    {message.role === 'assistant' && message.parts.filter((part) => part.type === 'file').length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              (part) => part.type === 'file',
                            ).length
                          }
                        />
                        {message.parts.filter((part) => part.type === 'file').map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              key={`${message.id}-${i}`}
                              href={part.url}
                              title={part.filename}
                            />
                          </SourcesContent>
                        ))}
                      </Sources>
                    )}
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