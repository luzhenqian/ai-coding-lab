"use client";

import { useEffect, useCallback } from "react";

interface PdfPreviewModalProps {
  documentId: string;
  filename: string;
  onClose: () => void;
}

export function PdfPreviewModal({
  documentId,
  filename,
  onClose,
}: PdfPreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const fileUrl = `/api/documents/${documentId}/file`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow">
        <h2 className="truncate text-sm font-medium text-gray-900">
          {filename}
        </h2>
        <div className="flex items-center gap-2">
          <a
            href={fileUrl}
            download={filename}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            下载
          </a>
          <button
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            关闭
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1">
        <iframe
          src={fileUrl}
          className="h-full w-full border-0"
          title={`预览: ${filename}`}
        />
      </div>
    </div>
  );
}
