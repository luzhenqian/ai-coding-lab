'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setFocusedColumnIndex(0);
    setFocusedCardIndex(-1);
  }, [board?.id]);

  return { focusedCardId, focusedColumnIndex };
}
