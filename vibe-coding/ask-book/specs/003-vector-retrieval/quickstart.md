# Quickstart: Vector Similarity Retrieval Module

## Prerequisites

- PostgreSQL + pgvector running (`docker compose up -d`)
- Database migrated with chunks and documents tables (feature 001)
- At least one PDF uploaded and processed (feature 002) so chunks with embeddings exist
- `OPENAI_API_KEY` set in `.env.local`
- `DATABASE_URL` set in `.env.local`

## Scenario 1: Basic Retrieval

```typescript
import { retrieveRelevantChunks } from "@/lib/rag/retriever";

// Default: top 5 results, threshold 0.7
const results = await retrieveRelevantChunks("What is the company vacation policy?");

console.log(results);
// [
//   {
//     content: "Employees are entitled to 20 days of paid vacation per year...",
//     similarity: 0.89,
//     documentFilename: "employee-handbook-2024.pdf",
//     metadata: { page: 15, section: "VACATION POLICY" }
//   },
//   ...
// ]
```

## Scenario 2: Custom topK and Threshold

```typescript
const results = await retrieveRelevantChunks(
  "How do I report workplace harassment?",
  { topK: 3, similarityThreshold: 0.8 }
);
// Returns at most 3 results, only those with similarity >= 0.8
```

## Scenario 3: No Relevant Results

```typescript
const results = await retrieveRelevantChunks("What is the weather today?");
// Returns [] — no employee handbook chunks are relevant to weather
```

## Scenario 4: Error Handling

```typescript
// Empty question — throws immediately
try {
  await retrieveRelevantChunks("");
} catch (e) {
  console.error(e.message); // "Question text cannot be empty"
}

// Invalid topK — throws immediately
try {
  await retrieveRelevantChunks("test", { topK: 0 });
} catch (e) {
  console.error(e.message); // "topK must be a positive integer"
}
```

## Verification Checklist

- [ ] Function returns results with correct shape (content, similarity, documentFilename, metadata)
- [ ] Results are ordered by similarity descending
- [ ] Results below threshold are excluded
- [ ] Empty array returned when no chunks match
- [ ] Source document filename is correct for each chunk
- [ ] Page and section metadata are accurate
- [ ] Empty question throws descriptive error
- [ ] Invalid topK throws descriptive error
