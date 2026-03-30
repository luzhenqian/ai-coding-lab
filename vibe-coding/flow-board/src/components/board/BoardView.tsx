'use client';

import type { BoardWithData, Column as ColumnType, CardWithRelations } from '@/types';
import Column from './Column';

interface BoardViewProps {
  board: BoardWithData;
  onUpdateColumn: (id: string, changes: Partial<ColumnType>) => void;
  onDeleteColumn: (id: string) => void;
  onAddColumn: () => void;
  onAddCard: (columnId: string) => void;
  onCardClick: (cardId: string) => void;
  focusedCardId?: string | null;
  filterFn?: (card: CardWithRelations) => boolean;
}

export default function BoardView({
  board, onUpdateColumn, onDeleteColumn, onAddColumn, onAddCard, onCardClick, focusedCardId, filterFn,
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
          filterFn={filterFn}
        />
      ))}
      <button
        onClick={onAddColumn}
        className="w-72 shrink-0 h-24 border-2 border-dashed border-[#2a2a4a] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors"
      >
        + Add Column
      </button>
    </div>
  );
}
