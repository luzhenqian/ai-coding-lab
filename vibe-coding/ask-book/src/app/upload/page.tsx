"use client";

import { useState, useCallback } from "react";
import { UploadZone } from "@/components/upload-zone";
import { UploadProgress } from "@/components/upload-progress";
import { DocumentList } from "@/components/document-list";

export default function UploadPage() {
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        上传员工手册
      </h1>

      {uploadDocId ? (
        <UploadProgress
          documentId={uploadDocId}
          onComplete={handleComplete}
          onReset={handleReset}
        />
      ) : (
        <UploadZone onUploadStart={handleUploadStart} />
      )}

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          已上传文档
        </h2>
        <DocumentList refreshKey={refreshKey} />
      </div>
    </main>
  );
}
