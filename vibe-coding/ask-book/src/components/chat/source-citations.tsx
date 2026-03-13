"use client";

import { useState, useEffect } from "react";
import type { SourceCitation } from "@/types";

interface SourceCitationsProps {
  sources: SourceCitation[];
}

interface DocumentLookup {
  [filename: string]: string | null; // filename → documentId or null if not found
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [docIds, setDocIds] = useState<DocumentLookup>({});

  useEffect(() => {
    const filenames = [...new Set(sources.map((s) => s.filename))];
    const missing = filenames.filter((f) => !(f in docIds));
    if (missing.length === 0) return;

    let cancelled = false;
    async function lookupDocuments() {
      const results: DocumentLookup = {};
      await Promise.all(
        missing.map(async (filename) => {
          try {
            const res = await fetch(
              `/api/documents/by-filename?name=${encodeURIComponent(filename)}`
            );
            if (res.ok) {
              const data: { id: string } = await res.json();
              results[filename] = data.id;
            } else {
              results[filename] = null;
            }
          } catch {
            results[filename] = null;
          }
        })
      );
      if (!cancelled) {
        setDocIds((prev) => ({ ...prev, ...results }));
      }
    }
    lookupDocuments();
    return () => {
      cancelled = true;
    };
  }, [sources, docIds]);

  if (sources.length === 0) return null;

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source, index) => {
          const docId = docIds[source.filename];
          const href = docId
            ? `/api/documents/${docId}/file#page=${source.page}`
            : undefined;

          if (href) {
            return (
              <a
                key={`${source.filename}-${source.page}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {source.filename} 第{source.page}页
              </a>
            );
          }

          return (
            <span
              key={`${source.filename}-${source.page}-${index}`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-gray-100 text-gray-400"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {source.filename} 第{source.page}页
            </span>
          );
        })}
      </div>
    </div>
  );
}
