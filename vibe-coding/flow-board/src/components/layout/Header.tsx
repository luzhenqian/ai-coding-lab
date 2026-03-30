'use client';

import { useBoardContext } from '@/hooks/useBoard';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { state } = useBoardContext();

  return (
    <header className="h-14 bg-[#16213e] border-b border-[#2a2a4a] flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onToggleSidebar}
        className="text-slate-400 hover:text-slate-200 p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-bold text-slate-100">
        {state.currentBoard ? state.currentBoard.title : 'FlowBoard'}
      </h1>
    </header>
  );
}
