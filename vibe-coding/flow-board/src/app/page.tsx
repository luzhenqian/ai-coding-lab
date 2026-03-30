'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from '@/hooks/useBoard';
import { useSync } from '@/hooks/useSync';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BoardList from '@/components/board/BoardList';
import DndBoardContext from '@/components/dnd/DndBoardContext';

export default function Home() {
  const router = useRouter();
  const { state, dispatch } = useBoardContext();
  const { enqueue } = useSync();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/boards')
      .then(r => r.json())
      .then(boards => dispatch({ type: 'SET_BOARDS', boards }));
  }, [dispatch]);

  const handleCreateBoard = async (title: string) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const board = await res.json();
    dispatch({ type: 'ADD_BOARD', board });
  };

  const handleDeleteBoard = async (id: string) => {
    dispatch({ type: 'DELETE_BOARD', id });
    enqueue({ method: 'DELETE', url: `/api/boards/${id}` });
  };

  const handleReorder = (activeId: string, overId: string) => {
    dispatch({ type: 'REORDER_BOARDS', activeId, overId });
    const reordered = state.boards.map((b, i) => ({ id: b.id, position: i }));
    enqueue({ method: 'PUT', url: '/api/boards', body: { items: reordered } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <div className="flex flex-1">
        <Sidebar
          open={sidebarOpen}
          boards={state.boards}
          currentBoardId={null}
          onSelectBoard={(id) => router.push(`/board/${id}`)}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          onShowArchive={() => {}}
        />
        <main className={`flex-1 p-8 transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100">My Boards</h2>
            <p className="text-slate-400 mt-1">Drag to reorder. Click to open.</p>
          </div>
          <DndBoardContext onReorder={handleReorder}>
            <BoardList boards={state.boards} onSelectBoard={(id) => router.push(`/board/${id}`)} />
          </DndBoardContext>
        </main>
      </div>
    </div>
  );
}
