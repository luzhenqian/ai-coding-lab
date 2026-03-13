# Research: PDF Storage and In-Browser Preview

## R1: bytea vs External Storage for PDF Files

**Decision**: Use PostgreSQL `bytea` column directly on the `documents` table.

**Rationale**: For small-scale, single-user deployment with files under 20 MB, bytea is the simplest approach. No additional infrastructure (S3, MinIO) needed. PostgreSQL handles binary data efficiently at this scale. Drizzle ORM supports bytea via `customType` or raw `sql` column definition.

**Alternatives considered**:
- S3/MinIO: Overkill for single-user local deployment; adds infrastructure complexity
- PostgreSQL Large Objects: More complex API, harder to manage with ORM, no real benefit at this file size
- Filesystem storage: Introduces path management, backup complexity, not portable

## R2: Drizzle ORM bytea Column Support

**Decision**: Use `customType` from `drizzle-orm/pg-core` to define a bytea column that maps to `Buffer` in TypeScript.

**Rationale**: Drizzle ORM doesn't have a built-in `bytea()` column helper. The `customType` API allows defining custom column types with proper serialization/deserialization. The column maps `Buffer` ↔ bytea seamlessly.

**Alternatives considered**:
- Raw SQL migration only (skip ORM definition): Loses type safety, violates Constitution III
- Using `text` with base64 encoding: ~33% storage overhead, unnecessary complexity

## R3: In-Browser PDF Rendering

**Decision**: Use native browser PDF rendering via `<iframe>` with a blob URL, or direct `<object>` embed. No additional PDF.js viewer library needed.

**Rationale**: All modern browsers (Chrome, Firefox, Safari, Edge) have built-in PDF viewers. Serving the PDF binary with `Content-Type: application/pdf` and embedding in an `<iframe>` provides scroll, zoom, and page navigation for free. Falls back to download link if unsupported.

**Alternatives considered**:
- react-pdf / pdfjs-dist viewer: Adds dependency, more control but unnecessary complexity for basic preview
- pdf.js custom viewer: Full-featured but heavy, overkill for simple preview use case

## R4: File Retrieval API Design

**Decision**: New `GET /api/documents/[id]/file` endpoint that streams the bytea data with `Content-Type: application/pdf` and `Content-Disposition: inline`.

**Rationale**: RESTful sub-resource pattern (`/file` under document). `Content-Disposition: inline` tells the browser to display rather than download. Separate from the existing document metadata endpoint to keep concerns clean.

**Alternatives considered**:
- Query parameter on existing endpoint (`?format=file`): Mixes metadata and file serving
- Blob URL generation on server: Unnecessary; browser handles blob URL from fetched data

## R5: Preview UI Pattern

**Decision**: Full-screen modal overlay with close button and Escape key support. Uses `<iframe>` pointing to the file API endpoint.

**Rationale**: Consistent with the drawer-based UX pattern (feature 008). Modal overlay keeps user in context. `<iframe src="/api/documents/{id}/file">` leverages browser's native PDF viewer without fetching data client-side.

**Alternatives considered**:
- Drawer panel (like knowledge base): Too narrow for PDF viewing
- New page: Spec explicitly states modal/overlay approach
- Client-side blob URL: Extra fetch + memory; iframe with direct URL is simpler

## R6: Excluding file_data from List Queries

**Decision**: The `listDocuments` query must NOT select the `file_data` column. Use explicit column selection to avoid loading large binary data into memory when listing documents.

**Rationale**: Loading 20 MB bytea columns for every document in a list query would be catastrophic for performance and memory. Drizzle's `findMany` selects all columns by default, so we need to either use `select()` with explicit columns or add a `columns` option to exclude `file_data`.

**Alternatives considered**:
- Separate table for file data: Adds join complexity, harder to maintain cascade delete
- Always load everything: Memory and performance disaster
