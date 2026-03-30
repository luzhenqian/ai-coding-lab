'use client';

import { useState, useEffect } from 'react';
import type { CardWithRelations, ColumnWithCards } from '@/types';
import { useBoardContext } from '@/hooks/useBoard';
import Modal from '@/components/ui/Modal';
import TagBadge from '@/components/card/TagBadge';

interface ArchivePanelProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  columns: ColumnWithCards[];
}

export default function ArchivePanel({ open, onClose, boardId, columns }: ArchivePanelProps) {
  const { dispatch } = useBoardContext();
  const [archived, setArchived] = useState<CardWithRelations[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    fetch(`/api/sync?boardId=${boardId}`)
      .then(r => r.json())
      .then(data => setArchived(data.archived || []));
  }, [open, boardId]);

  const handleRestore = async (card: CardWithRelations, columnId: string) => {
    await fetch(`/api/cards/${card.id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore', columnId }),
    });
    setArchived(prev => prev.filter(c => c.id !== card.id));
    const res = await fetch(`/api/boards/${boardId}`);
    const board = await res.json();
    dispatch({ type: 'SET_CURRENT_BOARD', board });
  };

  const filtered = archived.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose} title="Archived Cards">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search archived cards..."
        className="w-full px-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 mb-4"
      />
      {filtered.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No archived cards</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filtered.map(card => (
            <div key={card.id} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3">
              <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: card.color }} />
              <h4 className="text-sm font-medium text-slate-200">{card.title}</h4>
              {card.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.description}</p>
              )}
              {card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {card.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500">Restore to:</span>
                {columns.map(col => (
                  <button
                    key={col.id}
                    onClick={() => handleRestore(card, col.id)}
                    className="text-xs px-2 py-1 rounded bg-[#2a2a4a] text-slate-300 hover:bg-blue-600/30 hover:text-blue-400"
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
