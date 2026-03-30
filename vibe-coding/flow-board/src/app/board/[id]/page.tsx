'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardContext } from '@/hooks/useBoard';
import { useSync } from '@/hooks/useSync';
import { useSearch } from '@/hooks/useSearch';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BoardView from '@/components/board/BoardView';
import DndKanbanContext from '@/components/dnd/DndKanbanContext';
import CardDetail from '@/components/card/CardDetail';
import SearchBar from '@/components/ui/SearchBar';
import FilterPanel from '@/components/ui/FilterPanel';
import type { Column } from '@/types';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useBoardContext();
  const { enqueue } = useSync();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { filter, updateFilter, resetFilter, isActive, matchesFilter } = useSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/boards/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(board => dispatch({ type: 'SET_CURRENT_BOARD', board }))
      .catch(() => router.push('/'));

    fetch('/api/boards')
      .then(r => r.json())
      .then(boards => dispatch({ type: 'SET_BOARDS', boards }));

    fetch('/api/tags')
      .then(r => r.json())
      .then(tags => dispatch({ type: 'SET_TAGS', tags }));

    return () => { dispatch({ type: 'CLEAR_CURRENT_BOARD' }); };
  }, [id, dispatch, router]);

  const handleAddColumn = async () => {
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: id, title: 'New Column' }),
    });
    const column = await res.json();
    dispatch({ type: 'ADD_COLUMN', column });
  };

  const handleUpdateColumn = (colId: string, changes: Partial<Column>) => {
    dispatch({ type: 'UPDATE_COLUMN', id: colId, changes });
    enqueue({ method: 'PATCH', url: `/api/columns/${colId}`, body: changes });
  };

  const handleDeleteColumn = (colId: string) => {
    dispatch({ type: 'DELETE_COLUMN', id: colId });
    enqueue({ method: 'DELETE', url: `/api/columns/${colId}` });
  };

  const handleAddCard = async (columnId: string) => {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, title: 'New Card' }),
    });
    const card = await res.json();
    dispatch({ type: 'ADD_CARD', columnId, card });
    setSelectedCardId(card.id);
  };

  const handleCreateBoard = async (title: string) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const board = await res.json();
    dispatch({ type: 'ADD_BOARD', board });
  };

  const handleDeleteBoard = async (boardId: string) => {
    dispatch({ type: 'DELETE_BOARD', id: boardId });
    enqueue({ method: 'DELETE', url: `/api/boards/${boardId}` });
    if (boardId === id) router.push('/');
  };

  const selectedCard = state.currentBoard?.columns
    .flatMap(c => c.cards)
    .find(c => c.id === selectedCardId) || null;

  if (!state.currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          boards={state.boards}
          currentBoardId={id}
          onSelectBoard={(boardId) => router.push(`/board/${boardId}`)}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
          onShowArchive={() => {}}
        />
        <main className={`flex-1 overflow-hidden transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="px-4 pt-4 space-y-2">
            <div className="max-w-md">
              <SearchBar value={filter.search} onChange={v => updateFilter({ search: v })} inputRef={searchInputRef} />
            </div>
            {isActive && (
              <FilterPanel filter={filter} tags={state.tags} onUpdate={updateFilter} onReset={resetFilter} />
            )}
          </div>
          <DndKanbanContext>
            <BoardView
              board={state.currentBoard}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
              onAddColumn={handleAddColumn}
              onAddCard={handleAddCard}
              onCardClick={setSelectedCardId}
              filterFn={matchesFilter}
            />
          </DndKanbanContext>
        </main>
      </div>
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </div>
  );
}
