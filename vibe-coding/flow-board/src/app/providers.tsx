'use client';

import { type ReactNode } from 'react';
import { BoardContext, useBoardReducer } from '@/hooks/useBoard';

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useBoardReducer();
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
}
