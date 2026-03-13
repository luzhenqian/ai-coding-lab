# Feature Specification: CJK-Compatible Text Chunker Rewrite

**Feature Branch**: `010-cjk-chunker-rewrite`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "重写文本分块器（chunker），使用gpt-tokenizer进行精确token计数替代基于空格的估算，采用递归分隔符策略支持中英文混合文本分块。分隔符优先级：段落→行→中文句号/英文句号→感叹号→问号→分号→逗号→顿号→空格→字符级。保留结构感知（中文标题检测），标题作为metadata附加到chunk。chunk大小512 tokens，overlap 20%。确保中文句末标点保留在前一句。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate Chunking of Chinese Documents (Priority: P1)

When a user uploads a Chinese PDF document (e.g., an employee handbook), the system splits the extracted text into appropriately-sized chunks that each contain a coherent segment of content. Each chunk stays within the token budget for the embedding model, and no content is lost or merged into oversized blocks. The chunking respects natural language boundaries — sentences are not split mid-thought, and punctuation stays with its preceding sentence.

**Why this priority**: This is the core problem. The current chunker produces only 3 chunks for a 20+ page Chinese handbook because it cannot measure Chinese text length. Without fixing this, the RAG chatbot cannot answer questions about most of the document content.

**Independent Test**: Upload a Chinese PDF with 20+ pages of content. Verify that the system produces a reasonable number of chunks (e.g., 30–80 for a typical handbook), each containing coherent Chinese text. Verify that no chunk exceeds the configured token limit, and that all document content is represented across the chunks.

**Acceptance Scenarios**:

1. **Given** a 20-page Chinese employee handbook is uploaded, **When** the text is chunked, **Then** the system produces at least 20 distinct chunks (not 3), and each chunk contains coherent Chinese text within the token limit.
2. **Given** Chinese text with punctuation like `。！？`, **When** text is split at these boundaries, **Then** the sentence-ending punctuation remains attached to the preceding sentence (not pushed to the start of the next chunk).
3. **Given** a document section with a heading like "第四章 加班管理制度", **When** the text is chunked, **Then** the heading is detected and stored as section metadata on the resulting chunks.
4. **Given** document content includes tables and lists, **When** the text is chunked, **Then** table rows and list items are kept together where possible (not split mid-row or mid-item).

---

### User Story 2 - Accurate Chunking of English and Mixed-Language Documents (Priority: P2)

When a user uploads an English or mixed Chinese-English document, the chunker produces correctly-sized chunks with the same quality as before. English text, code snippets, and mixed-language paragraphs are all handled gracefully without regression.

**Why this priority**: The system must remain fully functional for English documents. Many real-world documents contain a mix of Chinese and English (e.g., technical terms, brand names, bilingual policies).

**Independent Test**: Upload a purely English PDF and a mixed Chinese-English PDF. Verify that both produce reasonable chunk counts with coherent content, and that English text quality is equal to or better than before.

**Acceptance Scenarios**:

1. **Given** a 10-page English document is uploaded, **When** the text is chunked, **Then** the chunks are comparable in count and quality to the previous chunker (no regression).
2. **Given** a paragraph mixing Chinese and English (e.g., "员工须使用Company Portal提交申请"), **When** it is chunked, **Then** the mixed text is handled correctly without corrupting either language.
3. **Given** an English heading like "Chapter 4: Overtime Policy", **When** the text is chunked, **Then** the heading is detected and stored as section metadata.

---

### User Story 3 - Precise Token Counting (Priority: P3)

The system uses a real tokenizer to count tokens instead of rough estimation. This ensures that chunk sizes accurately reflect the embedding model's token budget, preventing both under-filled chunks (wasted context) and over-filled chunks (truncation risk).

**Why this priority**: Accurate token counting underpins both US1 and US2. It is listed separately because it delivers independent value — even with the old splitting logic, precise counting would improve chunk quality.

