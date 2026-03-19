"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Trash2, Upload, FileUp, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Document {
  id: string;
  filename: string;
  status: "processing" | "ready" | "error";
  chunkCount: number;
  createdAt: string;
}

const ACCEPTED_EXTENSIONS = [".txt", ".md", ".pdf", ".doc", ".docx"];
const ACCEPT_STRING = ACCEPTED_EXTENSIONS.join(",");

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/**
 * T067: 文档管理页面
 * - 拖拽或点击上传 .txt/.md/.pdf/.doc/.docx 文档
 * - 查看文档列表（状态、分块数、创建时间）
 * - 删除文档（带二次确认）
 * - 处理中文档自动刷新显示分块数
 */
export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 轮询处理中的文档以更新分块数量
  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const uploadFile = async (file: File) => {
    if (!isAcceptedFile(file)) {
      alert(`不支持的文件类型。请上传 ${ACCEPTED_EXTENSIONS.join("、")} 格式的文件。`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchDocuments();
      }
    } catch (error) {
      console.error("上传文档失败:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // 重置 input 以便可以再次选择同一文件
    e.target.value = "";
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

  const chunkDisplay = (doc: Document) => {
    if (doc.status === "processing") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 size={12} className="animate-spin" />
          处理中…
        </span>
      );
    }
    if (doc.status === "error") {
      return <span className="text-xs text-muted-foreground">—</span>;
    }
    return (
      <span className="text-xs text-muted-foreground">
        {doc.chunkCount} 个分块
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 页面头部 */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; 返回聊天
        </Link>
        <h1 className="mt-1 text-xl font-semibold">文档管理</h1>
      </div>

      {/* 拖拽上传区域 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5 text-primary"
            : "border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm">上传中…</span>
          </>
        ) : dragOver ? (
          <>
            <FileUp size={28} />
            <span className="text-sm">释放文件以上传</span>
          </>
        ) : (
          <>
            <Upload size={28} />
            <span className="text-sm">拖拽文件到此处，或点击选择文件</span>
            <span className="text-xs text-muted-foreground/60">
              支持 .txt、.md、.pdf、.doc、.docx
            </span>
          </>
        )}
      </div>

      {/* 文档列表 */}
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
                  {chunkDisplay(doc)} &middot;{" "}
                  {new Date(doc.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="删除文档"
                    />
                  }
                >
                  <Trash2 size={16} />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确定要删除这个文档吗？</AlertDialogTitle>
                    <AlertDialogDescription>
                      删除后无法恢复，文档及其所有分块数据将被永久删除。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
