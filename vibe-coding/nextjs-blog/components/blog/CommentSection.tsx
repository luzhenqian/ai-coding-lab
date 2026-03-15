"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
};

type CommentSectionProps = {
  articleId: string;
  articleAuthorId: string;
  initialComments: Comment[];
};

export function CommentSection({
  articleId,
  articleAuthorId,
  initialComments,
}: CommentSectionProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const canModerate =
    isAdmin || (user && user.id === articleAuthorId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, content }),
    });

    if (res.ok) {
      const comment = await res.json();
      setComments([...comments, comment]);
      setContent("");
    }

    setLoading(false);
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;

    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setComments(comments.filter((c) => c.id !== commentId));
      router.refresh();
    }
  }

  return (
    <section className="mt-12 border-t pt-8 dark:border-gray-800">
      <h2 className="mb-4 text-2xl font-bold">
        Comments ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="mb-6 text-gray-500">No comments yet.</p>
      ) : (
        <div className="mb-6 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border p-4 dark:border-gray-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {comment.user.image && (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">{comment.user.name}</span>
                  <time className="text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </time>
                </div>
                {canModerate && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            maxLength={2000}
            rows={3}
            required
            className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>{" "}
          to leave a comment.
        </p>
      )}
    </section>
  );
}
