# FlowBoard Kanban Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Kanban board with drag-and-drop, multi-board support, custom columns, rich cards, search/filter, archive, and keyboard shortcuts.

**Architecture:** Client-First — React useReducer + Context as source of truth, SQLite via better-sqlite3 as persistence layer. Next.js 16 App Router with API Routes for CRUD. dnd-kit for all drag-and-drop interactions.

**Tech Stack:** Next.js 16, React 19, TailwindCSS 4, @dnd-kit/core + @dnd-kit/sortable, better-sqlite3, nanoid

---

## File Structure

```
flow-board/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── board/[id]/page.tsx
│   │   └── api/
│   │       ├── boards/route.ts
│   │       ├── boards/[id]/route.ts
│   │       ├── columns/route.ts
│   │       ├── columns/[id]/route.ts
│   │       ├── cards/route.ts
│   │       ├── cards/[id]/route.ts
│   │       ├── cards/[id]/archive/route.ts
│   │       ├── tags/route.ts
│   │       ├── tags/[id]/route.ts
│   │       ├── checklist/route.ts
│   │       ├── checklist/[id]/route.ts
│   │       └── sync/route.ts
│   ├── components/
│   │   ├── board/BoardList.tsx
│   │   ├── board/BoardView.tsx
│   │   ├── board/Column.tsx
│   │   ├── board/ColumnHeader.tsx
│   │   ├── card/CardItem.tsx
│   │   ├── card/CardDetail.tsx
│   │   ├── card/Checklist.tsx
│   │   ├── card/TagBadge.tsx
│   │   ├── dnd/DndBoardContext.tsx
│   │   ├── dnd/DndKanbanContext.tsx
│   │   ├── ui/Modal.tsx
│   │   ├── ui/ColorPicker.tsx
│   │   ├── ui/SearchBar.tsx
│   │   ├── ui/FilterPanel.tsx
│   │   ├── ui/ConfirmDialog.tsx
│   │   └── layout/Header.tsx
│   │   └── layout/Sidebar.tsx
│   ├── hooks/
│   │   ├── useBoard.ts
│   │   ├── useSync.ts
│   │   ├── useSearch.ts
│   │   └── useKeyboard.ts
│   ├── lib/
│   │   ├── db.ts
│   │   ├── schema.ts
│   │   └── actions.ts
│   └── types/index.ts
├── __tests__/
│   ├── lib/actions.test.ts
│   ├── hooks/useBoard.test.ts
│   └── api/boards.test.ts
├── database.db
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

### Task 1: Project Setup & Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/noah/Work/idea/ai-coding-lab/vibe-coding/flow-board
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities better-sqlite3 nanoid
npm install -D @types/better-sqlite3 vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Add vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Add test script to package.json**

Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Update .gitignore**

Append:
```
database.db
.superpowers/
```

- [ ] **Step 6: Set up dark theme in layout.tsx**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowBoard",
  description: "Personal Kanban Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#1a1a2e] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Replace globals.css with dark theme base**

Replace `src/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-card: #1a1a2e;
  --border-color: #2a2a4a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent-blue: #3b82f6;
  --accent-green: #22c55e;
  --accent-purple: #8b5cf6;
  --accent-amber: #f59e0b;
  --accent-red: #ef4444;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Scrollbar styling for dark theme */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3a3a5a;
}
```

- [ ] **Step 8: Set placeholder home page**

Replace `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">FlowBoard</h1>
    </main>
  );
}
```

- [ ] **Step 9: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts, page shows "FlowBoard" on dark background at http://localhost:3000

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with dark theme and dependencies"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Define all types**

Create `src/types/index.ts`:
```typescript
export interface Board {
  id: string;
  title: string;
  position: number;
  createdAt: number;
  updatedAt: number;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string;
  position: number;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string;
  color: string;
  priority: Priority;
  dueDate: number | null;
  position: number;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CardTag {
  cardId: string;
  tagId: string;
}

export interface ChecklistItem {
  id: string;
  cardId: string;
  text: string;
  checked: boolean;
  position: number;
}

// Rich card with relations loaded
export interface CardWithRelations extends Card {
  tags: Tag[];
  checklist: ChecklistItem[];
}

// Board with columns and cards loaded
export interface BoardWithData extends Board {
  columns: ColumnWithCards[];
}

export interface ColumnWithCards extends Column {
  cards: CardWithRelations[];
}

// State types
export interface BoardState {
  boards: Board[];
  currentBoard: BoardWithData | null;
  tags: Tag[];
}

// Reducer actions
export type BoardAction =
  // Boards
  | { type: 'SET_BOARDS'; boards: Board[] }
  | { type: 'ADD_BOARD'; board: Board }
  | { type: 'UPDATE_BOARD'; id: string; changes: Partial<Board> }
  | { type: 'DELETE_BOARD'; id: string }
  | { type: 'REORDER_BOARDS'; activeId: string; overId: string }
  // Current board data
  | { type: 'SET_CURRENT_BOARD'; board: BoardWithData }
  | { type: 'CLEAR_CURRENT_BOARD' }
  // Columns
  | { type: 'ADD_COLUMN'; column: Column }
  | { type: 'UPDATE_COLUMN'; id: string; changes: Partial<Column> }
  | { type: 'DELETE_COLUMN'; id: string }
  | { type: 'REORDER_COLUMNS'; activeId: string; overId: string }
  // Cards
  | { type: 'ADD_CARD'; columnId: string; card: CardWithRelations }
  | { type: 'UPDATE_CARD'; id: string; changes: Partial<Card> }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'MOVE_CARD'; cardId: string; fromColumnId: string; toColumnId: string; toIndex: number }
  | { type: 'ARCHIVE_CARD'; id: string }
  | { type: 'RESTORE_CARD'; id: string; toColumnId: string }
  // Tags
  | { type: 'SET_TAGS'; tags: Tag[] }
  | { type: 'ADD_TAG'; tag: Tag }
  | { type: 'DELETE_TAG'; id: string }
  | { type: 'ADD_CARD_TAG'; cardId: string; tagId: string }
  | { type: 'REMOVE_CARD_TAG'; cardId: string; tagId: string }
  // Checklist
  | { type: 'ADD_CHECKLIST_ITEM'; cardId: string; item: ChecklistItem }
  | { type: 'UPDATE_CHECKLIST_ITEM'; id: string; changes: Partial<ChecklistItem> }
  | { type: 'DELETE_CHECKLIST_ITEM'; cardId: string; itemId: string }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; cardId: string; itemId: string };

// Search & filter
export interface FilterState {
  search: string;
  tags: string[];
  priorities: Priority[];
  colors: string[];
  dueDateFilter: 'all' | 'overdue' | 'today' | 'this-week';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 3: Database Layer

**Files:**
- Create: `src/lib/schema.ts`, `src/lib/db.ts`, `src/lib/actions.ts`
- Create: `__tests__/lib/actions.test.ts`

- [ ] **Step 1: Write schema**

Create `src/lib/schema.ts`:
```typescript
export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#8b5cf6'
  );

  CREATE TABLE IF NOT EXISTS card_tags (
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0
  );
`;
```

- [ ] **Step 2: Write db connection**

Create `src/lib/db.ts`:
```typescript
import Database from 'better-sqlite3';
import path from 'path';
import { SCHEMA } from './schema';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'database.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA);
  }
  return db;
}
```

- [ ] **Step 3: Write failing tests for board actions**

Create `__tests__/lib/actions.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA } from '@/lib/schema';
import {
  createBoard, getBoards, updateBoard, deleteBoard,
  createColumn, getColumnsWithCards, updateColumn, deleteColumn,
  createCard, updateCard, deleteCard, archiveCard, restoreCard,
  createTag, getTags, deleteTag, addCardTag, removeCardTag,
  createChecklistItem, updateChecklistItem, deleteChecklistItem,
  getBoardWithData,
} from '@/lib/actions';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

