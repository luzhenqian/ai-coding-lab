'use client';

import { useCallback, useRef } from 'react';

interface SyncAction {
  method: string;
  url: string;
  body?: any;
}

export function useSync() {
  const pendingRef = useRef<SyncAction[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    const actions = [...pendingRef.current];
    pendingRef.current = [];

    for (const action of actions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: action.body ? JSON.stringify(action.body) : undefined,
        });
      } catch (err) {
        console.error('Sync failed:', err);
        pendingRef.current.unshift(action);
      }
    }
  }, []);

  const enqueue = useCallback((action: SyncAction) => {
    pendingRef.current.push(action);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 500);
  }, [flush]);

  const syncNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    flush();
  }, [flush]);

  return { enqueue, syncNow };
}
