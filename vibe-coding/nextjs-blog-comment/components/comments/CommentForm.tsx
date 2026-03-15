"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type CommentFormProps = {
  articleId: string;
  parentId?: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
};

export function CommentForm({
  articleId,
  parentId,
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!session?.user) {
    return (
      <div className="rounded-xl border border-gray-200 p-4 text-center dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }
    if (trimmed.length > 2000) {
      setError("Comment cannot exceed 2000 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(trimmed, parentId);
      setContent("");
    } catch {
      setError("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        maxLength={2000}
        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {submitting ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
