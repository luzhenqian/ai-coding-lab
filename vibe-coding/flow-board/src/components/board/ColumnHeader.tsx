'use client';

import { useState } from 'react';
import type { Column } from '@/types';
import ColorPicker from '@/components/ui/ColorPicker';

interface ColumnHeaderProps {
  column: Column;
  cardCount: number;
  onUpdate: (changes: Partial<Column>) => void;
  onDelete: () => void;
  onAddCard: () => void;
}

export default function ColumnHeader({ column, cardCount, onUpdate, onDelete, onAddCard }: ColumnHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [showColor, setShowColor] = useState(false);

  const handleSave = () => {
    if (title.trim() && title !== column.title) {
      onUpdate({ title: title.trim() });
    }
    setEditing(false);
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="bg-transparent border-b border-blue-500 text-sm font-semibold text-slate-200 focus:outline-none w-32"
            />
          ) : (
            <h3
              className="text-sm font-semibold text-slate-200 cursor-pointer hover:text-blue-400"
              onClick={() => setEditing(true)}
            >
              {column.title}
            </h3>
          )}
          <span className="text-xs text-slate-500 bg-[#1a1a2e] px-1.5 py-0.5 rounded">{cardCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onAddCard} className="text-slate-500 hover:text-green-400 text-lg leading-none" title="Add card">+</button>
          <button onClick={() => setShowColor(!showColor)} className="text-slate-500 hover:text-slate-300 text-xs" title="Change color">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          <button onClick={onDelete} className="text-slate-500 hover:text-red-400 text-xs" title="Delete column">&times;</button>
        </div>
      </div>
      {showColor && (
        <div className="mt-2 p-2 bg-[#1a1a2e] rounded-lg border border-[#2a2a4a]">
          <ColorPicker value={column.color} onChange={color => { onUpdate({ color }); setShowColor(false); }} />
        </div>
      )}
    </div>
  );
}
