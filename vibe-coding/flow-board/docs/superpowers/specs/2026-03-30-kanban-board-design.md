# FlowBoard - Personal Kanban Board

A personal task management Kanban board with drag-and-drop, custom columns, card colors, and rich card features.

## Tech Stack

- **Next.js 16** (App Router)
- **TailwindCSS 4**
- **@dnd-kit** (core + sortable + utilities)
- **better-sqlite3** (SQLite persistence)
- **nanoid** (ID generation)

## Visual Style

Dark Modern theme — dark background with vibrant accents, similar to GitHub Projects dark mode.

## Architecture

**Client-First**: React state as source of truth, SQLite as persistence layer.

- Page load: fetch full data from API
- User actions: immediate reducer update (zero-lag UI)
- Sync: debounced batch writes to SQLite (500ms)
- Page unload: final sync via `beforeunload`

---

## Data Model

```
Board
├── id (string, nanoid)
├── title (string)
├── position (number)
├── createdAt / updatedAt (timestamp)

Column
├── id (string, nanoid)
├── boardId (FK → Board)
├── title (string)
├── color (string, hex)
├── position (number)

Card
├── id (string, nanoid)
├── columnId (FK → Column)
├── title (string)
├── description (string, optional)
├── color (string, hex)
├── priority ("low" | "medium" | "high" | "urgent")
├── dueDate (timestamp, optional)
├── position (number)
├── archived (boolean, default false)
├── createdAt / updatedAt (timestamp)

Tag (global, shared across boards)
├── id (string, nanoid)
├── name (string)
├── color (string, hex)

CardTag (many-to-many join)
├── cardId (FK → Card)
├── tagId (FK → Tag)

ChecklistItem
├── id (string, nanoid)
├── cardId (FK → Card)
├── text (string)
├── checked (boolean, default false)
├── position (number)
```

---

## Project Structure

```
flow-board/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, dark theme
│   │   ├── page.tsx                # Home: board list
│   │   ├── board/[id]/
│   │   │   └── page.tsx            # Board detail (main workspace)
│   │   └── api/
│   │       ├── boards/             # Board CRUD
│   │       ├── columns/            # Column CRUD
│   │       ├── cards/              # Card CRUD + archive
│   │       ├── tags/               # Tag CRUD
│   │       └── sync/               # Batch sync endpoint
│   │
│   ├── components/
│   │   ├── board/
│   │   │   ├── BoardList.tsx       # Home board grid, draggable
│   │   │   ├── BoardView.tsx       # Kanban main view (column container)
│   │   │   ├── Column.tsx          # Single column
│   │   │   └── ColumnHeader.tsx    # Column title (edit/delete/color)
│   │   ├── card/
│   │   │   ├── CardItem.tsx        # Card thumbnail display
│   │   │   ├── CardDetail.tsx      # Card detail modal
│   │   │   ├── Checklist.tsx       # Checklist component
│   │   │   └── TagBadge.tsx        # Tag badge
│   │   ├── dnd/
│   │   │   ├── DndBoardContext.tsx  # Board list drag context
│   │   │   └── DndKanbanContext.tsx # Column + card drag context
│   │   ├── ui/
│   │   │   ├── Modal.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── FilterPanel.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx         # Board switch + archive entry
│   │
│   ├── hooks/
│   │   ├── useBoard.ts            # Board state reducer + Context
│   │   ├── useSync.ts             # Debounce sync to API
│   │   ├── useDnd.ts              # dnd-kit logic encapsulation
│   │   ├── useSearch.ts           # Search/filter logic
│   │   └── useKeyboard.ts        # Keyboard shortcut bindings
│   │
│   ├── lib/
│   │   ├── db.ts                  # better-sqlite3 connection
│   │   ├── schema.ts              # Table creation SQL
│   │   └── actions.ts             # Database operation functions
│   │
│   └── types/
│       └── index.ts               # TypeScript type definitions
│
├── database.db                    # SQLite database file
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Drag-and-Drop System

Three-layer DnD contexts:

### Home Page — Board Sorting
- `DndBoardContext` wraps `BoardList`
- `SortableContext` for grid drag reordering

### Board Page — Column + Card Sorting

```
DndContext (board page)
├── SortableContext (column sorting, horizontal)
│   ├── Column A
│   │   └── SortableContext (card sorting, vertical)
│   │       ├── Card 1
│   │       └── Card 2
│   ├── Column B
│   │   └── SortableContext (card sorting, vertical)
│   │       └── Card 3
│   └── ...
└── DragOverlay (floating preview during drag)
```

- Sensors: `PointerSensor` + `KeyboardSensor` (accessibility)
- `DragOverlay` renders floating preview; original position shows translucent placeholder
- `onDragEnd` distinguishes: column reorder vs same-column card sort vs cross-column card move
- `collisionDetection`: `closestCorners` (better for cross-column card moves)

---

## State Management

### Reducer Actions

```typescript
type Action =
  // Board
  | { type: 'SET_BOARDS'; boards: Board[] }
  | { type: 'REORDER_BOARDS'; activeId: string; overId: string }
  // Column
  | { type: 'ADD_COLUMN'; boardId: string; title: string }
  | { type: 'UPDATE_COLUMN'; id: string; changes: Partial<Column> }
  | { type: 'DELETE_COLUMN'; id: string }
  | { type: 'REORDER_COLUMNS'; activeId: string; overId: string }
  // Card
  | { type: 'ADD_CARD'; columnId: string; card: Partial<Card> }
  | { type: 'UPDATE_CARD'; id: string; changes: Partial<Card> }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'MOVE_CARD'; cardId: string; toColumnId: string; toIndex: number }
  | { type: 'ARCHIVE_CARD'; id: string }
  | { type: 'RESTORE_CARD'; id: string; toColumnId: string }
  // Tag & Checklist
  | { type: 'ADD_TAG'; tag: Tag }
  | { type: 'REMOVE_TAG'; tagId: string }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; itemId: string }
  | { type: 'ADD_CHECKLIST_ITEM'; cardId: string; text: string }
  | { type: 'DELETE_CHECKLIST_ITEM'; itemId: string }
```

### Sync Strategy

1. Page load → `GET /api/sync?boardId=xxx` fetches full data
2. User action → immediate reducer state update (zero UI delay)
3. Each action recorded to `pendingChanges` queue
4. **500ms debounce** → batch `POST /api/sync` writes all pending changes to SQLite
5. `beforeunload` triggers final sync

---

## Search, Filter, Archive & Keyboard Shortcuts

### Search & Filter

- Top `SearchBar` with real-time filtering (client-side, data already loaded)
- Search scope: title + description
- `FilterPanel` with combo filters:
  - By tags (multi-select)
  - By priority
  - By color
  - By due date (overdue / today / this week)
- Filtered-out cards are hidden; columns remain visible (no layout jump)

### Archive

- Card context menu or detail modal → "Archive" sets `archived = true`
- Archived cards disappear from board but are not deleted
- Sidebar bottom has "Archive" entry → opens archive panel
- Archive panel: view by board, search, restore to specified column

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New card in focused column |
| `E` | Edit focused card |
| `Delete` / `Backspace` | Delete focused card (with confirmation) |
| `A` | Archive focused card |
| `/` | Focus search bar |
| `Esc` | Close modal / cancel search |
| `←` `→` | Navigate between columns |
| `↑` `↓` | Navigate between cards |

- `useKeyboard` hook for global listener; some shortcuts paused when modal is open
- Focused card/column has highlighted border indicator
