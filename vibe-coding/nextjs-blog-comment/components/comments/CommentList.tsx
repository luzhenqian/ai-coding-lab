"use client";

import { useState, useCallback } from "react";
import { CommentForm } from "./CommentForm";
import { CommentItem, type CommentData } from "./CommentItem";

type CommentListProps = {
  articleId: string;
  articleAuthorId?: string;
  initialComments: CommentData[];
  initialNextCursor: string | null;
  initialTotal: number;
};

export function CommentList({
  articleId,
  articleAuthorId,
  initialComments,
  initialNextCursor,
  initialTotal,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTotal);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments?articleId=${articleId}&cursor=${nextCursor}`
      );
      const json = await res.json();
      if (json.success) {
        setComments((prev) => [...prev, ...json.data.comments]);
        setNextCursor(json.data.nextCursor);
      }
    } finally {
      setLoading(false);
    }
  }, [articleId, nextCursor, loading]);

  const handleSubmit = useCallback(
    async (content: string, parentId?: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, articleId, parentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const newComment: CommentData = {
        ...json.data,
        replies: [],
      };

      if (parentId) {
        const addReply = (list: CommentData[]): CommentData[] =>
          list.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            if (c.replies?.length) {
              return { ...c, replies: addReply(c.replies) };
            }
            return c;
          });
        setComments(addReply);
      } else {
        setComments((prev) => [...prev, newComment]);
      }
      setTotal((t) => t + 1);
    },
    [articleId]
  );

  const handleEdit = useCallback(async (id: string, content: string) => {
    const res = await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);

    const updateComment = (list: CommentData[]): CommentData[] =>
      list.map((c) => {
        if (c.id === id) return { ...c, content, updatedAt: json.data.updatedAt };
        if (c.replies) return { ...c, replies: updateComment(c.replies) };
        return c;
      });

    setComments(updateComment);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error);
    }

    let deletedCount = 0;

    const countAll = (c: CommentData): number =>
      1 + (c.replies?.reduce((sum, r) => sum + countAll(r), 0) || 0);

    const removeComment = (list: CommentData[]): CommentData[] =>
      list
        .filter((c) => {
          if (c.id === id) {
            deletedCount = countAll(c);
            return false;
          }
          return true;
        })
        .map((c) =>
          c.replies?.length
            ? { ...c, replies: removeComment(c.replies) }
            : c
        );

    setComments((prev) => removeComment([...prev]));
    setTotal((t) => Math.max(0, t - deletedCount));
  }, []);

  return (
    <section className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-800">
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
        Comments ({total})
      </h2>

      <div className="mb-8">
        <CommentForm articleId={articleId} onSubmit={handleSubmit} />
      </div>

      {comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleAuthorId={articleAuthorId}
              onReply={handleSubmit}
              onEdit={handleEdit}
              onDelete={handleDelete}
              articleId={articleId}
            />
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {loading ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}
    </section>
  );
}
