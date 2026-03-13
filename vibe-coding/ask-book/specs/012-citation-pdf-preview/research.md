# Research: Citation Click Opens PDF Preview

**Feature**: 012-citation-pdf-preview
**Date**: 2026-03-13

## Research Summary

Straightforward feature with no unknowns. All technologies already in use.

## Decisions

### 1. PDF Page Navigation Method

**Decision**: Use URL fragment `#page=N` appended to the PDF file URL.

**Rationale**: Standard approach supported by all major browsers' built-in PDF viewers (Chrome, Firefox, Safari, Edge). No JavaScript required — the browser handles page navigation natively.

**Alternatives considered**:
- pdf.js with custom page navigation: Over-engineering for this use case
- Embedding page parameter in query string: Not standard for PDF viewers

### 2. Document Lookup Strategy

**Decision**: Add a new API endpoint `GET /api/documents/by-filename?name=X` that returns the document ID. The citation component uses this to construct the preview URL.

**Rationale**: Citations only have `filename` (not `documentId`). We need to resolve filename → documentId to build `/api/documents/{id}/file#page=N`. A dedicated lookup endpoint keeps the logic server-side and avoids exposing document lists to the client.

**Alternatives considered**:
- Include documentId in SourceCitation type: Would require changing the chat API response, database schema for sources column, and all existing stored messages — too invasive
- Client-side document list lookup: Would require fetching all documents on the chat page just for citation links — wasteful

### 3. Link Behavior

**Decision**: Replace the citation `<button>` with an `<a>` tag that has `target="_blank"` and `rel="noopener noreferrer"`. Remove the expand/collapse detail panel.

**Rationale**: Using native `<a>` tag provides standard browser behavior: new tab on click, right-click context menu, middle-click support. The expand panel conflicts with the new click-to-navigate action.

**Alternatives considered**:
- Keep expand panel + add separate "open" button: Two actions on a small tag is confusing UX
- `window.open()` on button click: Less accessible than native `<a>` tag
