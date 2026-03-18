"use client";

import { useState, useEffect } from "react";

interface MemoryEditorProps {
  memory?: { id: string; content: string; category: string } | null;
  onSave: (data: { content: string; category: string; id?: string }) => void;
  onCancel: () => void;
}

/**
 * T052: 记忆编辑器组件
 * - 编辑模式：预填已有记忆内容
 * - 添加模式：空白表单
 * - 支持内容和分类编辑
 */
export function MemoryEditor({ memory, onSave, onCancel }: MemoryEditorProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("preference");

  const isEditMode = !!memory;

  useEffect(() => {
    if (memory) {
      setContent(memory.content);
      setCategory(memory.category);
    } else {
      setContent("");
      setCategory("preference");
    }
  }, [memory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({
      content: content.trim(),
      category,
      ...(memory?.id ? { id: memory.id } : {}),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      <h3 className="text-sm font-medium">
        {isEditMode ? "编辑记忆" : "添加记忆"}
      </h3>

      <div className="space-y-1">
        <label htmlFor="memory-content" className="text-xs text-muted-foreground">
          内容
        </label>
        <textarea
          id="memory-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="输入记忆内容…"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="memory-category" className="text-xs text-muted-foreground">
          分类
        </label>
        <select
          id="memory-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="preference">偏好</option>
          <option value="fact">事实</option>
          <option value="behavior">行为</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!content.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          保存
        </button>
      </div>
    </form>
  );
}
