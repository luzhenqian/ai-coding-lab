# Quickstart: CJK-Compatible Text Chunker Rewrite

## Prerequisites

- Node.js 20+ with pnpm
- PostgreSQL 16+ running with existing schema
- A Chinese PDF document for testing (e.g., employee handbook)

## Setup

1. **Install new dependency**:
   ```bash
   pnpm add gpt-tokenizer
   ```

2. **Start dev server**:
   ```bash
   pnpm dev
   ```

## Test Scenarios

### Scenario 1: Chinese Document Chunking

1. Delete existing documents from the knowledge drawer (to get fresh chunks)
2. Upload a Chinese employee handbook PDF (20+ pages)
3. Wait for processing to complete
4. Check the chunk count in the document list — should be 20+ chunks (not 3)
5. In the chat, ask: "加班费怎么算？"
6. Expected: The chatbot answers with specific overtime pay calculation details from the handbook

### Scenario 2: Mixed Chinese-English Content

1. Upload a document containing both Chinese and English text
2. Verify processing completes successfully
3. Ask questions about both Chinese and English content
4. Expected: Both languages are retrievable

### Scenario 3: English-Only Document (Regression Check)

1. Upload a purely English PDF document
2. Verify chunk count is reasonable (comparable to before the rewrite)
3. Ask questions about the content
4. Expected: Retrieval quality is equal to or better than before

### Scenario 4: Token Limit Verification

1. After uploading any document, check the database:
   ```sql
   SELECT id, length(content) as char_count, content
   FROM chunks
   ORDER BY length(content) DESC
   LIMIT 5;
   ```
2. No chunk should contain more than approximately 400 characters of Chinese text (≈600 tokens)
