'use client';

import { useState, useCallback } from 'react';
import type { CardWithRelations, FilterState, Priority } from '@/types';

const initialFilter: FilterState = {
  search: '',
  tags: [],
  priorities: [],
  colors: [],
  dueDateFilter: 'all',
};

export function useSearch() {
  const [filter, setFilter] = useState<FilterState>(initialFilter);

  const updateFilter = useCallback((changes: Partial<FilterState>) => {
    setFilter(prev => ({ ...prev, ...changes }));
  }, []);

  const resetFilter = useCallback(() => setFilter(initialFilter), []);

  const isActive = filter.search !== '' ||
    filter.tags.length > 0 ||
    filter.priorities.length > 0 ||
    filter.colors.length > 0 ||
    filter.dueDateFilter !== 'all';

  const matchesFilter = useCallback((card: CardWithRelations): boolean => {
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!card.title.toLowerCase().includes(q) && !card.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filter.tags.length > 0) {
      if (!filter.tags.some(tagId => card.tags.some(t => t.id === tagId))) return false;
    }
    if (filter.priorities.length > 0) {
      if (!filter.priorities.includes(card.priority)) return false;
    }
    if (filter.colors.length > 0) {
      if (!filter.colors.includes(card.color)) return false;
    }
    if (filter.dueDateFilter !== 'all' && card.dueDate) {
      const now = Date.now();
      const due = card.dueDate * 1000;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const endOfToday = today.getTime();
      const endOfWeek = endOfToday + (7 - today.getDay()) * 86400000;

      switch (filter.dueDateFilter) {
        case 'overdue':
          if (due >= now) return false;
          break;
        case 'today':
          if (due > endOfToday || due < now - 86400000) return false;
          break;
        case 'this-week':
          if (due > endOfWeek) return false;
          break;
      }
    } else if (filter.dueDateFilter !== 'all' && !card.dueDate) {
      return false;
    }
    return true;
  }, [filter]);

  return { filter, updateFilter, resetFilter, isActive, matchesFilter };
}
