'use client';

import { createContext, useContext, useReducer, type Dispatch } from 'react';
import type { BoardState, BoardAction } from '@/types';
import { arrayMove } from '@dnd-kit/sortable';

export const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  tags: [],
};

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_BOARDS':
      return { ...state, boards: action.boards };
    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.board] };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(b => b.id === action.id ? { ...b, ...action.changes } : b),
        currentBoard: state.currentBoard?.id === action.id
          ? { ...state.currentBoard, ...action.changes }
          : state.currentBoard,
      };
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
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.board };
    case 'CLEAR_CURRENT_BOARD':
      return { ...state, currentBoard: null };
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
    case 'RESTORE_CARD':
      return state;
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
              card.id === action.cardId ? { ...card, tags: [...card.tags, tag] } : card
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
              card.id === action.cardId ? { ...card, tags: card.tags.filter(t => t.id !== action.tagId) } : card
            ),
          })),
        },
      };
    }
    case 'ADD_CHECKLIST_ITEM': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === action.cardId ? { ...card, checklist: [...card.checklist, action.item] } : card
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
              card.id === action.cardId ? { ...card, checklist: card.checklist.filter(item => item.id !== action.itemId) } : card
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
                ? { ...card, checklist: card.checklist.map(item => item.id === action.itemId ? { ...item, checked: !item.checked } : item) }
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