describe('Board actions', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
  });

  it('creates and retrieves boards', () => {
    const board = createBoard(db, 'Test Board');
    expect(board.title).toBe('Test Board');
    expect(board.id).toBeDefined();

    const boards = getBoards(db);
    expect(boards).toHaveLength(1);
    expect(boards[0].title).toBe('Test Board');
  });

  it('updates a board', () => {
    const board = createBoard(db, 'Old Title');
    const updated = updateBoard(db, board.id, { title: 'New Title' });
    expect(updated.title).toBe('New Title');
  });

  it('deletes a board and cascades', () => {
    const board = createBoard(db, 'Delete Me');
    const col = createColumn(db, board.id, 'Col');
    createCard(db, col.id, { title: 'Card' });

    deleteBoard(db, board.id);
    expect(getBoards(db)).toHaveLength(0);
  });

  it('creates columns with position auto-increment', () => {
    const board = createBoard(db, 'Board');
    const col1 = createColumn(db, board.id, 'First');
    const col2 = createColumn(db, board.id, 'Second');
    expect(col1.position).toBe(0);
    expect(col2.position).toBe(1);
  });

  it('creates cards with tags and checklist via getBoardWithData', () => {
    const board = createBoard(db, 'Board');
    const col = createColumn(db, board.id, 'Todo');
    const card = createCard(db, col.id, { title: 'Task 1' });
    const tag = createTag(db, 'Bug', '#ef4444');
    addCardTag(db, card.id, tag.id);
    createChecklistItem(db, card.id, 'Step 1');

    const data = getBoardWithData(db, board.id);
    expect(data).not.toBeNull();
    expect(data!.columns).toHaveLength(1);
    expect(data!.columns[0].cards).toHaveLength(1);
    expect(data!.columns[0].cards[0].tags).toHaveLength(1);
    expect(data!.columns[0].cards[0].tags[0].name).toBe('Bug');
    expect(data!.columns[0].cards[0].checklist).toHaveLength(1);
  });

  it('archives and restores cards', () => {
    const board = createBoard(db, 'Board');
    const col = createColumn(db, board.id, 'Todo');
    const card = createCard(db, col.id, { title: 'Archive me' });

    archiveCard(db, card.id);
    const data1 = getBoardWithData(db, board.id);
    expect(data1!.columns[0].cards).toHaveLength(0);

    restoreCard(db, card.id, col.id);
    const data2 = getBoardWithData(db, board.id);
    expect(data2!.columns[0].cards).toHaveLength(1);
  });

  it('manages tags', () => {
    const tag = createTag(db, 'Feature', '#22c55e');
    expect(getTags(db)).toHaveLength(1);
    deleteTag(db, tag.id);
    expect(getTags(db)).toHaveLength(0);
  });

  it('manages checklist items', () => {
    const board = createBoard(db, 'Board');
    const col = createColumn(db, board.id, 'Todo');
    const card = createCard(db, col.id, { title: 'Task' });
    const item = createChecklistItem(db, card.id, 'Step 1');

    updateChecklistItem(db, item.id, { checked: true });
    const data = getBoardWithData(db, board.id);
    expect(data!.columns[0].cards[0].checklist[0].checked).toBe(true);

    deleteChecklistItem(db, item.id);
    const data2 = getBoardWithData(db, board.id);
    expect(data2!.columns[0].cards[0].checklist).toHaveLength(0);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run __tests__/lib/actions.test.ts`
Expected: FAIL — functions not exported from `@/lib/actions`

- [ ] **Step 5: Implement actions**

Create `src/lib/actions.ts`:
```typescript
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import type {
  Board, Column, Card, Tag, ChecklistItem,
  CardWithRelations, ColumnWithCards, BoardWithData,
} from '@/types';

// ─── Boards ───

export function createBoard(db: Database.Database, title: string): Board {
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM boards').get() as { max: number };
  db.prepare(
    'INSERT INTO boards (id, title, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, title, maxPos.max + 1, now, now);
  return { id, title, position: maxPos.max + 1, createdAt: now, updatedAt: now };
}

export function getBoards(db: Database.Database): Board[] {
  const rows = db.prepare('SELECT * FROM boards ORDER BY position ASC').all() as any[];
  return rows.map(r => ({
    id: r.id, title: r.title, position: r.position,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}

export function updateBoard(db: Database.Database, id: string, changes: Partial<Board>): Board {
  const now = Math.floor(Date.now() / 1000);
  if (changes.title !== undefined) {
    db.prepare('UPDATE boards SET title = ?, updated_at = ? WHERE id = ?').run(changes.title, now, id);
  }
  if (changes.position !== undefined) {
    db.prepare('UPDATE boards SET position = ?, updated_at = ? WHERE id = ?').run(changes.position, now, id);
  }
  const row = db.prepare('SELECT * FROM boards WHERE id = ?').get(id) as any;
  return { id: row.id, title: row.title, position: row.position, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function deleteBoard(db: Database.Database, id: string): void {
  db.prepare('DELETE FROM boards WHERE id = ?').run(id);
}

// ─── Columns ───

export function createColumn(db: Database.Database, boardId: string, title: string, color = '#3b82f6'): Column {
  const id = nanoid();
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM columns WHERE board_id = ?').get(boardId) as { max: number };
  db.prepare('INSERT INTO columns (id, board_id, title, color, position) VALUES (?, ?, ?, ?, ?)').run(id, boardId, title, color, maxPos.max + 1);
  return { id, boardId, title, color, position: maxPos.max + 1 };
}

export function getColumnsWithCards(db: Database.Database, boardId: string): ColumnWithCards[] {
  const cols = db.prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC').all(boardId) as any[];
  return cols.map(c => ({
    id: c.id, boardId: c.board_id, title: c.title, color: c.color, position: c.position,
    cards: getCardsForColumn(db, c.id),
  }));
}

export function updateColumn(db: Database.Database, id: string, changes: Partial<Column>): Column {
  if (changes.title !== undefined) db.prepare('UPDATE columns SET title = ? WHERE id = ?').run(changes.title, id);
  if (changes.color !== undefined) db.prepare('UPDATE columns SET color = ? WHERE id = ?').run(changes.color, id);
  if (changes.position !== undefined) db.prepare('UPDATE columns SET position = ? WHERE id = ?').run(changes.position, id);
  const row = db.prepare('SELECT * FROM columns WHERE id = ?').get(id) as any;
  return { id: row.id, boardId: row.board_id, title: row.title, color: row.color, position: row.position };
}

export function deleteColumn(db: Database.Database, id: string): void {
  db.prepare('DELETE FROM columns WHERE id = ?').run(id);
}

// ─── Cards ───

function getCardsForColumn(db: Database.Database, columnId: string): CardWithRelations[] {
  const rows = db.prepare(
    'SELECT * FROM cards WHERE column_id = ? AND archived = 0 ORDER BY position ASC'
  ).all(columnId) as any[];
  return rows.map(r => ({
    ...mapCard(r),
    tags: getCardTags(db, r.id),
    checklist: getCardChecklist(db, r.id),
  }));
}

function mapCard(r: any): Card {
  return {
    id: r.id, columnId: r.column_id, title: r.title, description: r.description,
    color: r.color, priority: r.priority, dueDate: r.due_date,
    position: r.position, archived: Boolean(r.archived),
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function createCard(db: Database.Database, columnId: string, data: Partial<Card>): CardWithRelations {
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM cards WHERE column_id = ?').get(columnId) as { max: number };
  db.prepare(`
    INSERT INTO cards (id, column_id, title, description, color, priority, due_date, position, archived, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id, columnId,
    data.title || 'Untitled',
    data.description || '',
    data.color || '#3b82f6',
    data.priority || 'medium',
    data.dueDate || null,
    maxPos.max + 1,
    now, now
  );
  return {
    id, columnId, title: data.title || 'Untitled', description: data.description || '',
    color: data.color || '#3b82f6', priority: data.priority || 'medium',
    dueDate: data.dueDate || null, position: maxPos.max + 1,
    archived: false, createdAt: now, updatedAt: now,
    tags: [], checklist: [],
  };
}

export function updateCard(db: Database.Database, id: string, changes: Partial<Card>): Card {
  const now = Math.floor(Date.now() / 1000);
  const fields: string[] = [];
  const values: any[] = [];

  if (changes.title !== undefined) { fields.push('title = ?'); values.push(changes.title); }
  if (changes.description !== undefined) { fields.push('description = ?'); values.push(changes.description); }
  if (changes.color !== undefined) { fields.push('color = ?'); values.push(changes.color); }
  if (changes.priority !== undefined) { fields.push('priority = ?'); values.push(changes.priority); }
  if (changes.dueDate !== undefined) { fields.push('due_date = ?'); values.push(changes.dueDate); }
  if (changes.position !== undefined) { fields.push('position = ?'); values.push(changes.position); }
  if (changes.columnId !== undefined) { fields.push('column_id = ?'); values.push(changes.columnId); }

  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);
    db.prepare(`UPDATE cards SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as any;
  return mapCard(row);
}

export function deleteCard(db: Database.Database, id: string): void {
  db.prepare('DELETE FROM cards WHERE id = ?').run(id);
}

export function archiveCard(db: Database.Database, id: string): void {
  const now = Math.floor(Date.now() / 1000);
  db.prepare('UPDATE cards SET archived = 1, updated_at = ? WHERE id = ?').run(now, id);
}

export function restoreCard(db: Database.Database, id: string, columnId: string): void {
  const now = Math.floor(Date.now() / 1000);
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM cards WHERE column_id = ?').get(columnId) as { max: number };
  db.prepare('UPDATE cards SET archived = 0, column_id = ?, position = ?, updated_at = ? WHERE id = ?').run(columnId, maxPos.max + 1, now, id);
}

export function getArchivedCards(db: Database.Database, boardId: string): CardWithRelations[] {
  const rows = db.prepare(`
    SELECT c.* FROM cards c
    JOIN columns col ON c.column_id = col.id
    WHERE col.board_id = ? AND c.archived = 1
    ORDER BY c.updated_at DESC
  `).all(boardId) as any[];
  return rows.map(r => ({
    ...mapCard(r),
    tags: getCardTags(db, r.id),
    checklist: getCardChecklist(db, r.id),
  }));
}

// ─── Tags ───

function getCardTags(db: Database.Database, cardId: string): Tag[] {
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN card_tags ct ON t.id = ct.tag_id
    WHERE ct.card_id = ?
  `).all(cardId) as Tag[];
}

function getCardChecklist(db: Database.Database, cardId: string): ChecklistItem[] {
  const rows = db.prepare(
    'SELECT * FROM checklist_items WHERE card_id = ? ORDER BY position ASC'
  ).all(cardId) as any[];
  return rows.map(r => ({
    id: r.id, cardId: r.card_id, text: r.text,
    checked: Boolean(r.checked), position: r.position,
  }));
}

export function createTag(db: Database.Database, name: string, color: string): Tag {
  const id = nanoid();
  db.prepare('INSERT INTO tags (id, name, color) VALUES (?, ?, ?)').run(id, name, color);
  return { id, name, color };
}

export function getTags(db: Database.Database): Tag[] {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all() as Tag[];
}

export function deleteTag(db: Database.Database, id: string): void {
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
}

export function addCardTag(db: Database.Database, cardId: string, tagId: string): void {
  db.prepare('INSERT OR IGNORE INTO card_tags (card_id, tag_id) VALUES (?, ?)').run(cardId, tagId);
}

export function removeCardTag(db: Database.Database, cardId: string, tagId: string): void {
  db.prepare('DELETE FROM card_tags WHERE card_id = ? AND tag_id = ?').run(cardId, tagId);
}

// ─── Checklist ───

export function createChecklistItem(db: Database.Database, cardId: string, text: string): ChecklistItem {
  const id = nanoid();
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM checklist_items WHERE card_id = ?').get(cardId) as { max: number };
  db.prepare('INSERT INTO checklist_items (id, card_id, text, checked, position) VALUES (?, ?, ?, 0, ?)').run(id, cardId, text, maxPos.max + 1);
  return { id, cardId, text, checked: false, position: maxPos.max + 1 };
}

export function updateChecklistItem(db: Database.Database, id: string, changes: Partial<ChecklistItem>): ChecklistItem {
  if (changes.text !== undefined) db.prepare('UPDATE checklist_items SET text = ? WHERE id = ?').run(changes.text, id);
  if (changes.checked !== undefined) db.prepare('UPDATE checklist_items SET checked = ? WHERE id = ?').run(changes.checked ? 1 : 0, id);
  if (changes.position !== undefined) db.prepare('UPDATE checklist_items SET position = ? WHERE id = ?').run(changes.position, id);
  const row = db.prepare('SELECT * FROM checklist_items WHERE id = ?').get(id) as any;
  return { id: row.id, cardId: row.card_id, text: row.text, checked: Boolean(row.checked), position: row.position };
}

export function deleteChecklistItem(db: Database.Database, id: string): void {
  db.prepare('DELETE FROM checklist_items WHERE id = ?').run(id);
}

// ─── Composite ───

export function getBoardWithData(db: Database.Database, boardId: string): BoardWithData | null {
  const row = db.prepare('SELECT * FROM boards WHERE id = ?').get(boardId) as any;
  if (!row) return null;
  return {
    id: row.id, title: row.title, position: row.position,
    createdAt: row.created_at, updatedAt: row.updated_at,
    columns: getColumnsWithCards(db, boardId),
  };
}

// ─── Batch position update ───

export function updatePositions(db: Database.Database, table: string, items: { id: string; position: number; columnId?: string }[]): void {
  const updatePos = table === 'cards'
    ? db.prepare(`UPDATE cards SET position = ?, column_id = COALESCE(?, column_id), updated_at = ? WHERE id = ?`)
    : db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);

  const now = Math.floor(Date.now() / 1000);
  const transaction = db.transaction(() => {
    for (const item of items) {
      if (table === 'cards') {
        updatePos.run(item.position, item.columnId || null, now, item.id);
      } else {
        updatePos.run(item.position, item.id);
      }
    }
  });
  transaction();
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run __tests__/lib/actions.test.ts`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/ __tests__/lib/ src/types/index.ts
git commit -m "feat: add database schema, connection, and CRUD actions with tests"
```

---

### Task 4: API Routes

**Files:**
- Create: `src/app/api/boards/route.ts`, `src/app/api/boards/[id]/route.ts`
- Create: `src/app/api/columns/route.ts`, `src/app/api/columns/[id]/route.ts`
- Create: `src/app/api/cards/route.ts`, `src/app/api/cards/[id]/route.ts`, `src/app/api/cards/[id]/archive/route.ts`
- Create: `src/app/api/tags/route.ts`, `src/app/api/tags/[id]/route.ts`
- Create: `src/app/api/checklist/route.ts`, `src/app/api/checklist/[id]/route.ts`
- Create: `src/app/api/sync/route.ts`

- [ ] **Step 1: Boards API**

Create `src/app/api/boards/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getBoards, createBoard, updatePositions } from '@/lib/actions';

export async function GET() {
  const boards = getBoards(getDb());
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  const board = createBoard(getDb(), title);
  return NextResponse.json(board, { status: 201 });
}

export async function PUT(req: Request) {
  const { items } = await req.json();
  updatePositions(getDb(), 'boards', items);
  return NextResponse.json({ ok: true });
}
```

Create `src/app/api/boards/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateBoard, deleteBoard, getBoardWithData } from '@/lib/actions';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const board = getBoardWithData(getDb(), id);
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(board);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const board = updateBoard(getDb(), id, changes);
  return NextResponse.json(board);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteBoard(getDb(), id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Columns API**

Create `src/app/api/columns/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createColumn, updatePositions } from '@/lib/actions';

export async function POST(req: Request) {
  const { boardId, title, color } = await req.json();
  const column = createColumn(getDb(), boardId, title, color);
  return NextResponse.json(column, { status: 201 });
}

export async function PUT(req: Request) {
  const { items } = await req.json();
  updatePositions(getDb(), 'columns', items);
  return NextResponse.json({ ok: true });
}
```

Create `src/app/api/columns/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateColumn, deleteColumn } from '@/lib/actions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const column = updateColumn(getDb(), id, changes);
  return NextResponse.json(column);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteColumn(getDb(), id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Cards API**

Create `src/app/api/cards/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createCard, updatePositions } from '@/lib/actions';

export async function POST(req: Request) {
  const { columnId, ...data } = await req.json();
  const card = createCard(getDb(), columnId, data);
  return NextResponse.json(card, { status: 201 });
}

export async function PUT(req: Request) {
  const { items } = await req.json();
  updatePositions(getDb(), 'cards', items);
  return NextResponse.json({ ok: true });
}
```

Create `src/app/api/cards/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateCard, deleteCard } from '@/lib/actions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const card = updateCard(getDb(), id, changes);
  return NextResponse.json(card);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteCard(getDb(), id);
  return NextResponse.json({ ok: true });
}
```

Create `src/app/api/cards/[id]/archive/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { archiveCard, restoreCard, getArchivedCards } from '@/lib/actions';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, columnId } = await req.json();
  if (action === 'restore') {
    restoreCard(getDb(), id, columnId);
  } else {
    archiveCard(getDb(), id);
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Tags API**

Create `src/app/api/tags/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTags, createTag, addCardTag, removeCardTag } from '@/lib/actions';

export async function GET() {
  return NextResponse.json(getTags(getDb()));
}

export async function POST(req: Request) {
  const { name, color, cardId, tagId, action } = await req.json();
  if (action === 'link') {
    addCardTag(getDb(), cardId, tagId);
    return NextResponse.json({ ok: true });
  }
  if (action === 'unlink') {
    removeCardTag(getDb(), cardId, tagId);
    return NextResponse.json({ ok: true });
  }
  const tag = createTag(getDb(), name, color);
  return NextResponse.json(tag, { status: 201 });
}
```

Create `src/app/api/tags/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { deleteTag } from '@/lib/actions';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteTag(getDb(), id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Checklist API**

Create `src/app/api/checklist/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createChecklistItem } from '@/lib/actions';

export async function POST(req: Request) {
  const { cardId, text } = await req.json();
  const item = createChecklistItem(getDb(), cardId, text);
  return NextResponse.json(item, { status: 201 });
}
```

Create `src/app/api/checklist/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateChecklistItem, deleteChecklistItem } from '@/lib/actions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const item = updateChecklistItem(getDb(), id, changes);
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteChecklistItem(getDb(), id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Sync API (archived cards)**

Create `src/app/api/sync/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getArchivedCards } from '@/lib/actions';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get('boardId');
  if (!boardId) return NextResponse.json({ error: 'boardId required' }, { status: 400 });
  const archived = getArchivedCards(getDb(), boardId);
  return NextResponse.json({ archived });
}
```

- [ ] **Step 7: Verify build compiles**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 8: Commit**

```bash
git add src/app/api/
git commit -m "feat: add REST API routes for boards, columns, cards, tags, and checklist"
```

---

### Task 5: State Management — Reducer & Context

**Files:**
- Create: `src/hooks/useBoard.ts`
- Create: `__tests__/hooks/useBoard.test.ts`

- [ ] **Step 1: Write failing tests for reducer**

Create `__tests__/hooks/useBoard.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { boardReducer, initialState } from '@/hooks/useBoard';
import type { BoardState, Board, ColumnWithCards, BoardWithData, CardWithRelations } from '@/types';

const makeBoard = (id: string, title: string, pos: number): Board => ({
  id, title, position: pos, createdAt: 0, updatedAt: 0,
});

const makeCard = (id: string, columnId: string, pos: number): CardWithRelations => ({
  id, columnId, title: `Card ${id}`, description: '', color: '#3b82f6',
  priority: 'medium', dueDate: null, position: pos, archived: false,
  createdAt: 0, updatedAt: 0, tags: [], checklist: [],
});

const makeColumn = (id: string, boardId: string, pos: number, cards: CardWithRelations[] = []): ColumnWithCards => ({
  id, boardId, title: `Col ${id}`, color: '#3b82f6', position: pos, cards,
});

describe('boardReducer', () => {
  it('SET_BOARDS replaces board list', () => {
    const boards = [makeBoard('1', 'A', 0), makeBoard('2', 'B', 1)];
    const state = boardReducer(initialState, { type: 'SET_BOARDS', boards });
    expect(state.boards).toHaveLength(2);
  });

  it('ADD_BOARD appends a board', () => {
    const state = boardReducer(initialState, { type: 'ADD_BOARD', board: makeBoard('1', 'New', 0) });
    expect(state.boards).toHaveLength(1);
  });

  it('DELETE_BOARD removes a board', () => {
    const s1 = boardReducer(initialState, { type: 'ADD_BOARD', board: makeBoard('1', 'A', 0) });
    const s2 = boardReducer(s1, { type: 'DELETE_BOARD', id: '1' });
    expect(s2.boards).toHaveLength(0);
  });

  it('REORDER_BOARDS swaps positions', () => {
    let state = boardReducer(initialState, { type: 'SET_BOARDS', boards: [makeBoard('a', 'A', 0), makeBoard('b', 'B', 1)] });
    state = boardReducer(state, { type: 'REORDER_BOARDS', activeId: 'a', overId: 'b' });
    expect(state.boards[0].id).toBe('b');
    expect(state.boards[1].id).toBe('a');
  });

  it('ADD_COLUMN adds to current board', () => {
    const board: BoardWithData = { ...makeBoard('b1', 'Board', 0), columns: [] };
    let state = boardReducer({ ...initialState, currentBoard: board }, {
      type: 'ADD_COLUMN', column: makeColumn('c1', 'b1', 0),
    });
    expect(state.currentBoard!.columns).toHaveLength(1);
  });

  it('MOVE_CARD moves card between columns', () => {
    const card = makeCard('card1', 'col1', 0);
    const board: BoardWithData = {
      ...makeBoard('b1', 'Board', 0),
      columns: [
        makeColumn('col1', 'b1', 0, [card]),
        makeColumn('col2', 'b1', 1, []),
      ],
    };
    let state: BoardState = { ...initialState, currentBoard: board };
    state = boardReducer(state, { type: 'MOVE_CARD', cardId: 'card1', fromColumnId: 'col1', toColumnId: 'col2', toIndex: 0 });
    expect(state.currentBoard!.columns[0].cards).toHaveLength(0);
    expect(state.currentBoard!.columns[1].cards).toHaveLength(1);
    expect(state.currentBoard!.columns[1].cards[0].columnId).toBe('col2');
  });

  it('ARCHIVE_CARD removes card from column', () => {
    const card = makeCard('card1', 'col1', 0);
    const board: BoardWithData = {
      ...makeBoard('b1', 'Board', 0),
      columns: [makeColumn('col1', 'b1', 0, [card])],
    };
    let state: BoardState = { ...initialState, currentBoard: board };
    state = boardReducer(state, { type: 'ARCHIVE_CARD', id: 'card1' });
    expect(state.currentBoard!.columns[0].cards).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/hooks/useBoard.test.ts`
Expected: FAIL — `boardReducer` not found

- [ ] **Step 3: Implement reducer and context**

Create `src/hooks/useBoard.ts`:
```typescript
'use client';

import { createContext, useContext, useReducer, type Dispatch } from 'react';
import type { BoardState, BoardAction, ColumnWithCards } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';

export const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  tags: [],
};

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    // ─── Boards ───
    case 'SET_BOARDS':
      return { ...state, boards: action.boards };

    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.board] };

    case 'UPDATE_BOARD': {
      return {
        ...state,
        boards: state.boards.map(b => b.id === action.id ? { ...b, ...action.changes } : b),
        currentBoard: state.currentBoard?.id === action.id
          ? { ...state.currentBoard, ...action.changes }
          : state.currentBoard,
      };
    }

    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(b => b.id !== action.id),
        currentBoard: state.currentBoard?.id === action.id ? null : state.currentBoard,
      };

    case 'REORDER_BOARDS': {
      const oldIndex = state.boards.findIndex(b => b.id === action.activeId);
      const newIndex = state.boards.findIndex(b => b.id === action.overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const reordered = arrayMove(state.boards, oldIndex, newIndex).map((b, i) => ({ ...b, position: i }));
      return { ...state, boards: reordered };
    }

    // ─── Current Board ───
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.board };

    case 'CLEAR_CURRENT_BOARD':
      return { ...state, currentBoard: null };

    // ─── Columns ───
    case 'ADD_COLUMN': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: [...state.currentBoard.columns, { ...action.column, cards: [] }],
        },
      };
    }

    case 'UPDATE_COLUMN': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c =>
            c.id === action.id ? { ...c, ...action.changes } : c
          ),
        },
      };
    }

    case 'DELETE_COLUMN': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.filter(c => c.id !== action.id),
        },
      };
    }

    case 'REORDER_COLUMNS': {
      if (!state.currentBoard) return state;
      const cols = state.currentBoard.columns;
      const oldIdx = cols.findIndex(c => c.id === action.activeId);
      const newIdx = cols.findIndex(c => c.id === action.overId);
      if (oldIdx === -1 || newIdx === -1) return state;
      const reordered = arrayMove(cols, oldIdx, newIdx).map((c, i) => ({ ...c, position: i }));
      return { ...state, currentBoard: { ...state.currentBoard, columns: reordered } };
    }

    // ─── Cards ───
    case 'ADD_CARD': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c =>
            c.id === action.columnId ? { ...c, cards: [...c.cards, action.card] } : c
          ),
        },
      };
    }

    case 'UPDATE_CARD': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === action.id ? { ...card, ...action.changes } : card
            ),
          })),
        },
      };
    }

    case 'DELETE_CARD': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.filter(card => card.id !== action.id),
          })),
        },
      };
    }

    case 'MOVE_CARD': {
      if (!state.currentBoard) return state;
      const { cardId, fromColumnId, toColumnId, toIndex } = action;
      let movedCard = null as any;

      const columnsAfterRemove = state.currentBoard.columns.map(c => {
        if (c.id === fromColumnId) {
          const card = c.cards.find(card => card.id === cardId);
          if (card) movedCard = { ...card, columnId: toColumnId };
          return { ...c, cards: c.cards.filter(card => card.id !== cardId) };
        }
        return c;
      });

      if (!movedCard) return state;

      const columnsAfterInsert = columnsAfterRemove.map(c => {
        if (c.id === toColumnId) {
          const newCards = [...c.cards];
          newCards.splice(toIndex, 0, movedCard);
          return { ...c, cards: newCards.map((card, i) => ({ ...card, position: i })) };
        }
        return c;
      });

      return { ...state, currentBoard: { ...state.currentBoard, columns: columnsAfterInsert } };
    }

    case 'ARCHIVE_CARD': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.filter(card => card.id !== action.id),
          })),
        },
      };
    }

    case 'RESTORE_CARD': {
      // Card restoration requires refetching board data, handled by the component
      return state;
    }

    // ─── Tags ───
    case 'SET_TAGS':
      return { ...state, tags: action.tags };

    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.tag] };

    case 'DELETE_TAG':
      return { ...state, tags: state.tags.filter(t => t.id !== action.id) };

    case 'ADD_CARD_TAG': {
      if (!state.currentBoard) return state;
      const tag = state.tags.find(t => t.id === action.tagId);
      if (!tag) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === action.cardId
                ? { ...card, tags: [...card.tags, tag] }
                : card
            ),
          })),
        },
      };
    }

    case 'REMOVE_CARD_TAG': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === action.cardId
                ? { ...card, tags: card.tags.filter(t => t.id !== action.tagId) }
                : card
            ),
          })),
        },
      };
    }

    // ─── Checklist ───
    case 'ADD_CHECKLIST_ITEM': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === action.cardId
                ? { ...card, checklist: [...card.checklist, action.item] }
                : card
            ),
          })),
        },
      };
    }

    case 'UPDATE_CHECKLIST_ITEM': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card => ({
              ...card,
              checklist: card.checklist.map(item =>
                item.id === action.id ? { ...item, ...action.changes } : item
              ),
            })),
          })),
        },
      };
    }

    case 'DELETE_CHECKLIST_ITEM': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === action.cardId
                ? { ...card, checklist: card.checklist.filter(item => item.id !== action.itemId) }
                : card
            ),
          })),
        },
      };
    }

    case 'TOGGLE_CHECKLIST_ITEM': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === action.cardId
                ? {
                    ...card,
                    checklist: card.checklist.map(item =>
                      item.id === action.itemId ? { ...item, checked: !item.checked } : item
                    ),
                  }
                : card
            ),
          })),
        },
      };
    }

    default:
      return state;
  }
}

// ─── Context ───

interface BoardContextValue {
  state: BoardState;
  dispatch: Dispatch<BoardAction>;
}

export const BoardContext = createContext<BoardContextValue>({
  state: initialState,
  dispatch: () => {},
});

export function useBoardContext() {
  return useContext(BoardContext);
}

export function useBoardReducer() {
  return useReducer(boardReducer, initialState);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/hooks/useBoard.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useBoard.ts __tests__/hooks/
git commit -m "feat: add board state reducer and context with tests"
```

---

### Task 6: Sync Hook

**Files:**
- Create: `src/hooks/useSync.ts`

- [ ] **Step 1: Implement sync hook**

Create `src/hooks/useSync.ts`:
```typescript
'use client';

import { useCallback, useRef } from 'react';

interface SyncAction {
  method: string;
  url: string;
  body?: any;
}

export function useSync() {
  const pendingRef = useRef<SyncAction[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const actions = [...pendingRef.current];
    pendingRef.current = [];

    for (const action of actions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });
      } catch (err) {
        console.error('Sync failed:', err);
        // Re-queue failed actions
        pendingRef.current.unshift(action);
      }
    }
  }, []);

  const enqueue = useCallback((action: SyncAction) => {
    pendingRef.current.push(action);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 500);
  }, [flush]);

  const syncNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    flush();
  }, [flush]);

  return { enqueue, syncNow };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSync.ts
git commit -m "feat: add debounced sync hook for API persistence"
```

---

### Task 7: UI Foundation Components

**Files:**
- Create: `src/components/ui/Modal.tsx`, `src/components/ui/ColorPicker.tsx`, `src/components/ui/ConfirmDialog.tsx`

- [ ] **Step 1: Modal component**

Create `src/components/ui/Modal.tsx`:
```tsx
'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a4a]">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">&times;</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ColorPicker component**

Create `src/components/ui/ColorPicker.tsx`:
```tsx
'use client';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#6366f1',
  '#14b8a6', '#f97316', '#a855f7', '#64748b',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
            value === color ? 'border-white scale-110' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: ConfirmDialog component**

Create `src/components/ui/ConfirmDialog.tsx`:
```tsx
'use client';

import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete' }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-slate-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#2a2a4a] text-slate-300 hover:bg-[#3a3a5a]">
          Cancel
        </button>
        <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Modal, ColorPicker, and ConfirmDialog components"
```

---

### Task 8: Layout Components — Header & Sidebar

**Files:**
- Create: `src/components/layout/Header.tsx`, `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Header component**

Create `src/components/layout/Header.tsx`:
```tsx
'use client';

import { useBoardContext } from '@/hooks/useBoard';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { state } = useBoardContext();

  return (
    <header className="h-14 bg-[#16213e] border-b border-[#2a2a4a] flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="text-slate-400 hover:text-slate-200 p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-bold text-slate-100">
        {state.currentBoard ? state.currentBoard.title : 'FlowBoard'}
      </h1>
    </header>
  );
}
```

- [ ] **Step 2: Sidebar component**

Create `src/components/layout/Sidebar.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useBoardContext } from '@/hooks/useBoard';
import type { Board } from '@/types';

interface SidebarProps {
  open: boolean;
  boards: Board[];
  currentBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (id: string) => void;
  onShowArchive: () => void;
}

export default function Sidebar({
  open, boards, currentBoardId,
  onSelectBoard, onCreateBoard, onDeleteBoard, onShowArchive,
}: SidebarProps) {
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreateBoard(newTitle.trim());
    setNewTitle('');
  };

  return (
    <aside className={`
      fixed top-14 left-0 bottom-0 w-64 bg-[#16213e] border-r border-[#2a2a4a]
      transform transition-transform duration-200 z-40
      ${open ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-[#2a2a4a]">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Boards</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="New board..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
              +
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {boards.map(board => (
            <div
              key={board.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                currentBoardId === board.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-300 hover:bg-[#1a1a2e]'
              }`}
              onClick={() => onSelectBoard(board.id)}
            >
              <span className="text-sm truncate">{board.title}</span>
              <button
                onClick={e => { e.stopPropagation(); onDeleteBoard(board.id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs"
              >
                &times;
              </button>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2a2a4a]">
          <button
            onClick={onShowArchive}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 w-full px-3 py-2 rounded-lg hover:bg-[#1a1a2e]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Header and Sidebar layout components"
```

---

### Task 9: Board List (Home Page) with DnD

**Files:**
- Create: `src/components/board/BoardList.tsx`, `src/components/dnd/DndBoardContext.tsx`
- Modify: `src/app/page.tsx`, `src/app/layout.tsx`

- [ ] **Step 1: DndBoardContext**

Create `src/components/dnd/DndBoardContext.tsx`:
```tsx
'use client';

import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useBoardContext } from '@/hooks/useBoard';
import type { ReactNode } from 'react';

interface DndBoardContextProps {
  children: ReactNode;
  onReorder: (activeId: string, overId: string) => void;
}

export default function DndBoardContext({ children, onReorder }: DndBoardContextProps) {
  const { state } = useBoardContext();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={state.boards.map(b => b.id)} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
```

- [ ] **Step 2: BoardList component**

Create `src/components/board/BoardList.tsx`:
```tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Board } from '@/types';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

function BoardCard({ board, onClick }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: board.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 cursor-pointer hover:border-blue-500/50 transition-colors group"
    >
      <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
        {board.title}
      </h3>
      <p className="text-sm text-slate-500 mt-2">
        {new Date(board.createdAt * 1000).toLocaleDateString()}
      </p>
    </div>
  );
}

interface BoardListProps {
  boards: Board[];
  onSelectBoard: (id: string) => void;
}

export default function BoardList({ boards, onSelectBoard }: BoardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {boards.map(board => (
        <BoardCard key={board.id} board={board} onClick={() => onSelectBoard(board.id)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Update layout.tsx with BoardProvider**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { BoardProvider } from "./providers";

export const metadata: Metadata = {
  title: "FlowBoard",
  description: "Personal Kanban Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#1a1a2e] text-slate-100 min-h-screen">
        <BoardProvider>{children}</BoardProvider>
      </body>
    </html>
  );
}
```

Create `src/app/providers.tsx`:
```tsx
'use client';

import { type ReactNode } from 'react';
import { BoardContext, useBoardReducer } from '@/hooks/useBoard';

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useBoardReducer();
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}
```

- [ ] **Step 4: Update home page**

Replace `src/app/page.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from '@/hooks/useBoard';
import { useSync } from '@/hooks/useSync';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BoardList from '@/components/board/BoardList';
import DndBoardContext from '@/components/dnd/DndBoardContext';

export default function Home() {
  const router = useRouter();
  const { state, dispatch } = useBoardContext();
  const { enqueue } = useSync();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/boards')
      .then(r => r.json())
      .then(boards => dispatch({ type: 'SET_BOARDS', boards }));
  }, [dispatch]);

  const handleCreateBoard = async (title: string) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const board = await res.json();
    dispatch({ type: 'ADD_BOARD', board });
  };

  const handleDeleteBoard = async (id: string) => {
    dispatch({ type: 'DELETE_BOARD', id });
    enqueue({ method: 'DELETE', url: `/api/boards/${id}` });
  };

  const handleReorder = (activeId: string, overId: string) => {
    dispatch({ type: 'REORDER_BOARDS', activeId, overId });
    const reordered = state.boards.map((b, i) => ({ id: b.id, position: i }));
    enqueue({ method: 'PUT', url: '/api/boards', body: { items: reordered } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <div className="flex flex-1">
        <Sidebar
          open={sidebarOpen}
          boards={state.boards}
          currentBoardId={null}
          onSelectBoard={(id) => router.push(`/board/${id}`)}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          onShowArchive={() => {}}
        />
        <main className={`flex-1 p-8 transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100">My Boards</h2>
            <p className="text-slate-400 mt-1">Drag to reorder. Click to open.</p>
          </div>
          <DndBoardContext onReorder={handleReorder}>
            <BoardList boards={state.boards} onSelectBoard={(id) => router.push(`/board/${id}`)} />
          </DndBoardContext>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify home page works**

Run: `npm run dev`
Expected: Home page shows with header, sidebar, and empty board list. Can create a board via sidebar.

- [ ] **Step 6: Commit**

```bash
git add src/app/ src/components/board/BoardList.tsx src/components/dnd/DndBoardContext.tsx
git commit -m "feat: add home page with board list and drag-to-reorder"
```

---

### Task 10: Kanban Board View — Columns & Cards

**Files:**
- Create: `src/components/board/BoardView.tsx`, `src/components/board/Column.tsx`, `src/components/board/ColumnHeader.tsx`
- Create: `src/components/card/CardItem.tsx`, `src/components/card/TagBadge.tsx`
- Create: `src/app/board/[id]/page.tsx`

- [ ] **Step 1: TagBadge component**

Create `src/components/card/TagBadge.tsx`:
```tsx
import type { Tag } from '@/types';

export default function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: tag.color + '30', color: tag.color }}
    >
      {tag.name}
    </span>
  );
}
```

- [ ] **Step 2: CardItem component**

Create `src/components/card/CardItem.tsx`:
```tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardWithRelations } from '@/types';
import TagBadge from './TagBadge';

interface CardItemProps {
  card: CardWithRelations;
  onClick: () => void;
  isFocused?: boolean;
}

const PRIORITY_COLORS = {
  low: '#64748b',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

export default function CardItem({ card, onClick, isFocused }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const checkedCount = card.checklist.filter(i => i.checked).length;
  const totalChecklist = card.checklist.length;
  const isOverdue = card.dueDate && card.dueDate * 1000 < Date.now();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-[#1a1a2e] border rounded-lg p-3 cursor-pointer
        hover:border-slate-500 transition-colors group
        ${isFocused ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-[#2a2a4a]'}
      `}
    >
      {/* Color bar */}
      <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: card.color }} />

      {/* Title */}
      <h4 className="text-sm font-medium text-slate-200 mb-1">{card.title}</h4>

      {/* Description preview */}
      {card.description && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{card.description}</p>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
        </div>
      )}

      {/* Footer: priority, due date, checklist */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority dot */}
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
          title={card.priority}
        />

        {/* Due date */}
        {card.dueDate && (
          <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            {new Date(card.dueDate * 1000).toLocaleDateString()}
          </span>
        )}

        {/* Checklist progress */}
        {totalChecklist > 0 && (
          <span className={`text-xs ${checkedCount === totalChecklist ? 'text-green-400' : 'text-slate-500'}`}>
            ✓ {checkedCount}/{totalChecklist}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ColumnHeader component**

Create `src/components/board/ColumnHeader.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { Column } from '@/types';
import ColorPicker from '@/components/ui/ColorPicker';

interface ColumnHeaderProps {
  column: Column;
  cardCount: number;
  onUpdate: (changes: Partial<Column>) => void;
  onDelete: () => void;
  onAddCard: () => void;
}

export default function ColumnHeader({ column, cardCount, onUpdate, onDelete, onAddCard }: ColumnHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [showColor, setShowColor] = useState(false);

  const handleSave = () => {
    if (title.trim() && title !== column.title) {
      onUpdate({ title: title.trim() });
    }
    setEditing(false);
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="bg-transparent border-b border-blue-500 text-sm font-semibold text-slate-200 focus:outline-none w-32"
            />
          ) : (
            <h3
              className="text-sm font-semibold text-slate-200 cursor-pointer hover:text-blue-400"
              onClick={() => setEditing(true)}
            >
              {column.title}
            </h3>
          )}
          <span className="text-xs text-slate-500 bg-[#1a1a2e] px-1.5 py-0.5 rounded">{cardCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onAddCard} className="text-slate-500 hover:text-green-400 text-lg leading-none" title="Add card">+</button>
          <button onClick={() => setShowColor(!showColor)} className="text-slate-500 hover:text-slate-300 text-xs" title="Change color">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          <button onClick={onDelete} className="text-slate-500 hover:text-red-400 text-xs" title="Delete column">&times;</button>
        </div>
      </div>
      {showColor && (
        <div className="mt-2 p-2 bg-[#1a1a2e] rounded-lg border border-[#2a2a4a]">
          <ColorPicker value={column.color} onChange={color => { onUpdate({ color }); setShowColor(false); }} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Column component**

Create `src/components/board/Column.tsx`:
```tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ColumnWithCards, Column as ColumnType } from '@/types';
import ColumnHeader from './ColumnHeader';
import CardItem from '@/components/card/CardItem';

interface ColumnProps {
  column: ColumnWithCards;
  onUpdateColumn: (id: string, changes: Partial<ColumnType>) => void;
  onDeleteColumn: (id: string) => void;
  onAddCard: (columnId: string) => void;
  onCardClick: (cardId: string) => void;
  focusedCardId?: string | null;
}

export default function Column({
  column, onUpdateColumn, onDeleteColumn, onAddCard, onCardClick, focusedCardId,
}: ColumnProps) {
  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-3 w-72 shrink-0 flex flex-col max-h-[calc(100vh-8rem)]"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <ColumnHeader
          column={column}
          cardCount={column.cards.length}
          onUpdate={changes => onUpdateColumn(column.id, changes)}
          onDelete={() => onDeleteColumn(column.id)}
          onAddCard={() => onAddCard(column.id)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-[60px]">
        <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
              isFocused={focusedCardId === card.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: BoardView component**

Create `src/components/board/BoardView.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { BoardWithData, Column as ColumnType } from '@/types';
import Column from './Column';

interface BoardViewProps {
  board: BoardWithData;
  onUpdateColumn: (id: string, changes: Partial<ColumnType>) => void;
  onDeleteColumn: (id: string) => void;
  onAddColumn: () => void;
  onAddCard: (columnId: string) => void;
  onCardClick: (cardId: string) => void;
  focusedCardId?: string | null;
}

export default function BoardView({
  board, onUpdateColumn, onDeleteColumn, onAddColumn, onAddCard, onCardClick, focusedCardId,
}: BoardViewProps) {
  return (
    <div className="flex gap-4 overflow-x-auto p-4 h-full items-start">
      {board.columns.map(column => (
        <Column
          key={column.id}
          column={column}
          onUpdateColumn={onUpdateColumn}
          onDeleteColumn={onDeleteColumn}
          onAddCard={onAddCard}
          onCardClick={onCardClick}
          focusedCardId={focusedCardId}
        />
      ))}

      {/* Add column button */}
      <button
        onClick={onAddColumn}
        className="w-72 shrink-0 h-24 border-2 border-dashed border-[#2a2a4a] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors"
      >
        + Add Column
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Board detail page**

Create `src/app/board/[id]/page.tsx`:
```tsx
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from '@/hooks/useBoard';
import { useSync } from '@/hooks/useSync';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BoardView from '@/components/board/BoardView';
import DndKanbanContext from '@/components/dnd/DndKanbanContext';
import CardDetail from '@/components/card/CardDetail';
import type { Column } from '@/types';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useBoardContext();
  const { enqueue } = useSync();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Load board data
  useEffect(() => {
    fetch(`/api/boards/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(board => dispatch({ type: 'SET_CURRENT_BOARD', board }))
      .catch(() => router.push('/'));

    fetch('/api/boards')
      .then(r => r.json())
      .then(boards => dispatch({ type: 'SET_BOARDS', boards }));

    fetch('/api/tags')
      .then(r => r.json())
      .then(tags => dispatch({ type: 'SET_TAGS', tags }));

    return () => { dispatch({ type: 'CLEAR_CURRENT_BOARD' }); };
  }, [id, dispatch, router]);

  // Sync on page unload
  useEffect(() => {
    const { syncNow } = { syncNow: () => {} }; // Will be connected via ref pattern if needed
    window.addEventListener('beforeunload', syncNow);
    return () => window.removeEventListener('beforeunload', syncNow);
  }, []);

  const handleAddColumn = async () => {
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: id, title: 'New Column' }),
    });
    const column = await res.json();
    dispatch({ type: 'ADD_COLUMN', column });
  };

  const handleUpdateColumn = (colId: string, changes: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', id: colId, changes });
    enqueue({ method: 'PATCH', url: `/api/columns/${colId}`, body: changes });
  };

  const handleDeleteColumn = (colId: string) => {
    dispatch({ type: 'DELETE_COLUMN', id: colId });
    enqueue({ method: 'DELETE', url: `/api/columns/${colId}` });
  };

  const handleAddCard = async (columnId: string) => {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, title: 'New Card' }),
    });
    const card = await res.json();
    dispatch({ type: 'ADD_CARD', columnId, card });
    setSelectedCardId(card.id);
  };

  const handleCreateBoard = async (title: string) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const board = await res.json();
    dispatch({ type: 'ADD_BOARD', board });
  };

  const handleDeleteBoard = async (boardId: string) => {
    dispatch({ type: 'DELETE_BOARD', id: boardId });
    enqueue({ method: 'DELETE', url: `/api/boards/${boardId}` });
    if (boardId === id) router.push('/');
  };

  // Find selected card
  const selectedCard = state.currentBoard?.columns
    .flatMap(c => c.cards)
    .find(c => c.id === selectedCardId) || null;

  if (!state.currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          boards={state.boards}
          currentBoardId={id}
          onSelectBoard={(boardId) => router.push(`/board/${boardId}`)}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          onShowArchive={() => {}}
        />
        <main className={`flex-1 overflow-hidden transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <DndKanbanContext>
            <BoardView
              board={state.currentBoard}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
              onAddColumn={handleAddColumn}
              onAddCard={handleAddCard}
              onCardClick={setSelectedCardId}
            />
          </DndKanbanContext>
        </main>
      </div>

      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Verify board page renders**

Run: `npm run dev`
Expected: Navigate to a board, see columns and cards rendered. Add column button works.

- [ ] **Step 8: Commit**

```bash
git add src/components/board/ src/components/card/CardItem.tsx src/components/card/TagBadge.tsx src/app/board/
git commit -m "feat: add kanban board view with columns and card items"
```

---

### Task 11: DnD Kanban Context — Column & Card Drag-and-Drop

**Files:**
- Create: `src/components/dnd/DndKanbanContext.tsx`

- [ ] **Step 1: Implement DndKanbanContext**

Create `src/components/dnd/DndKanbanContext.tsx`:
```tsx
'use client';

import { useState, type ReactNode } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardContext } from '@/hooks/useBoard';
import { useSync } from '@/hooks/useSync';
import CardItem from '@/components/card/CardItem';

interface DndKanbanContextProps {
  children: ReactNode;
}

export default function DndKanbanContext({ children }: DndKanbanContextProps) {
  const { state, dispatch } = useBoardContext();
  const { enqueue } = useSync();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'card' | 'column' | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const board = state.currentBoard;
  if (!board) return <>{children}</>;

  const allCards = board.columns.flatMap(c => c.cards);
  const activeCard = activeType === 'card' ? allCards.find(c => c.id === activeId) : null;

  const findColumnByCardId = (cardId: string) => {
    return board.columns.find(col => col.cards.some(c => c.id === cardId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isColumn = active.data?.current?.type === 'column';
    setActiveId(String(active.id));
    setActiveType(isColumn ? 'column' : 'card');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || activeType !== 'card') return;

    const activeCardId = String(active.id);
    const overId = String(over.id);

    const fromCol = findColumnByCardId(activeCardId);
    // Check if over a column directly or a card in a column
    const toCol = board.columns.find(c => c.id === overId) || findColumnByCardId(overId);

    if (!fromCol || !toCol || fromCol.id === toCol.id) return;

    // Move card to a different column during drag
    const overIndex = toCol.cards.findIndex(c => c.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : toCol.cards.length;

    dispatch({
      type: 'MOVE_CARD',
      cardId: activeCardId,
      fromColumnId: fromCol.id,
      toColumnId: toCol.id,
      toIndex: insertIndex,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over || active.id === over.id) return;

    if (activeType === 'column') {
      dispatch({ type: 'REORDER_COLUMNS', activeId: String(active.id), overId: String(over.id) });
      // Sync column positions
      const reordered = board.columns.map((c, i) => ({ id: c.id, position: i }));
      enqueue({ method: 'PUT', url: '/api/columns', body: { items: reordered } });
    } else {
      // Card was moved — sync final positions
      const fromCol = findColumnByCardId(String(active.id));
      if (!fromCol) return;

      // Find the column the card ended up in (after handleDragOver moves)
      const currentCol = board.columns.find(col => col.cards.some(c => c.id === String(active.id)));
      if (!currentCol) return;

      const overId = String(over.id);
      const overCol = board.columns.find(c => c.id === overId) || findColumnByCardId(overId);

      if (overCol && currentCol.id === overCol.id) {
        // Same column reorder
        const oldIdx = currentCol.cards.findIndex(c => c.id === String(active.id));
        const newIdx = currentCol.cards.findIndex(c => c.id === overId);
        if (oldIdx !== newIdx && newIdx >= 0) {
          dispatch({
            type: 'MOVE_CARD',
            cardId: String(active.id),
            fromColumnId: currentCol.id,
            toColumnId: currentCol.id,
            toIndex: newIdx,
          });
        }
      }

      // Sync all card positions for affected columns
      for (const col of board.columns) {
        const items = col.cards.map((c, i) => ({ id: c.id, position: i, columnId: col.id }));
        if (items.length > 0) {
          enqueue({ method: 'PUT', url: '/api/cards', body: { items } });
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={board.columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>

      <DragOverlay>
        {activeCard ? (
          <div className="rotate-3 opacity-90">
            <CardItem card={activeCard} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 2: Verify drag-and-drop works**

Run: `npm run dev`
Expected: Cards can be dragged within and between columns. Columns can be dragged to reorder. Drag overlay shows floating card preview.

- [ ] **Step 3: Commit**

```bash
git add src/components/dnd/DndKanbanContext.tsx
git commit -m "feat: add column and card drag-and-drop with DndKanbanContext"
```

---

### Task 12: Card Detail Modal

**Files:**
- Create: `src/components/card/CardDetail.tsx`, `src/components/card/Checklist.tsx`

- [ ] **Step 1: Checklist component**

Create `src/components/card/Checklist.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { ChecklistItem } from '@/types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (itemId: string) => void;
  onAdd: (text: string) => void;
  onDelete: (itemId: string) => void;
}

export default function Checklist({ items, onToggle, onAdd, onDelete }: ChecklistProps) {
  const [newText, setNewText] = useState('');
  const checked = items.filter(i => i.checked).length;

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-300">Checklist</h4>
        {items.length > 0 && (
          <span className="text-xs text-slate-500">{checked}/{items.length}</span>
        )}
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="h-1.5 bg-[#2a2a4a] rounded-full mb-3">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(checked / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* Items */}
      <div className="space-y-1 mb-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group py-1">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="w-4 h-4 rounded border-slate-600 bg-[#1a1a2e] text-blue-500 focus:ring-blue-500/30"
            />
            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-slate-600' : 'text-slate-300'}`}>
              {item.text}
            </span>
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="flex gap-2">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add item..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500"
        />
        <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg bg-[#2a2a4a] text-slate-300 text-sm hover:bg-[#3a3a5a]">
          Add
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: CardDetail modal**

Create `src/components/card/CardDetail.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import type { CardWithRelations, Priority } from '@/types';
import { useBoardContext } from '@/hooks/useBoard';
import { useSync } from '@/hooks/useSync';
import Modal from '@/components/ui/Modal';
import ColorPicker from '@/components/ui/ColorPicker';
import Checklist from './Checklist';
import TagBadge from './TagBadge';

interface CardDetailProps {
  card: CardWithRelations;
  onClose: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#64748b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export default function CardDetail({ card, onClose }: CardDetailProps) {
  const { state, dispatch } = useBoardContext();
  const { enqueue } = useSync();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagSelect, setShowTagSelect] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8b5cf6');

  // Update local state when card changes
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
  }, [card.title, card.description]);

  const updateField = (changes: Partial<CardWithRelations>) => {
    dispatch({ type: 'UPDATE_CARD', id: card.id, changes });
    enqueue({ method: 'PATCH', url: `/api/cards/${card.id}`, body: changes });
  };

  const handleTitleBlur = () => {
    if (title.trim() !== card.title) updateField({ title: title.trim() });
  };

  const handleDescBlur = () => {
    if (description !== card.description) updateField({ description });
  };

  const handleArchive = () => {
    dispatch({ type: 'ARCHIVE_CARD', id: card.id });
    enqueue({ method: 'POST', url: `/api/cards/${card.id}/archive`, body: { action: 'archive' } });
    onClose();
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_CARD', id: card.id });
    enqueue({ method: 'DELETE', url: `/api/cards/${card.id}` });
    onClose();
  };

  const handleToggleChecklist = (itemId: string) => {
    dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', cardId: card.id, itemId });
    const item = card.checklist.find(i => i.id === itemId);
    if (item) {
      enqueue({ method: 'PATCH', url: `/api/checklist/${itemId}`, body: { checked: !item.checked } });
    }
  };

  const handleAddChecklistItem = async (text: string) => {
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id, text }),
    });
    const item = await res.json();
    dispatch({ type: 'ADD_CHECKLIST_ITEM', cardId: card.id, item });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    dispatch({ type: 'DELETE_CHECKLIST_ITEM', cardId: card.id, itemId });
    enqueue({ method: 'DELETE', url: `/api/checklist/${itemId}` });
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
    });
    const tag = await res.json();
    dispatch({ type: 'ADD_TAG', tag });
    // Link to card
    await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'link', cardId: card.id, tagId: tag.id }),
    });
    dispatch({ type: 'ADD_CARD_TAG', cardId: card.id, tagId: tag.id });
    setNewTagName('');
  };

  const handleToggleExistingTag = async (tagId: string) => {
    const hasTag = card.tags.some(t => t.id === tagId);
    if (hasTag) {
      dispatch({ type: 'REMOVE_CARD_TAG', cardId: card.id, tagId });
      enqueue({ method: 'POST', url: '/api/tags', body: { action: 'unlink', cardId: card.id, tagId } });
    } else {
      dispatch({ type: 'ADD_CARD_TAG', cardId: card.id, tagId });
      enqueue({ method: 'POST', url: '/api/tags', body: { action: 'link', cardId: card.id, tagId } });
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Card Details">
      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        className="w-full text-lg font-semibold bg-transparent border-b border-transparent hover:border-[#2a2a4a] focus:border-blue-500 text-slate-100 focus:outline-none pb-1 mb-4"
      />

      {/* Color */}
      <div className="mb-4">
        <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: card.color }} />
          Color
        </button>
        {showColorPicker && (
          <div className="mt-2">
            <ColorPicker value={card.color} onChange={color => { updateField({ color }); setShowColorPicker(false); }} />
          </div>
        )}
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Priority</label>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              onClick={() => updateField({ priority: p.value })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                card.priority === p.value
                  ? 'ring-1 ring-offset-1 ring-offset-[#16213e]'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: p.color + '30',
                color: p.color,
                ...(card.priority === p.value ? { ringColor: p.color } : {}),
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Due Date</label>
        <input
          type="date"
          value={card.dueDate ? new Date(card.dueDate * 1000).toISOString().split('T')[0] : ''}
          onChange={e => {
            const ts = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : null;
            updateField({ dueDate: ts });
          }}
          className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={handleDescBlur}
          rows={3}
          placeholder="Add a description..."
          className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-2">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map(tag => (
            <button key={tag.id} onClick={() => handleToggleExistingTag(tag.id)}>
              <TagBadge tag={tag} />
            </button>
          ))}
        </div>
        <button onClick={() => setShowTagSelect(!showTagSelect)} className="text-xs text-blue-400 hover:text-blue-300">
          + Manage tags
        </button>
        {showTagSelect && (
          <div className="mt-2 p-3 bg-[#1a1a2e] rounded-lg border border-[#2a2a4a]">
            {/* Existing tags */}
            <div className="space-y-1 mb-2">
              {state.tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleExistingTag(tag.id)}
                  className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded text-sm ${
                    card.tags.some(t => t.id === tag.id) ? 'bg-[#2a2a4a]' : 'hover:bg-[#2a2a4a]/50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span className="text-slate-300">{tag.name}</span>
                  {card.tags.some(t => t.id === tag.id) && <span className="ml-auto text-green-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
            {/* Create new tag */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-[#2a2a4a]">
              <input
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                placeholder="New tag..."
                className="flex-1 px-2 py-1 rounded bg-[#16213e] border border-[#2a2a4a] text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
              <button onClick={handleAddTag} className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700">Add</button>
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="mb-4">
        <Checklist
          items={card.checklist}
          onToggle={handleToggleChecklist}
          onAdd={handleAddChecklistItem}
          onDelete={handleDeleteChecklistItem}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-[#2a2a4a]">
        <button onClick={handleArchive} className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-amber-400 hover:bg-amber-400/10">
          Archive
        </button>
        <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10">
          Delete
        </button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Verify card detail modal works**

Run: `npm run dev`
Expected: Clicking a card opens the detail modal. Can edit title, description, priority, color, due date, tags, and checklist. Archive and delete work.

- [ ] **Step 4: Commit**

```bash
git add src/components/card/CardDetail.tsx src/components/card/Checklist.tsx
git commit -m "feat: add card detail modal with tags, checklist, and all editing"
```

---

### Task 13: Search & Filter

**Files:**
- Create: `src/hooks/useSearch.ts`, `src/components/ui/SearchBar.tsx`, `src/components/ui/FilterPanel.tsx`

- [ ] **Step 1: useSearch hook**

Create `src/hooks/useSearch.ts`:
```typescript
'use client';

import { useState, useMemo, useCallback } from 'react';
import type { CardWithRelations, FilterState, Priority } from '@/types';

const initialFilter: FilterState = {
  search: '',
  tags: [],
  priorities: [],
  colors: [],
  dueDateFilter: 'all',
};

export function useSearch() {
  const [filter, setFilter] = useState<FilterState>(initialFilter);

  const updateFilter = useCallback((changes: Partial<FilterState>) => {
    setFilter(prev => ({ ...prev, ...changes }));
  }, []);

  const resetFilter = useCallback(() => setFilter(initialFilter), []);

  const isActive = filter.search !== '' ||
    filter.tags.length > 0 ||
    filter.priorities.length > 0 ||
    filter.colors.length > 0 ||
    filter.dueDateFilter !== 'all';

  const matchesFilter = useCallback((card: CardWithRelations): boolean => {
    // Search
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!card.title.toLowerCase().includes(q) && !card.description.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Tags
    if (filter.tags.length > 0) {
      if (!filter.tags.some(tagId => card.tags.some(t => t.id === tagId))) return false;
    }

    // Priority
    if (filter.priorities.length > 0) {
      if (!filter.priorities.includes(card.priority)) return false;
    }

    // Color
    if (filter.colors.length > 0) {
      if (!filter.colors.includes(card.color)) return false;
    }

    // Due date
    if (filter.dueDateFilter !== 'all' && card.dueDate) {
      const now = Date.now();
      const due = card.dueDate * 1000;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const endOfToday = today.getTime();
      const endOfWeek = endOfToday + (7 - today.getDay()) * 86400000;

      switch (filter.dueDateFilter) {
        case 'overdue':
          if (due >= now) return false;
          break;
        case 'today':
          if (due > endOfToday || due < now - 86400000) return false;
          break;
        case 'this-week':
          if (due > endOfWeek) return false;
          break;
      }
    } else if (filter.dueDateFilter !== 'all' && !card.dueDate) {
      return false;
    }

    return true;
  }, [filter]);

  return { filter, updateFilter, resetFilter, isActive, matchesFilter };
}
```

- [ ] **Step 2: SearchBar component**

Create `src/components/ui/SearchBar.tsx`:
```tsx
'use client';

import { useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function SearchBar({ value, onChange, inputRef }: SearchBarProps) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search cards... ( / )"
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        >
          &times;
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: FilterPanel component**

Create `src/components/ui/FilterPanel.tsx`:
```tsx
'use client';

import type { FilterState, Priority, Tag } from '@/types';

interface FilterPanelProps {
  filter: FilterState;
  tags: Tag[];
  onUpdate: (changes: Partial<FilterState>) => void;
  onReset: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#64748b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

const DUE_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'overdue' as const, label: 'Overdue' },
  { value: 'today' as const, label: 'Today' },
  { value: 'this-week' as const, label: 'This Week' },
];

export default function FilterPanel({ filter, tags, onUpdate, onReset }: FilterPanelProps) {
  const togglePriority = (p: Priority) => {
    const current = filter.priorities;
    const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    onUpdate({ priorities: next });
  };

  const toggleTag = (tagId: string) => {
    const current = filter.tags;
    const next = current.includes(tagId) ? current.filter(x => x !== tagId) : [...current, tagId];
    onUpdate({ tags: next });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {/* Priority filter */}
      <div className="flex items-center gap-1">
        <span className="text-slate-500 text-xs">Priority:</span>
        {PRIORITIES.map(p => (
          <button
            key={p.value}
            onClick={() => togglePriority(p.value)}
            className={`px-2 py-0.5 rounded text-xs ${
              filter.priorities.includes(p.value)
                ? 'ring-1'
                : 'opacity-50 hover:opacity-100'
            }`}
            style={{ backgroundColor: p.color + '30', color: p.color }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Due date filter */}
      <div className="flex items-center gap-1">
        <span className="text-slate-500 text-xs">Due:</span>
        {DUE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onUpdate({ dueDateFilter: opt.value })}
            className={`px-2 py-0.5 rounded text-xs ${
              filter.dueDateFilter === opt.value
                ? 'bg-blue-600/30 text-blue-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-xs">Tags:</span>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-2 py-0.5 rounded-full text-xs ${
                filter.tags.includes(tag.id) ? 'ring-1' : 'opacity-50 hover:opacity-100'
              }`}
              style={{ backgroundColor: tag.color + '30', color: tag.color }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Reset */}
      <button onClick={onReset} className="text-xs text-slate-600 hover:text-slate-400">
        Reset
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Integrate search and filter into board page**

Update `src/app/board/[id]/page.tsx` — add search bar and filter panel in the main area, above BoardView. Add `useSearch` hook. Pass `matchesFilter` through to `BoardView` and `Column` to filter displayed cards.

Add these imports and state to the board page component:
```tsx
import { useSearch } from '@/hooks/useSearch';
import SearchBar from '@/components/ui/SearchBar';
import FilterPanel from '@/components/ui/FilterPanel';
```

Add in the component body:
```tsx
const { filter, updateFilter, resetFilter, isActive, matchesFilter } = useSearch();
const searchInputRef = useRef<HTMLInputElement>(null);
```

Add above `<DndKanbanContext>` in the JSX:
```tsx
<div className="px-4 pt-4 space-y-2">
  <div className="max-w-md">
    <SearchBar value={filter.search} onChange={v => updateFilter({ search: v })} inputRef={searchInputRef} />
  </div>
  {isActive && (
    <FilterPanel filter={filter} tags={state.tags} onUpdate={updateFilter} onReset={resetFilter} />
  )}
</div>
```

Update `BoardView` and `Column` components to accept an optional `filterFn` prop and filter displayed cards accordingly. In `Column.tsx`, filter cards before rendering:
```tsx
const displayedCards = filterFn ? column.cards.filter(filterFn) : column.cards;
```

- [ ] **Step 5: Verify search and filter work**

Run: `npm run dev`
Expected: Search bar filters cards by title/description in real-time. Filter panel shows when search is active. Priority and tag filters work.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useSearch.ts src/components/ui/SearchBar.tsx src/components/ui/FilterPanel.tsx src/app/board/ src/components/board/
git commit -m "feat: add search and filter functionality for cards"
```

---

### Task 14: Archive Panel

**Files:**
- Create: `src/components/board/ArchivePanel.tsx`

- [ ] **Step 1: ArchivePanel component**

Create `src/components/board/ArchivePanel.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import type { CardWithRelations, ColumnWithCards } from '@/types';
import { useBoardContext } from '@/hooks/useBoard';
import Modal from '@/components/ui/Modal';
import TagBadge from '@/components/card/TagBadge';

interface ArchivePanelProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  columns: ColumnWithCards[];
}

export default function ArchivePanel({ open, onClose, boardId, columns }: ArchivePanelProps) {
  const { dispatch } = useBoardContext();
  const [archived, setArchived] = useState<CardWithRelations[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    fetch(`/api/sync?boardId=${boardId}`)
      .then(r => r.json())
      .then(data => setArchived(data.archived || []));
  }, [open, boardId]);

  const handleRestore = async (card: CardWithRelations, columnId: string) => {
    await fetch(`/api/cards/${card.id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore', columnId }),
    });
    setArchived(prev => prev.filter(c => c.id !== card.id));
    // Refetch board data to get restored card
    const res = await fetch(`/api/boards/${boardId}`);
    const board = await res.json();
    dispatch({ type: 'SET_CURRENT_BOARD', board });
  };

  const filtered = archived.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose} title="Archived Cards">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search archived cards..."
        className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 mb-4"
      />

      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No archived cards</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filtered.map(card => (
            <div key={card.id} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3">
              <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: card.color }} />
              <h4 className="text-sm font-medium text-slate-200">{card.title}</h4>
              {card.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.description}</p>
              )}
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {card.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500">Restore to:</span>
                {columns.map(col => (
                  <button
                    key={col.id}
                    onClick={() => handleRestore(card, col.id)}
                    className="text-xs px-2 py-1 rounded bg-[#2a2a4a] text-slate-300 hover:bg-blue-600/30 hover:text-blue-400"
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
```

- [ ] **Step 2: Connect archive panel to board page**

In `src/app/board/[id]/page.tsx`, add state `const [showArchive, setShowArchive] = useState(false);` and pass `onShowArchive={() => setShowArchive(true)}` to `Sidebar`. Add `<ArchivePanel>` to the JSX:

```tsx
import ArchivePanel from '@/components/board/ArchivePanel';

// In JSX, before closing </div>:
<ArchivePanel
  open={showArchive}
  onClose={() => setShowArchive(false)}
  boardId={id}
  columns={state.currentBoard?.columns || []}
/>
```

- [ ] **Step 3: Verify archive works**

Run: `npm run dev`
Expected: Archive a card via card detail modal. Open archive panel from sidebar. See archived card. Restore to a column.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/ArchivePanel.tsx src/app/board/
git commit -m "feat: add archive panel with search and restore functionality"
```

---

### Task 15: Keyboard Shortcuts

**Files:**
- Create: `src/hooks/useKeyboard.ts`

- [ ] **Step 1: Implement useKeyboard hook**

Create `src/hooks/useKeyboard.ts`:
```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { BoardWithData } from '@/types';

interface KeyboardConfig {
  board: BoardWithData | null;
  onNewCard: (columnId: string) => void;
  onEditCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onArchiveCard: (cardId: string) => void;
  onFocusSearch: () => void;
  modalOpen: boolean;
}

export function useKeyboard(config: KeyboardConfig) {
  const { board, onNewCard, onEditCard, onDeleteCard, onArchiveCard, onFocusSearch, modalOpen } = config;
  const [focusedColumnIndex, setFocusedColumnIndex] = useState(0);
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);

  const columns = board?.columns || [];
  const currentColumn = columns[focusedColumnIndex];
  const currentCards = currentColumn?.cards || [];
  const focusedCardId = focusedCardIndex >= 0 && focusedCardIndex < currentCards.length
    ? currentCards[focusedCardIndex]?.id
    : null;

  useEffect(() => {
    if (modalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          onFocusSearch();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          setFocusedColumnIndex(i => Math.max(0, i - 1));
          setFocusedCardIndex(0);
          break;

        case 'ArrowRight':
          e.preventDefault();
          setFocusedColumnIndex(i => Math.min(columns.length - 1, i + 1));
          setFocusedCardIndex(0);
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedCardIndex(i => Math.max(0, i - 1));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedCardIndex(i => Math.min(currentCards.length - 1, i + 1));
          break;

        case 'n':
        case 'N':
          if (currentColumn) {
            e.preventDefault();
            onNewCard(currentColumn.id);
          }
          break;

        case 'e':
        case 'E':
          if (focusedCardId) {
            e.preventDefault();
            onEditCard(focusedCardId);
          }
          break;

        case 'a':
        case 'A':
          if (focusedCardId) {
            e.preventDefault();
            onArchiveCard(focusedCardId);
          }
          break;

        case 'Delete':
        case 'Backspace':
          if (focusedCardId) {
            e.preventDefault();
            onDeleteCard(focusedCardId);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, columns, currentColumn, currentCards, focusedCardId, onNewCard, onEditCard, onDeleteCard, onArchiveCard, onFocusSearch]);

  // Reset focus when board changes
  useEffect(() => {
    setFocusedColumnIndex(0);
    setFocusedCardIndex(-1);
  }, [board?.id]);

  return { focusedCardId, focusedColumnIndex };
}
```

- [ ] **Step 2: Integrate keyboard shortcuts into board page**

In `src/app/board/[id]/page.tsx`, add the `useKeyboard` hook:

```tsx
import { useKeyboard } from '@/hooks/useKeyboard';

// In the component:
const { focusedCardId } = useKeyboard({
  board: state.currentBoard,
  onNewCard: handleAddCard,
  onEditCard: setSelectedCardId,
  onDeleteCard: (cardId) => {
    dispatch({ type: 'DELETE_CARD', id: cardId });
    enqueue({ method: 'DELETE', url: `/api/cards/${cardId}` });
  },
  onArchiveCard: (cardId) => {
    dispatch({ type: 'ARCHIVE_CARD', id: cardId });
    enqueue({ method: 'POST', url: `/api/cards/${cardId}/archive`, body: { action: 'archive' } });
  },
  onFocusSearch: () => searchInputRef.current?.focus(),
  modalOpen: !!selectedCardId || showArchive,
});
```

Pass `focusedCardId` to `BoardView` and down to `Column` → `CardItem` for visual indicator.

- [ ] **Step 3: Verify keyboard shortcuts work**

Run: `npm run dev`
Expected: Arrow keys navigate between columns and cards. `N` creates new card. `E` opens card detail. `/` focuses search. `A` archives. Shortcuts disabled when modal is open or typing in input.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useKeyboard.ts src/app/board/
git commit -m "feat: add keyboard shortcuts for navigation and card actions"
```

---

### Task 16: Final Integration & Polish

**Files:**
- Modify: `src/app/board/[id]/page.tsx` (final wiring)
- Modify: `src/app/page.tsx` (ensure archive access from home)

- [ ] **Step 1: Ensure all features are properly wired in board page**

Review `src/app/board/[id]/page.tsx` to ensure:
- Search, filter, archive panel, keyboard shortcuts, DnD, card detail modal are all connected
- `filterFn` is passed through `BoardView` → `Column`
- `focusedCardId` is passed through `BoardView` → `Column` → `CardItem`
- `beforeunload` properly calls `syncNow`

- [ ] **Step 2: Add next.config.ts for better-sqlite3**

Update `next.config.ts` to handle better-sqlite3 native module:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 4: Run dev server and manually verify all features**

Run: `npm run dev`

Verify:
1. Create boards on home page, drag to reorder
2. Click into board, add columns, drag to reorder columns
3. Add cards, drag between columns, drag within column
4. Click card → detail modal: edit title, description, priority, color, due date, tags, checklist
5. Archive card → archive panel → restore
6. Search and filter cards
7. Keyboard shortcuts: arrows, N, E, A, /, Esc

- [ ] **Step 5: Build production**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: complete FlowBoard kanban with DnD, search, archive, and shortcuts"
```
