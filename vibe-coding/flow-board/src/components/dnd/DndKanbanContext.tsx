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
    const toCol = board.columns.find(c => c.id === overId) || findColumnByCardId(overId);

    if (!fromCol || !toCol || fromCol.id === toCol.id) return;

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
      const reordered = board.columns.map((c, i) => ({ id: c.id, position: i }));
      enqueue({ method: 'PUT', url: '/api/columns', body: { items: reordered } });
    } else {
      const fromCol = findColumnByCardId(String(active.id));
      if (!fromCol) return;

      const currentCol = board.columns.find(col => col.cards.some(c => c.id === String(active.id)));
      if (!currentCol) return;

      const overId = String(over.id);
      const overCol = board.columns.find(c => c.id === overId) || findColumnByCardId(overId);

      if (overCol && currentCol.id === overCol.id) {
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
