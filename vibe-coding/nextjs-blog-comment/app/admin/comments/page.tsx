"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type AdminComment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
  article: { id: string; title: string; slug: string };
  parentId: string | null;
};

type Article = {
  id: string;
  title: string;
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (selectedArticle) params.set("articleId", selectedArticle);

      const res = await fetch(`/api/admin/comments?${params}`);
      const json = await res.json();
      if (json.success) {
        setComments(json.data.comments);
        setTotalPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, selectedArticle]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetch("/api/admin/comments/articles")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setArticles(json.data);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Comment Management</h1>

      <div className="mb-6">
        <select
          value={selectedArticle}
          onChange={(e) => {
            setSelectedArticle(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">All Articles</option>
          {articles.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No comments found.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2 text-sm">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-gray-400">on</span>
                  <Link
                    href={`/posts/${comment.article.slug}`}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {comment.article.title}
                  </Link>
                  {comment.parentId && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800">
                      reply
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
                <time className="mt-1 block text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString("zh-CN")}
                </time>
              </div>
              <button
                onClick={() => handleDelete(comment.id)}
                className="ml-4 rounded px-3 py-1 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
