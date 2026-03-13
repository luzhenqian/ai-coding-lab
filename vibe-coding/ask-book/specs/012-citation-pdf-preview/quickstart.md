# Quickstart: Citation Click Opens PDF Preview

## Prerequisites

- PostgreSQL running with existing documents and chunks
- Dev server running (`pnpm dev`)
- At least one PDF document uploaded with file data stored
- At least one chat conversation with citations in the responses

## Test Scenarios

### Scenario 1: Click citation to open PDF at page

1. Open chat page, ask a question that produces citations (e.g., "公司的企业文化是什么？")
2. Wait for the AI response with citation tags at the bottom
3. Click a citation tag (e.g., "Noah员工手册_V2.0.pdf 第4页")
4. A new browser tab opens showing the PDF at page 4
5. Verify the page content matches what the citation references

### Scenario 2: Multiple citations open different pages

1. Get a response with multiple citation tags (different pages)
2. Click the first citation → new tab at page N
3. Click the second citation → another new tab at page M
4. Verify each tab shows the correct page

### Scenario 3: Citation for deleted document

1. Delete a document from the knowledge base
2. Go back to a previous conversation that had citations for that document
3. Click the citation tag
4. New tab opens but shows error message (document not found)

### Scenario 4: Mobile viewport

1. Open chat on mobile viewport
2. Citation tags should still be clickable
3. Tapping a citation opens the PDF in a new tab
