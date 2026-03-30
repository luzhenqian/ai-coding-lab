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
