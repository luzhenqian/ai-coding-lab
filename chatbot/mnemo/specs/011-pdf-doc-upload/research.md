# Research: PDF & DOC/DOCX Upload Support

## Decision 1: PDF Text Extraction Library

**Decision**: Use `unpdf` (v1.4.0)

**Rationale**: Built by the UnJS team specifically for serverless environments. Zero native dependencies, pure JavaScript. Ships a serverless-optimized PDF.js build. `pdf-parse` (the most popular option) has a problematic dependency on `pdfjs-dist` which optionally loads `canvas` (a native C++ module), causing runtime failures on Vercel serverless.

**Alternatives considered**:
- `pdf-parse` (v2.4.5): Most downloaded (~2M/week) but `canvas` dependency causes issues on Vercel serverless. Well-documented failure mode.
- `pdfjs-dist` (v4.x): Full Mozilla PDF.js, ~2MB gzipped bundle hurts cold starts. Same `canvas` issue.

## Decision 2: DOCX Text Extraction Library

**Decision**: Use `mammoth` (v1.12.0)

**Rationale**: Well-maintained (1,142 commits), pure JavaScript, no native dependencies. `mammoth.extractRawText()` gives clean plain text output. Works fine on Vercel serverless.

**Alternatives considered**:
- `officeparser` (v6.0.4): Handles multiple formats but does NOT support legacy `.doc`. API changed significantly in v6.
- `docx-parser`: Less maintained, fewer downloads.

**Known issue**: Turbopack compatibility issue (Next.js #72863). Project uses `--turbopack` for dev server. May need webpack fallback if issues arise.

## Decision 3: Legacy DOC Text Extraction Library

**Decision**: Use `word-extractor` (v1.0.4)

**Rationale**: Only reliable pure-JS library for the old OLE-based `.doc` format. Works with Buffers, no native dependencies, Vercel-safe.

**Alternatives considered**:
- `mammoth`: Only supports `.docx`, NOT legacy `.doc`.
- `officeparser`: Does not support `.doc` either.

## Decision 4: Text Extraction Architecture

**Decision**: Move text extraction to the `after()` async block alongside chunking/embedding, using Buffer-based APIs.

**Rationale**: Binary files (.pdf, .doc, .docx) cannot use `file.text()` — they need `file.arrayBuffer()` to get a Buffer. Extraction can be CPU-intensive for large files, so running it in the background `after()` block (alongside existing chunking) keeps the upload response fast. The API route validates file type and size, creates the document record immediately, then delegates extraction + processing to the background.

**Alternatives considered**:
- Extract text synchronously before `after()`: Would block the response for large files, violating Constitution Principle IV (Async Non-Blocking).

## Summary of Dependencies

| Format | Library | Version | Native Deps |
|--------|---------|---------|-------------|
| PDF | unpdf | 1.4.0 | None |
| DOCX | mammoth | 1.12.0 | None |
| DOC | word-extractor | 1.0.4 | None |
