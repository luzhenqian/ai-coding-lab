interface Dated {
  updatedAt: string;
}

interface DateGroup<T> {
  label: string;
  items: T[];
}

/**
 * Group items by date: 今天, 昨天, 最近7天, 更早
 * Only returns groups that have items.
 */
export function groupByDate<T extends Dated>(items: T[]): DateGroup<T>[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

  const buckets: Record<string, T[]> = {
    今天: [],
    昨天: [],
    最近7天: [],
    更早: [],
  };

  for (const item of items) {
    const date = new Date(item.updatedAt);
    if (date >= todayStart) {
      buckets["今天"].push(item);
    } else if (date >= yesterdayStart) {
      buckets["昨天"].push(item);
    } else if (date >= weekStart) {
      buckets["最近7天"].push(item);
    } else {
      buckets["更早"].push(item);
    }
  }

  const order = ["今天", "昨天", "最近7天", "更早"];
  return order
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({ label, items: buckets[label] }));
}
