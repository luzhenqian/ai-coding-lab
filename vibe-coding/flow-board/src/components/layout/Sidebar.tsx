'use client';

import { useState } from 'react';
import type { Board } from '@/types';

interface SidebarProps {
  open: boolean;
  boards: Board[];
  currentBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (id: string) => void;
  onShowArchive: () => void;
}

export default function Sidebar({
  open, boards, currentBoardId,
  onSelectBoard, onCreateBoard, onDeleteBoard, onShowArchive,
}: SidebarProps) {
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreateBoard(newTitle.trim());
    setNewTitle('');
  };

  return (
    <aside className={`
      fixed top-14 left-0 bottom-0 w-64 bg-[#16213e] border-r border-[#2a2a4a]
      transform transition-transform duration-200 z-40
      ${open ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-[#2a2a4a]">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Boards</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="New board..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
              +
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {boards.map(board => (
            <div
              key={board.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                currentBoardId === board.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-300 hover:bg-[#1a1a2e]'
              }`}
              onClick={() => onSelectBoard(board.id)}
            >
              <span className="text-sm truncate">{board.title}</span>
              <button
                onClick={e => { e.stopPropagation(); onDeleteBoard(board.id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs"
              >
                &times;
              </button>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2a2a4a]">
          <button
            onClick={onShowArchive}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 w-full px-3 py-2 rounded-lg hover:bg-[#1a1a2e]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>
        </div>
      </div>
    </aside>
  );
}
