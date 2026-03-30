'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardWithRelations } from '@/types';
import TagBadge from './TagBadge';

interface CardItemProps {
  card: CardWithRelations;
  onClick: () => void;
  isFocused?: boolean;
}

const PRIORITY_COLORS = {
  low: '#64748b',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

export default function CardItem({ card, onClick, isFocused }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const checkedCount = card.checklist.filter(i => i.checked).length;
  const totalChecklist = card.checklist.length;
  const isOverdue = card.dueDate && card.dueDate * 1000 < Date.now();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-[#1a1a2e] border rounded-lg p-3 cursor-pointer
        hover:border-slate-500 transition-colors group
        ${isFocused ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-[#2a2a4a]'}
      `}
    >
      <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: card.color }} />
      <h4 className="text-sm font-medium text-slate-200 mb-1">{card.title}</h4>
      {card.description && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{card.description}</p>
      )}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
          title={card.priority}
        />
        {card.dueDate && (
          <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            {new Date(card.dueDate * 1000).toLocaleDateString()}
          </span>
        )}
        {totalChecklist > 0 && (
          <span className={`text-xs ${checkedCount === totalChecklist ? 'text-green-400' : 'text-slate-500'}`}>
            ✓ {checkedCount}/{totalChecklist}
          </span>
        )}
      </div>
    </div>
  );
}
