"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MemoryList } from "@/components/memories/memory-list";
import { MemoryEditor } from "@/components/memories/memory-editor";

interface Memory {
  id: string;
  content: string;
  category: string;
  accessCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * T053: 记忆管理页面
 * - CRUD 操作通过 /api/memories 端点
 * - 支持添加、编辑、删除记忆
 */
export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchMemories = useCallback(async () => {
    try {
      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (error) {
      console.error("获取记忆列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleAdd = async (data: {
    content: string;
    category: string;
    id?: string;
  }) => {
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content, category: data.category }),
      });
      if (res.ok) {
        setAdding(false);
        await fetchMemories();
      }
    } catch (error) {
      console.error("添加记忆失败:", error);
    }
  };

  const handleEdit = async (data: {
    content: string;
    category: string;
    id?: string;
  }) => {
    if (!data.id) return;
    try {
      const res = await fetch(`/api/memories/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content, category: data.category }),
      });
      if (res.ok) {
        setEditing(null);
        await fetchMemories();
      }
    } catch (error) {
      console.error("编辑记忆失败:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchMemories();
      }
    } catch (error) {
      console.error("删除记忆失败:", error);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setAdding(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 返回聊天
          </Link>
          <h1 className="mt-1 text-xl font-semibold">记忆管理</h1>
        </div>
        {!adding && !editing && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={14} />
            添加记忆
          </button>
        )}
      </div>

      {/* Editor */}
      {adding && (
        <div className="mb-6">
          <MemoryEditor onSave={handleAdd} onCancel={handleCancel} />
        </div>
      )}
      {editing && (
        <div className="mb-6">
          <MemoryEditor
            memory={editing}
            onSave={handleEdit}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="py-8 text-center text-muted-foreground">加载中…</p>
      ) : (
        <MemoryList
          memories={memories}
          onDelete={handleDelete}
          onEdit={(memory) => {
            setAdding(false);
            setEditing(memory);
          }}
        />
      )}
    </div>
  );
}
