# Research: CJK-Compatible Text Chunker Rewrite

## R1: Token Counting Library for Node.js/TypeScript

**Decision**: Use `gpt-tokenizer` (pure JS, cl100k_base encoding).

**Rationale**: Pure JavaScript with zero native dependencies — works in Next.js serverless and local dev without compilation. Fastest pure-JS tokenizer on npm (since v2.4.0). Supports `cl100k_base` encoding used by OpenAI embedding models. Accurate for both CJK and Latin text. Provides `encode()` for exact token count and `isWithinTokenLimit()` for quick limit checks.

**Alternatives considered**:
- `js-tiktoken`: Also pure JS, slightly larger bundle, similar API. `gpt-tokenizer` is more actively maintained.
- `tiktoken` (Python): Not applicable for Node.js.
- Character-based estimation (1.5 tokens/CJK char): Inaccurate for mixed text; we already tried estimation and it failed.
- `tokenx`: Fast estimation but not exact; still heuristic-based.

## R2: Recursive Separator Strategy for CJK Text

**Decision**: Implement a recursive character text splitter with CJK-aware separator hierarchy.

**Rationale**: Based on Microsoft's RAG chunking guidance and LangChain's `RecursiveCharacterTextSplitter` CJK variant. The strategy tries the coarsest separator first (paragraph breaks) and recursively falls back to finer separators when a segment exceeds the token limit. This naturally handles both Chinese (punctuation-delimited) and English (whitespace+punctuation-delimited) text.

**Separator hierarchy** (in priority order):
1. `\n\n` — paragraph breaks
2. `\n` — line breaks
3. `。` `．` — Chinese/full-width full stop
4. `.` — English full stop (with lookbehind to avoid splitting decimals)
5. `！` `!` — exclamation marks
6. `？` `?` — question marks
7. `；` `;` — semicolons
8. `，` `,` — commas
9. `、` — Chinese enumeration comma
10. ` ` — space
11. `""` — empty string (character-level fallback)

**Key implementation detail**: Use lookbehind regex to keep punctuation attached to the preceding segment, not pushed to the start of the next segment.

**Alternatives considered**:
- Sentence-only splitting: Too coarse for long Chinese sentences
- Fixed character-count splitting: Ignores semantic boundaries
- jieba word segmentation: Adds native dependency complexity; unnecessary when punctuation-based splitting is sufficient for document-level chunking

## R3: Chunk Size Parameters

**Decision**: TARGET_TOKENS = 512, MAX_TOKENS = 600, OVERLAP_TOKENS = 100 (≈20% of target).

**Rationale**: 512 tokens is the recommended chunk size for embedding models per latest RAG benchmarks (Firecrawl 2026, Pinecone). For Chinese text, 512 tokens ≈ 256–340 characters, which is enough to capture a complete paragraph or policy section. The 600 hard max provides a buffer to avoid splitting mid-sentence when slightly over target. 20% overlap (100 tokens) is higher than the typical English recommendation (10%) to compensate for CJK's higher information density per token.

**Alternatives considered**:
- 256 tokens: Too small for Chinese — a single policy section would be split into many fragments, losing context
- 1024 tokens: Too large — retrieval precision drops as chunks contain too many topics
- 10% overlap: Insufficient for CJK where concepts span fewer tokens

## R4: Heading Detection Patterns

**Decision**: Detect both Chinese and English heading patterns using conservative regex.

**Chinese patterns**:
- `第[一二三四五六七八九十\d]+[章节条款]` — "第四章", "第12条"
- `[一二三四五六七八九十]+[、.]` — "一、", "三."
- `（[一二三四五六七八九十\d]+）` — "（一）", "（3）"
- `\d+\.\d+\s` — "4.1 ", "1.2 "

**English patterns** (existing):
- `Chapter/Section/Part + number`
- `ALL CAPS lines` (with letter check)
- `\d+(\.\d+)* + text` — "1.1 Introduction"

**Guard**: Lines longer than 80 characters are never treated as headings. Lines inside table-like structures (containing `|` or multiple consecutive spaces/tabs) are excluded.

**Alternatives considered**:
- ML-based heading detection: Overkill for structured documents with predictable heading formats
- No heading detection: Loses valuable section metadata for retrieval
