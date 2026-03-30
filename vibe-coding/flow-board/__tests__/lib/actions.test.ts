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
