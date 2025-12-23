# React Query Implementation Summary

## Overview
Successfully migrated chat state management from manual React state to TanStack Query (React Query) with sessionStorage persistence. Messages and conversations now persist until the browser tab is closed or refreshed.

## Key Changes

### 1. QueryClient Setup ([main.tsx](src/main.tsx))
- ✅ Installed `@tanstack/react-query-persist-client` and `@tanstack/query-sync-storage-persister`
- ✅ Configured `PersistQueryClientProvider` with sessionStorage persister
- ✅ Set up query defaults (24h cache time, 5min stale time)
- ✅ All queries automatically persist to sessionStorage with key: `FOUNDRY_CHATBOT_CACHE`

### 2. Query Hooks ([src/hooks/useConversation.ts](src/hooks/useConversation.ts))

#### Query Hooks (Read Operations)
- **`useConversations()`** - Fetches all conversations from cache
- **`useMessages(conversationId)`** - Fetches messages for a specific conversation

#### Mutation Hooks (Write Operations)
All mutations follow optimistic update pattern (without API refetches):

1. **`useAddConversations()`** - Create new conversation
   - ✅ Cancel outgoing refetches
   - ✅ Snapshot previous state
   - ✅ Optimistically add to cache
   - ✅ Return context with snapshot
   - ✅ Rollback on error
   - ⚠️ No refetch - optimistic update is source of truth

2. **`useUpdateConversation()`** - Update conversation metadata (title, etc.)
   - Follows same optimistic update pattern

3. **`useAddMessage(conversationId)`** - Add message to conversation
   - Follows same optimistic update pattern
   - Used for both user and assistant messages

4. **`useUpdateMessage(conversationId)`** - Update existing message
   - Useful for streaming updates (future enhancement)

**Important**: Since we're not making API calls, `onSettled` with `invalidateQueries` is **not used**. The optimistic updates in `onMutate` are the source of truth. This prevents the cache from being overwritten with empty data from the query function.

### 3. Page Component Integration ([src/page.tsx](src/page.tsx))

**Before:**
```typescript
const [chats, setChats] = useState<ChatType[]>([]);
// Manual state management with setChats
// Chat ID generated after first message
```

**After:**
```typescript
const { data: chats = [] } = useConversations();
const addConversation = useAddConversations();
// React Query manages state automatically
// Chat ID generated upfront when creating new chat
```

**Key Changes:**
- Chat ID is now generated **before** opening the chat (in `handleNewChat` and `handleSuggestionClick`)
- `handleFirstMessage` receives the pre-generated chat ID and creates the conversation with it
- This ensures the Chat component always has a valid ID to work with

**Benefits:**
- No more manual state updates
- Automatic caching and persistence
- Optimistic updates for better UX
- Automatic error handling and rollback
- Consistent chat IDs throughout the flow

### 4. Chat Component Integration ([src/components/layouts/chat.tsx](src/components/layouts/chat.tsx))

**Key Changes:**
- Uses `useMessages(chatId)` to fetch messages from cache
- Uses `useAddMessage(chatId)` to add user/assistant messages
- Integrates with AI SDK's `useChat` hook for streaming
- Saves messages to React Query cache via `onFinish` callback

**Flow:**
1. User submits message → Save to React Query cache
2. Send to backend via `sendMessage()` (AI SDK)
3. Stream response from backend
4. On finish → Save assistant response to cache
5. Both messages persist in sessionStorage

### 5. Query Keys Structure ([src/lib/query/chatKeys.ts](src/lib/query/chatKeys.ts))

```typescript
chatKeys = {
  all: ['chats'],
  conversations: {
    all: () => [...chatKeys.all, 'conversations'],
    detail: (id) => [...chatKeys.conversations.all(), id]
  },
  messages: {
    byConversation: (conversationId) => [...chatKeys.all, 'messages', conversationId]
  }
}
```

**Benefits:**
- Centralized key management
- Type-safe query keys
- Easy to invalidate specific queries
- Hierarchical structure for related data

## Data Flow

### Creating a New Conversation
```
User clicks "New Chat" 
  → Generate chatId upfront with nanoid()
  → Set as selectedChatId
  → User sends first message
  → addConversation.mutate({ firstMessage, conversationId: chatId })
  → Optimistically add to cache with pre-generated ID
  → Update sessionStorage automatically
  → Conversation appears in sidebar
```

### Sending a Message
```
User submits message
  → addMessage.mutate(userMessage)
  → Optimistically add to messages cache
  → sendMessage() to backend (AI SDK)
  → Stream response
  → onFinish: addMessage.mutate(assistantMessage)
  → Both messages persist in sessionStorage
```

### Tab Persistence
```
User refreshes tab
  → QueryClient loads from sessionStorage
  → useConversations() returns cached data
  → useMessages(chatId) returns cached messages
  → UI renders with persisted state
```

## Testing the Implementation

1. **Start server:** `npm run dev`
2. **Create a chat:** Click "New Chat" and send a message
3. **Verify sidebar:** Chat should appear in the sidebar immediately
4. **Send more messages:** All messages persist in the conversation
5. **Verify persistence:** Refresh the page → chat and messages remain
6. **Verify isolation:** Close tab → sessionStorage cleared
7. **Open new tab:** Fresh state (no chats)

## Common Issues & Solutions

### Issue: Conversations don't appear in sidebar
**Cause:** Using `invalidateQueries` in `onSettled` causes refetch which returns empty array  
**Solution:** Remove `onSettled` - optimistic updates are the source of truth

### Issue: Different chat IDs in mutation vs component
**Cause:** Generating ID in both `onMutate` and `mutationFn`  
**Solution:** Generate ID upfront in parent component, pass to mutation

### Issue: Messages not saving to correct conversation
**Cause:** Chat component using ID generated before conversation creation  
**Solution:** Generate chat ID before opening chat, create conversation with that ID

## Next Steps (Optional Enhancements)

1. **Backend Integration**
   - Update `/api/chat` endpoint to return SSE stream
   - Add metadata (chatId, title) in response headers or finish event
   - See previous conversation for SSE format examples

2. **Streaming Updates**
   - Use `useUpdateMessage()` to update assistant messages during streaming
   - Implement `onData` callback to append chunks

3. **Error Handling**
   - Add error states in UI for failed mutations
   - Show toast notifications on errors
   - Retry failed requests

4. **Search & Filters**
   - Add query for filtered conversations
   - Search messages across conversations
   - Filter by date, model, etc.

## Files Modified

- ✅ [src/main.tsx](src/main.tsx) - QueryClient setup
- ✅ [src/hooks/useConversation.ts](src/hooks/useConversation.ts) - Query/mutation hooks
- ✅ [src/page.tsx](src/page.tsx) - Conversation list integration
- ✅ [src/components/layouts/chat.tsx](src/components/layouts/chat.tsx) - Message management

## Files Preserved (Old Versions)

- `src/page_old.tsx` - Original page with manual state management
- `src/components/layouts/chat_old.tsx` - Original chat component

You can delete these files once you confirm the new implementation works as expected.

## Benefits Achieved

✅ **Persistence:** Messages survive tab refresh/close (sessionStorage)  
✅ **Performance:** Optimistic updates for instant UI feedback  
✅ **Reliability:** Automatic rollback on errors  
✅ **Maintainability:** Centralized state management  
✅ **Type Safety:** Full TypeScript support  
✅ **Scalability:** Easy to add new queries/mutations  
✅ **Developer Experience:** Less boilerplate, more features
