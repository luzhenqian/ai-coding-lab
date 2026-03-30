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
