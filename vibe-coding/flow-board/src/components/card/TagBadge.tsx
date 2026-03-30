import type { Tag } from '@/types';

export default function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: tag.color + '30', color: tag.color }}
    >
      {tag.name}
    </span>
  );
}
