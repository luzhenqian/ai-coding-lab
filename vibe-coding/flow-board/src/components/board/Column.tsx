'use client';

import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ColumnWithCards, Column as ColumnType, CardWithRelations } from '@/types';
import ColumnHeader from './ColumnHeader';
import CardItem from '@/components/card/CardItem';

interface ColumnProps {
  column: ColumnWithCards;
  onUpdateColumn: (id: string, changes: Partial<ColumnType>) => void;
  onDeleteColumn: (id: string) => void;
  onAddCard: (columnId: string) => void;
  onCardClick: (cardId: string) => void;
  focusedCardId?: string | null;
  filterFn?: (card: CardWithRelations) => boolean;
}

export default function Column({
  column, onUpdateColumn, onDeleteColumn, onAddCard, onCardClick, focusedCardId, filterFn,
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

  const displayedCards = filterFn ? column.cards.filter(filterFn) : column.cards;

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-3 w-72 shrink-0 flex flex-col max-h-[calc(100vh-8rem)]"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <ColumnHeader
          column={column}
          cardCount={displayedCards.length}
          onUpdate={changes => onUpdateColumn(column.id, changes)}
          onDelete={() => onDeleteColumn(column.id)}
          onAddCard={() => onAddCard(column.id)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-[60px]">
        <SortableContext items={displayedCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {displayedCards.map(card => (
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
