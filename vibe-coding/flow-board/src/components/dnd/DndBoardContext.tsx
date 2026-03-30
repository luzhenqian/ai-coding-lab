'use client';

import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useBoardContext } from '@/hooks/useBoard';
import type { ReactNode } from 'react';

interface DndBoardContextProps {
  children: ReactNode;
  onReorder: (activeId: string, overId: string) => void;
}

export default function DndBoardContext({ children, onReorder }: DndBoardContextProps) {
  const { state } = useBoardContext();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={state.boards.map(b => b.id)} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
