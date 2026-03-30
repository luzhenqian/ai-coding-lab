'use client';

import type { FilterState, Priority, Tag } from '@/types';

interface FilterPanelProps {
  filter: FilterState;
  tags: Tag[];
  onUpdate: (changes: Partial<FilterState>) => void;
  onReset: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#64748b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

const DUE_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'overdue' as const, label: 'Overdue' },
  { value: 'today' as const, label: 'Today' },
  { value: 'this-week' as const, label: 'This Week' },
];

export default function FilterPanel({ filter, tags, onUpdate, onReset }: FilterPanelProps) {
  const togglePriority = (p: Priority) => {
    const current = filter.priorities;
    const next = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    onUpdate({ priorities: next });
  };

  const toggleTag = (tagId: string) => {
    const current = filter.tags;
    const next = current.includes(tagId) ? current.filter(x => x !== tagId) : [...current, tagId];
    onUpdate({ tags: next });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-slate-500 text-xs">Priority:</span>
        {PRIORITIES.map(p => (
          <button
            key={p.value}
            onClick={() => togglePriority(p.value)}
            className={`px-2 py-0.5 rounded text-xs ${
              filter.priorities.includes(p.value)
                ? 'ring-1'
                : 'opacity-50 hover:opacity-100'
            }`}
            style={{ backgroundColor: p.color + '30', color: p.color }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-slate-500 text-xs">Due:</span>
        {DUE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onUpdate({ dueDateFilter: opt.value })}
            className={`px-2 py-0.5 rounded text-xs ${
              filter.dueDateFilter === opt.value
                ? 'bg-blue-600/30 text-blue-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-xs">Tags:</span>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-2 py-0.5 rounded-full text-xs ${
                filter.tags.includes(tag.id) ? 'ring-1' : 'opacity-50 hover:opacity-100'
              }`}
              style={{ backgroundColor: tag.color + '30', color: tag.color }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
      <button onClick={onReset} className="text-xs text-slate-600 hover:text-slate-400">
        Reset
      </button>
    </div>
  );
}
