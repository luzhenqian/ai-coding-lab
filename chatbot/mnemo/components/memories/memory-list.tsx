"use client";

import { Pencil, Trash2 } from "lucide-react";

interface Memory {
  id: string;
  content: string;
  category: string;
  accessCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemoryListProps {
  memories: Memory[];
  onDelete: (id: string) => void;
  onEdit: (memory: Memory) => void;
}

const categoryStyles: Record<string, string> = {
  preference: "bg-blue-100 text-blue-800",
  fact: "bg-green-100 text-green-800",
  behavior: "bg-purple-100 text-purple-800",
};

const categoryLabels: Record<string, string> = {
  preference: "偏好",
  fact: "事实",
  behavior: "行为",
};

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, maxLen = 80): string {
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

/**
 * T051: 记忆列表组件
 * - 表格布局展示所有记忆条目
 * - 按创建时间倒序排列
 * - 支持编辑和删除操作
 */
export function MemoryList({ memories, onDelete, onEdit }: MemoryListProps) {
  const sorted = [...memories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">暂无记忆条目</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">内容</th>
            <th className="px-3 py-2 font-medium">分类</th>
            <th className="px-3 py-2 font-medium">创建时间</th>
            <th className="px-3 py-2 font-medium">最近访问</th>
            <th className="px-3 py-2 font-medium text-right">访问次数</th>
            <th className="px-3 py-2 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((memory) => (
            <tr key={memory.id} className="border-b hover:bg-muted/50">
              <td className="max-w-xs px-3 py-2" title={memory.content}>
                {truncate(memory.content)}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyles[memory.category] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {categoryLabels[memory.category] ?? memory.category}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                {formatTime(memory.createdAt)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                {formatTime(memory.lastAccessedAt)}
              </td>
              <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                {memory.accessCount}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(memory)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="编辑"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(memory.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
