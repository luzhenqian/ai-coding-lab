'use client';

import { useState } from 'react';
import type { ChecklistItem } from '@/types';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (itemId: string) => void;
  onAdd: (text: string) => void;
  onDelete: (itemId: string) => void;
}

export default function Checklist({ items, onToggle, onAdd, onDelete }: ChecklistProps) {
  const [newText, setNewText] = useState('');
  const checked = items.filter(i => i.checked).length;

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-300">Checklist</h4>
        {items.length > 0 && (
          <span className="text-xs text-slate-500">{checked}/{items.length}</span>
        )}
      </div>
      {items.length > 0 && (
        <div className="h-1.5 bg-[#2a2a4a] rounded-full mb-3">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(checked / items.length) * 100}%` }}
          />
        </div>
      )}
      <div className="space-y-1 mb-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group py-1">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="w-4 h-4 rounded border-slate-600 bg-[#1a1a2e] text-blue-500 focus:ring-blue-500/30"
            />
            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-slate-600' : 'text-slate-300'}`}>
              {item.text}
            </span>
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add item..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500"
        />
        <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg bg-[#2a2a4a] text-slate-300 text-sm hover:bg-[#3a3a5a]">
          Add
        </button>
      </div>
    </div>
  );
}
