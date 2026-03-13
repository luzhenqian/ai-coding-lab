"use client";

import { useState, useEffect, useCallback } from "react";
import type { DocumentListItem } from "@/types";
import { formatDate } from "@/lib/format";
import { PdfPreviewModal } from "@/components/pdf-preview-modal";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "等待处理",
    className: "bg-gray-100 text-gray-700",
  },
  processing: {
    label: "处理中",
    className: "bg-yellow-100 text-yellow-700",
  },
  completed: {
    label: "完成",
    className: "bg-green-100 text-green-700",
  },
  failed: {
    label: "处理失败",
    className: "bg-red-100 text-red-700",
  },
};

export function DocumentList({ refreshKey }: { refreshKey?: number }) {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    filename: string;
  } | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data: DocumentListItem[] = await res.json();
        setDocuments(data);
      }
    } catch {
      // Silently fail — will retry on next poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === "pending" || d.status === "processing"
    );

    if (!hasProcessing) return;

    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleDelete = useCallback(
    async (doc: DocumentListItem) => {
      if (!window.confirm(`确定要删除"${doc.filename}"吗？删除后无法恢复。`)) {
        return;
      }

      setDeletingId(doc.id);

      try {
        const res = await fetch(`/api/documents/${doc.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          await fetchDocuments();
        } else {
          alert("删除失败，请重试。");
        }
      } catch {
        alert("删除失败，请重试。");
      } finally {
        setDeletingId(null);
      }
    },
    [fetchDocuments]
  );

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">加载中...</p>
    );
  }

  if (documents.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        暂无已上传文档
      </p>
    );
  }

  return (
    <>
    {previewDoc && (
      <PdfPreviewModal
        documentId={previewDoc.id}
        filename={previewDoc.filename}
        onClose={() => setPreviewDoc(null)}
      />
    )}
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-[540px] divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              文件名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              状态
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              分块数
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              上传时间
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {documents.map((doc) => {
            const statusConfig = STATUS_CONFIG[doc.status] ?? {
              label: doc.status,
              className: "bg-gray-100 text-gray-700",
            };

            return (
              <tr key={doc.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {doc.filename}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                  >
                    {statusConfig.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                  {doc.status === "completed" ? doc.chunkCount : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    {doc.hasFileData && (
                      <button
                        onClick={() =>
                          setPreviewDoc({
                            id: doc.id,
                            filename: doc.filename,
                          })
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="预览"
                      >
                        预览
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === doc.id ? "删除中..." : "删除"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
