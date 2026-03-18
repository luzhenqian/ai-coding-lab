"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trash2, Upload } from "lucide-react";

interface Document {
  id: string;
  filename: string;
  status: "processing" | "ready" | "error";
  chunkCount: number;
  createdAt: string;
}

/**
 * T067: 文档管理页面
 * - 上传 .txt/.md/.pdf/.doc/.docx 文档
 * - 查看文档列表（状态、分块数、创建时间）
 * - 删除文档
 */
export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("获取文档列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        form.reset();
        await fetchDocuments();
      }
    } catch (error) {
      console.error("上传文档失败:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchDocuments();
      }
    } catch (error) {
      console.error("删除文档失败:", error);
    }
  };

  const statusBadge = (status: Document["status"]) => {
    const styles = {
      processing: "bg-yellow-100 text-yellow-800",
      ready: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
    };
    const labels = {
      processing: "处理中",
      ready: "就绪",
      error: "错误",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; 返回聊天
        </Link>
        <h1 className="mt-1 text-xl font-semibold">文档管理</h1>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="mb-6 flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".txt,.md,.pdf,.doc,.docx"
          className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground hover:file:bg-primary/90"
        />
        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? "上传中..." : "上传"}
        </button>
      </form>

      {/* Document list */}
      {loading ? (
        <p className="py-8 text-center text-muted-foreground">加载中...</p>
      ) : documents.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">暂无文档</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{doc.filename}</span>
                  {statusBadge(doc.status)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {doc.chunkCount} 个分块 &middot;{" "}
                  {new Date(doc.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="删除文档"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
