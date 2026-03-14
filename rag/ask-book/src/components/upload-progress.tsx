"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Document } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "等待处理",
  processing: "处理中",
  completed: "完成",
  failed: "处理失败",
};

interface UploadProgressProps {
  documentId: string;
  onComplete: () => void;
  onReset: () => void;
}

export function UploadProgress({
  documentId,
  onComplete,
  onReset,
}: UploadProgressProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}`);
        if (!res.ok) {
          setError("无法获取文档状态");
          stopPolling();
          return;
        }
        const doc: Document = await res.json();
        setDocument(doc);

        if (doc.status === "completed") {
          stopPolling();
        } else if (doc.status === "failed") {
          stopPolling();
        }
      } catch {
        // Will retry on next interval
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => stopPolling();
  }, [documentId, stopPolling]);

  const isTerminal =
    document?.status === "completed" || document?.status === "failed";

  return (
    <div
      className={`rounded-lg border px-5 py-4 ${
        document?.status === "completed"
          ? "border-green-200 bg-green-50"
          : document?.status === "failed"
            ? "border-red-200 bg-red-50"
            : "border-blue-200 bg-blue-50"
      }`}
    >
      {error && (
        <div>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={onReset}
            className="mt-2 text-sm font-medium text-red-800 underline"
          >
            重新上传
          </button>
        </div>
      )}

      {!error && document && (
        <div>
          <div className="flex items-center gap-2">
            {document.status === "completed" ? (
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : document.status === "failed" ? (
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            )}
            <p
              className={`text-sm font-medium ${
                document.status === "completed"
                  ? "text-green-700"
                  : document.status === "failed"
                    ? "text-red-700"
                    : "text-blue-700"
              }`}
            >
              {STATUS_LABELS[document.status] ?? document.status}
            </p>
          </div>

          <p className="mt-1 text-sm text-gray-600">{document.filename}</p>

          {document.status === "completed" && (
            <p className="mt-1 text-sm text-gray-500">
              已生成 {document.chunkCount} 个文本分块
            </p>
          )}

          {document.status === "failed" && (
            <p className="mt-1 text-sm text-red-600">
              文档处理失败，可能是 PDF 损坏或不包含可提取的文本。
            </p>
          )}
        </div>
      )}

      {!error && !document && (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-blue-700">处理中...</p>
        </div>
      )}

      {isTerminal && (
        <button
          onClick={document?.status === "completed" ? onComplete : onReset}
          className={`mt-3 text-sm font-medium underline ${
            document?.status === "completed"
              ? "text-green-800"
              : "text-red-800"
          }`}
        >
          {document?.status === "completed" ? "上传新文件" : "重新上传"}
        </button>
      )}
    </div>
  );
}
