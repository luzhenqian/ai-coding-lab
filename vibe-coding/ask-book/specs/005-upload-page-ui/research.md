# Research: Upload Page UI

## R1: Drag-and-Drop Implementation in React

**Decision**: Use native HTML5 Drag and Drop API with React event handlers (`onDragOver`, `onDragLeave`, `onDrop`) on a div element, combined with a hidden file input for click-to-select.

**Rationale**: The native API is sufficient for single-file drop zones. No need for a third-party library like `react-dropzone`. The implementation is straightforward: prevent default on dragover, toggle a CSS class for visual feedback, extract the file from `dataTransfer.files` on drop. A hidden `<input type="file">` handles click-to-select via `.click()` on the input ref.

**Alternatives considered**:
- `react-dropzone` library: Works well but adds a dependency. Constitution Principle IV (Simple Architecture) + YAGNI favors native implementation for a single drop zone.
- `<input type="file">` only: Functional but misses the drag-and-drop UX requirement.

## R2: Processing Status Display Strategy

**Decision**: Map backend document statuses to user-facing Chinese labels with descriptive substages: pending → "等待处理", processing → "解析中" / "向量化中", completed → "完成", failed → "处理失败".

**Rationale**: The backend has 4 statuses (pending, processing, completed, failed) but the spec wants 4 UI stages (上传中 → 解析中 → 向量化中 → 完成). "上传中" is handled by the client-side upload state. "解析中" and "向量化中" both correspond to backend "processing" status — we can show "处理中..." as a generic processing label since the backend doesn't distinguish parsing vs. embedding sub-stages. If we want more granularity later, the backend would need to expose sub-stages.

**Alternatives considered**:
- Add sub-stage field to documents table: Over-engineered for current needs; would require backend changes across features 001 and 002.
- Fake time-based substage progression: Misleading to users; the actual timing varies by document size.

## R3: Component Decomposition

**Decision**: Split the existing `upload-form.tsx` into two new components: `upload-zone.tsx` (file selection + upload initiation) and `upload-progress.tsx` (status tracking + completion/error display). Remove `upload-form.tsx`.

**Rationale**: The existing component mixes file selection, upload logic, polling, and status display — too many concerns. Splitting follows constitution Principle IV (one concern per file). The upload zone handles drag-and-drop, file validation, and upload fetch. The progress component handles polling and status display. Both are Client Components.

**Alternatives considered**:
- Keep single component: Already exists (feature 002) but mixes concerns and doesn't support drag-and-drop.
- Three components (zone + progress + status): Over-splitting; progress and status are the same concern.

## R4: Delete Confirmation UX

**Decision**: Use `window.confirm()` for delete confirmation rather than a custom modal.

**Rationale**: Constitution Principle IV (Simple Architecture, YAGNI). A native confirm dialog is adequate for a simple destructive action. It provides the required confirmation step without adding modal/dialog component complexity. If the design evolves to need a custom modal later, it can be refactored then.

**Alternatives considered**:
- Custom modal component: Over-engineered for a single confirmation use case.
- Inline confirmation (click once to show confirm button, click again to delete): More work, non-standard UX.

## R5: File Size Formatting

**Decision**: Create a `formatFileSize` utility in `src/lib/format.ts` that converts bytes to human-readable strings (e.g., "2.4 MB").

**Rationale**: This is used in the upload zone (showing selected file size) and potentially in the document list. Extracting it avoids duplication. Also add `formatDate` for consistent timestamp formatting in the document list.

**Alternatives considered**:
- Inline formatting: Duplicates logic across components.
- Third-party library (e.g., `filesize`): YAGNI — a 5-line function is sufficient.

## R6: Delete API Endpoint

**Decision**: Add a DELETE handler to the existing `src/app/api/documents/[id]/route.ts` file (which already has GET).

**Rationale**: REST convention — DELETE `/api/documents/:id` is the natural place. The existing `deleteDocument` query helper from feature 001 already handles cascade deletion of chunks via the FK `ON DELETE CASCADE` constraint. The handler validates the document exists, calls `deleteDocument`, and returns the deleted document or 404.

**Alternatives considered**:
- Separate route file: Unnecessary — the `[id]/route.ts` already handles this resource.
- Soft delete (mark as deleted): YAGNI — no requirement for trash/undelete functionality.
