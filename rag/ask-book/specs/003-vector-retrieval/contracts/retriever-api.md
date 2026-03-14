# Contract: Retriever API

**Module**: `src/lib/rag/retriever.ts`
**Consumer**: Chat API route (future feature)

## Function Signature

```typescript
retrieveRelevantChunks(
  question: string,
  options?: RetrievalOptions
): Promise<RetrievalResult[]>
```

## Input

### `question` (required)
- Type: `string`
- Constraints: Must be non-empty (trimmed length > 0)
- Error: Throws `Error("Question text cannot be empty")` if empty or whitespace-only

### `options` (optional)
- Type: `RetrievalOptions`

| Field | Type | Default | Constraints |
|-------|------|---------|-------------|
| topK | number | 5 | Must be positive integer (> 0). Throws `Error("topK must be a positive integer")` otherwise |
| similarityThreshold | number | 0.7 | Must be between 0 and 1 inclusive |

## Output

- Type: `RetrievalResult[]`
- Ordered by: similarity descending (most relevant first)
- Length: 0 to `topK` results (fewer if not enough chunks meet threshold)

### RetrievalResult shape

```typescript
{
  content: string;              // Chunk text content
  similarity: number;           // Cosine similarity score (0-1)
  documentFilename: string;     // Source PDF filename
  metadata: {
    page: number;               // Page number in source PDF
    section: string | null;     // Section heading or null
  };
}
```

## Behavior

1. Validates `question` is non-empty
2. Validates `topK` is positive integer (if provided)
3. Converts `question` to embedding vector via Vercel AI SDK `embed`
4. Queries `chunks` table with pgvector cosine similarity, JOINing `documents` for filename
5. Filters results below `similarityThreshold`
6. Returns top `topK` results ordered by similarity descending
7. Returns empty array `[]` when no chunks meet threshold

## Error Cases

| Condition | Error |
|-----------|-------|
| Empty question | `Error("Question text cannot be empty")` |
| topK <= 0 or non-integer | `Error("topK must be a positive integer")` |
| Embedding API failure | Propagates upstream error from Vercel AI SDK |
| Database error | Propagates upstream error from Drizzle |