**Independent Test**: Compare token estimates from the old estimator vs. the new tokenizer on sample Chinese, English, and mixed text. Verify the new tokenizer produces accurate counts that align with the embedding model's actual tokenization.

**Acceptance Scenarios**:

1. **Given** a block of 100 Chinese characters, **When** tokens are counted, **Then** the result is approximately 150–200 tokens (not 1–2 as the old estimator produced).
2. **Given** a block of 100 English words, **When** tokens are counted, **Then** the result is approximately 130 tokens (consistent with prior behavior).
3. **Given** any chunk produced by the system, **When** its actual token count is measured, **Then** it does not exceed the configured maximum token limit.

---

### Edge Cases

- What if a single sentence in Chinese exceeds the maximum token limit (e.g., an extremely long run-on sentence)? The system should fall back to splitting at clause-level punctuation (commas, semicolons), then at character boundaries as a last resort.
- What if the document contains only whitespace or control characters after extraction? The system should produce zero chunks and not crash.
- What if the document is entirely English with no CJK characters? The chunker should still work correctly using the same recursive splitting logic.
- What if a heading-like string appears inside a table or quoted text? The system should use conservative heading detection to minimize false positives.
- What if the document contains mixed full-width and half-width punctuation (e.g., both `。` and `.`)? Both should be recognized as sentence boundaries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST use a real tokenizer for counting tokens, replacing the current whitespace-based estimation
- **FR-002**: The system MUST split text using a prioritized list of separators: paragraph breaks → line breaks → sentence-ending punctuation (Chinese and English) → clause-level punctuation → spaces → character-level fallback
- **FR-003**: The system MUST produce chunks that do not exceed the configured maximum token limit (default: 600 tokens hard max, 512 target)
- **FR-004**: The system MUST maintain approximately 20% overlap between consecutive chunks to preserve context continuity
- **FR-005**: The system MUST keep sentence-ending punctuation (`。！？.!?`) attached to the preceding sentence, not at the start of the next chunk
- **FR-006**: The system MUST detect Chinese document headings (e.g., "第X章", "一、", "1.1 标题") and store the detected heading as section metadata on the resulting chunks
- **FR-007**: The system MUST detect English document headings (e.g., "Chapter X", numbered sections, all-caps lines) and store them as section metadata
- **FR-008**: The system MUST handle mixed Chinese-English text without corrupting or incorrectly splitting either language
- **FR-009**: The system MUST produce zero chunks (without errors) when given empty or whitespace-only input
- **FR-010**: The system MUST preserve backward compatibility — the chunk output format (content + metadata with page and section) remains unchanged

### Key Entities

- **Text Chunk**: A segment of document text with associated metadata (page number, section heading). The content field contains the text; the metadata field contains the page number and the nearest preceding section heading.
- **Separator Hierarchy**: An ordered list of text boundaries used to split text, from coarsest (paragraph) to finest (character). The system attempts the coarsest separator first and falls back to finer separators only when a segment still exceeds the token limit.

### Assumptions

- The configured token limit (512 target, 600 hard max) is appropriate for the embedding models used by this project
- The tokenizer used for counting aligns with the encoding scheme of the target embedding model (or is a close approximation)
- Chinese documents primarily use simplified Chinese characters; traditional Chinese and Japanese kanji should also be handled but are not the primary target
- The system processes one document at a time; concurrent chunking performance is not a requirement

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A 20-page Chinese employee handbook produces at least 20 distinct chunks (up from the current 3), with each chunk containing coherent content
- **SC-002**: No chunk produced by the system exceeds the configured maximum token limit when measured by the tokenizer
- **SC-003**: The chatbot correctly answers questions about content from all sections of an uploaded Chinese document, including previously unretrievable sections (e.g., overtime policy in chapter 4)
- **SC-004**: English document chunking produces chunk counts and retrieval quality equal to or better than the previous implementation (no regression)
- **SC-005**: Processing time for chunking a 20-page document remains under 5 seconds
