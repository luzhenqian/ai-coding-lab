# Feature Specification: Vector Similarity Retrieval Module

**Feature Branch**: `003-vector-retrieval`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User description: "向量相似度检索模块 — retrieveRelevantChunks 函数"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrieve Relevant Chunks by Question (Priority: P1)

As a chat API consumer, I want to pass a natural-language question and receive the most semantically relevant text chunks from the uploaded employee handbooks, so that the downstream LLM can generate accurate, grounded answers.

**Why this priority**: This is the core and only purpose of the retrieval module — without it, the RAG chatbot cannot answer questions. Every other story builds on this capability.

**Independent Test**: Call `retrieveRelevantChunks("What is the company vacation policy?")` against a database pre-loaded with an employee handbook. Verify the returned chunks contain vacation-related content, each result includes similarity score, document filename, page number, and section title, and results are ordered by relevance (highest similarity first).

**Acceptance Scenarios**:

1. **Given** chunks from an employee handbook are stored in the database with embeddings, **When** a user question about vacation policy is passed to `retrieveRelevantChunks`, **Then** the function returns up to 5 chunks containing vacation-related content, each with a similarity score, document filename, page number, and section metadata, ordered by descending similarity.
2. **Given** chunks exist in the database, **When** a question is passed with a custom `topK` of 3, **Then** at most 3 results are returned.
3. **Given** chunks exist in the database, **When** a question is passed with a custom similarity threshold of 0.8, **Then** only chunks with similarity score >= 0.8 are returned, even if fewer than `topK`.

---

### User Story 2 - Filter Out Low-Relevance Results (Priority: P2)

As a chat API consumer, I want results below a configurable similarity threshold to be automatically excluded, so that the LLM does not receive irrelevant context that could degrade answer quality.

**Why this priority**: Threshold filtering directly impacts answer quality. Without it, the LLM may receive noisy, unrelated chunks and produce hallucinated or confusing responses.

**Independent Test**: Insert chunks with known content. Query with a question that is only partially related. Verify that chunks below the default threshold (0.7) are excluded from results, even if fewer than `topK` results remain. Verify that an empty array is returned when no chunks meet the threshold.

**Acceptance Scenarios**:

1. **Given** the database contains chunks with varying relevance to a query, **When** `retrieveRelevantChunks` is called with default threshold (0.7), **Then** only chunks with cosine similarity >= 0.7 are returned.
2. **Given** no chunks in the database are relevant to the query (all below 0.7 similarity), **When** `retrieveRelevantChunks` is called, **Then** an empty array is returned.
3. **Given** the caller specifies a custom threshold of 0.5, **When** `retrieveRelevantChunks` is called, **Then** chunks with similarity >= 0.5 are included.

---

### User Story 3 - Include Document Context in Results (Priority: P3)

As a chat API consumer, I want each retrieved chunk to include its source document's filename alongside chunk metadata (page number, section title), so that the chatbot can cite sources in its answers.

**Why this priority**: Source attribution is important for user trust but is secondary to the core retrieval and filtering functionality. The data is already available via the existing document-chunk relationship.

**Independent Test**: Upload two different PDFs. Query with a question relevant to content in both documents. Verify each returned chunk includes the correct source document filename, page number, and section title (or null if no section was detected).

**Acceptance Scenarios**:

1. **Given** chunks from multiple documents exist in the database, **When** `retrieveRelevantChunks` returns results, **Then** each result includes the `filename` of the source document, the `page` number, and the `section` title from chunk metadata.
2. **Given** a chunk has no section metadata (section is null), **When** it is returned as a result, **Then** the section field is `null` (not omitted or empty string).

---

### Edge Cases

- What happens when the database contains zero chunks? The function returns an empty array.
- What happens when the user question is an empty string? The function throws a descriptive error ("Question text cannot be empty").
- What happens when the embedding API is unavailable or returns an error? The function propagates the error with a clear message for the caller to handle.
- What happens when `topK` is set to 0 or a negative number? The function throws a validation error.
- What happens when all top-k results fall below the similarity threshold? The function returns an empty array.
- What happens when fewer chunks exist in the database than `topK`? The function returns all available chunks that meet the threshold.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a `retrieveRelevantChunks` function that accepts a question string and returns semantically relevant text chunks from the database.
- **FR-002**: System MUST convert the question string into an embedding vector using the same embedding model used for chunk storage (text-embedding-3-small, 1536 dimensions).
- **FR-003**: System MUST perform cosine similarity search against all chunk embeddings in the database and return results ordered by descending similarity.
- **FR-004**: System MUST accept an optional `topK` parameter (default: 5) to limit the maximum number of results returned.
- **FR-005**: System MUST accept an optional `similarityThreshold` parameter (default: 0.7) and exclude results with similarity scores below this threshold.
- **FR-006**: System MUST return each result with: chunk text content, cosine similarity score, source document filename, page number, and section title from metadata.
- **FR-007**: System MUST validate that the question string is non-empty, throwing a descriptive error if empty.
- **FR-008**: System MUST validate that `topK` is a positive integer, throwing a validation error otherwise.
- **FR-009**: System MUST return an empty array when no chunks meet the similarity threshold.
- **FR-010**: System MUST propagate embedding API errors with clear, descriptive error messages.

### Key Entities

- **RetrievalResult**: A single search result containing the chunk's text content, similarity score (0-1), source document filename, and chunk metadata (page number, section title). Represents one relevant passage found by the retrieval module.
- **RetrievalOptions**: Configuration for a retrieval query, including the maximum number of results (`topK`) and the minimum similarity score (`similarityThreshold`). Both have sensible defaults.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Retrieval function returns relevant results for a given question within 2 seconds under normal database load (< 10,000 chunks).
- **SC-002**: Results are correctly ordered by similarity — the first result is always the most relevant chunk.
- **SC-003**: 100% of results returned have a similarity score at or above the configured threshold.
- **SC-004**: Each result includes complete source attribution (document filename, page number, section title) enabling the chatbot to cite sources.
- **SC-005**: The function handles all edge cases (empty question, no matching chunks, API errors) without crashing or returning misleading results.

## Assumptions

- The existing `chunks` table with pgvector embeddings and HNSW index (from feature 001) is available.
- The existing `documents` table (from feature 001) contains the filename for each document.
- The `searchSimilarChunks` query helper (from feature 001) provides the low-level cosine similarity search and can be leveraged or extended.
- The `generateEmbeddings` function (from feature 002) or its underlying embedding model configuration can be reused for query embedding.
- Cosine similarity scores from pgvector's `<=>` operator range from 0 (identical) to 2 (opposite), so the similarity score returned to callers should be converted to a 0-1 scale where 1 = most similar.
