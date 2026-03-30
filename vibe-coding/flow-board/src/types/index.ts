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

export interface CardWithRelations extends Card {
  tags: Tag[];
  checklist: ChecklistItem[];
}

export interface BoardWithData extends Board {
  columns: ColumnWithCards[];
}

export interface ColumnWithCards extends Column {
  cards: CardWithRelations[];
}

export interface BoardState {
  boards: Board[];
  currentBoard: BoardWithData | null;
  tags: Tag[];
}

export type BoardAction =
  | { type: 'SET_BOARDS'; boards: Board[] }
  | { type: 'ADD_BOARD'; board: Board }
  | { type: 'UPDATE_BOARD'; id: string; changes: Partial<Board> }
  | { type: 'DELETE_BOARD'; id: string }
  | { type: 'REORDER_BOARDS'; activeId: string; overId: string }
  | { type: 'SET_CURRENT_BOARD'; board: BoardWithData }
  | { type: 'CLEAR_CURRENT_BOARD' }
  | { type: 'ADD_COLUMN'; column: Column }
  | { type: 'UPDATE_COLUMN'; id: string; changes: Partial<Column> }
  | { type: 'DELETE_COLUMN'; id: string }
  | { type: 'REORDER_COLUMNS'; activeId: string; overId: string }
  | { type: 'ADD_CARD'; columnId: string; card: CardWithRelations }
  | { type: 'UPDATE_CARD'; id: string; changes: Partial<Card> }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'MOVE_CARD'; cardId: string; fromColumnId: string; toColumnId: string; toIndex: number }
  | { type: 'ARCHIVE_CARD'; id: string }
  | { type: 'RESTORE_CARD'; id: string; toColumnId: string }
  | { type: 'SET_TAGS'; tags: Tag[] }
  | { type: 'ADD_TAG'; tag: Tag }
  | { type: 'DELETE_TAG'; id: string }
  | { type: 'ADD_CARD_TAG'; cardId: string; tagId: string }
  | { type: 'REMOVE_CARD_TAG'; cardId: string; tagId: string }
  | { type: 'ADD_CHECKLIST_ITEM'; cardId: string; item: ChecklistItem }
  | { type: 'UPDATE_CHECKLIST_ITEM'; id: string; changes: Partial<ChecklistItem> }
  | { type: 'DELETE_CHECKLIST_ITEM'; cardId: string; itemId: string }
  | { type: 'TOGGLE_CHECKLIST_ITEM'; cardId: string; itemId: string };

export interface FilterState {
  search: string;
  tags: string[];
  priorities: Priority[];
  colors: string[];
  dueDateFilter: 'all' | 'overdue' | 'today' | 'this-week';
}
