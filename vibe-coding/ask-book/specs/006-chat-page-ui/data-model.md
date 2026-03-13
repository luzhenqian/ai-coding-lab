# Data Model: Chat Page UI

This feature consumes existing entities from the database schema (feature 001). No new tables or migrations are needed.

## Existing Entities Used

### Conversation
- **id**: UUID, primary key
- **title**: text, nullable (derived from first user message, max 50 chars)
- **createdAt**: timestamp with timezone
- **updatedAt**: timestamp with timezone
- **Relationships**: has many Messages (cascade delete)

### Message
- **id**: UUID, primary key
- **conversationId**: UUID, foreign key → Conversation
- **role**: text ("user" | "assistant")
- **content**: text (message body, Markdown for assistant messages)
- **sources**: JSONB, nullable — array of SourceCitation objects
- **createdAt**: timestamp with timezone
- **Relationships**: belongs to Conversation

### SourceCitation (embedded in Message.sources JSONB)
- **filename**: string — PDF document filename
- **page**: number — page number in the PDF
- **section**: string | null — section/chapter title if detected

## Client-Side State

### ChatPageState (React component state, not persisted)
- **activeConversationId**: string | null — currently selected conversation
- **sidebarOpen**: boolean — mobile sidebar visibility toggle
- **conversations**: Conversation[] — cached sidebar list

### useChat Managed State (from @ai-sdk/react)
- **messages**: UIMessage[] — current conversation messages (managed by hook)
- **input**: string — current input box value
- **status**: 'submitted' | 'streaming' | 'ready' | 'error'

## Data Flow

1. **Page load**: Fetch `GET /api/conversations` → populate sidebar
2. **Select conversation**: Fetch `GET /api/conversations/[id]/messages` → set as useChat initial messages
3. **Send message**: useChat sends `POST /api/chat` with `{ messages, conversationId }` → streams response
4. **New conversation**: Clear messages, set conversationId to null → first message creates conversation server-side
5. **After streaming completes**: Refresh sidebar to update conversation list (new conversations appear)
