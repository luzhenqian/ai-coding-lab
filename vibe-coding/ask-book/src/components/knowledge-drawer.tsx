"use client";

import { useState, useCallback } from "react";
import { UploadZone } from "@/components/upload-zone";
import { UploadProgress } from "@/components/upload-progress";
import { DocumentList } from "@/components/document-list";

interface KnowledgeDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function KnowledgeDrawer({ open, onClose }: KnowledgeDrawerProps) {
  const [uploadDocId, setUploadDocId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadStart = useCallback((docId: string) => {
    setUploadDocId(docId);
  }, []);

  const handleComplete = useCallback(() => {
    setUploadDocId(null);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleReset = useCallback(() => {
    setUploadDocId(null);
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">知识库管理</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="关闭"
          >
            <svg
              className="h-5 w-5"
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
          </button>
        </div>

        {/* Body */}
        <div className="h-[calc(100%-57px)] overflow-y-auto px-4 py-4">
          {uploadDocId ? (
            <UploadProgress
              documentId={uploadDocId}
              onComplete={handleComplete}
              onReset={handleReset}
            />
          ) : (
            <UploadZone onUploadStart={handleUploadStart} />
          )}

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              已上传文档
            </h3>
            <DocumentList refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </>
  );
}
