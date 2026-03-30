'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Board } from '@/types';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

function BoardCard({ board, onClick }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: board.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-[#16213e] border border-[#2a2a4a] rounded-xl p-6 cursor-pointer hover:border-blue-500/50 transition-colors group"
    >
      <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
        {board.title}
      </h3>
      <p className="text-sm text-slate-500 mt-2">
        {new Date(board.createdAt * 1000).toLocaleDateString()}
      </p>
    </div>
  );
}

interface BoardListProps {
  boards: Board[];
  onSelectBoard: (id: string) => void;
}

export default function BoardList({ boards, onSelectBoard }: BoardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {boards.map(board => (
        <BoardCard key={board.id} board={board} onClick={() => onSelectBoard(board.id)} />
      ))}
    </div>
  );
}
