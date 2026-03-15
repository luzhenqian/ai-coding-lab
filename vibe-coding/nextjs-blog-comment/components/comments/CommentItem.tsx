"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CommentForm } from "./CommentForm";

export type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  user: { id: string; name: string; image: string | null };
  replies?: CommentData[];
};

type CommentItemProps = {
  comment: CommentData;
  articleAuthorId?: string;
  onReply: (content: string, parentId: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  articleId: string;
  depth?: number;
  parentUserName?: string;
};

const MAX_INDENT_DEPTH = 5;

export function CommentItem({
  comment,
  articleAuthorId,
  onReply,
  onEdit,
  onDelete,
  articleId,
  depth = 0,
  parentUserName,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCommentAuthor = session?.user?.id === comment.user.id;
  const isArticleAuthor = session?.user?.id === articleAuthorId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isCommentAuthor;
  const canDelete = isCommentAuthor || isArticleAuthor || isAdmin;
  const isEdited = comment.updatedAt !== comment.createdAt;

  async function handleEdit() {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setEditing(false);
      setEditContent(comment.content);
      return;
    }
    setSaving(true);
    try {
      await onEdit(comment.id, trimmed);
      setEditing(false);
    } catch {
      // keep edit mode open on error
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleReply(content: string, parentId?: string) {
    await onReply(content, parentId || comment.id);
    setShowReplyForm(false);
  }

  return (
    <div
      className={depth > 0 ? "border-l-2 border-gray-100 pl-4 dark:border-gray-800" : ""}
      style={depth > 0 ? { marginLeft: `${Math.min(depth, MAX_INDENT_DEPTH) * 32}px` } : undefined}
    >
      <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <div className="mb-2 flex items-center gap-2 text-sm">
          {comment.user.image ? (
            <img
              src={comment.user.image}
              alt={comment.user.name}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {comment.user.name.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {comment.user.name}
          </span>
          <time className="text-gray-400" dateTime={comment.createdAt}>
            {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
          </time>
          {isEdited && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              maxLength={2000}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={saving}
                className="rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditContent(comment.content);
                }}
                className="rounded px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            {depth >= MAX_INDENT_DEPTH && parentUserName && (
              <span className="mr-1 font-medium text-blue-500">@{parentUserName}</span>
            )}
            {comment.content}
          </p>
        )}

        {!editing && session?.user && (
          <div className="mt-3 flex items-center gap-3 text-xs">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              Reply
            </button>
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                Edit
              </button>
            )}
            {canDelete && (
              confirmDelete ? (
                <span className="flex items-center gap-2">
                  <span className="text-red-500">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="font-medium text-red-500 hover:text-red-700"
                  >
                    {deleting ? "..." : "Yes"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 transition-colors hover:text-red-500"
                >
                  Delete
                </button>
              )
            )}
          </div>
        )}
      </div>

      {showReplyForm && (
        <div className="ml-8 mt-2">
          <CommentForm
            articleId={articleId}
            parentId={comment.id}
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.user.name}...`}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleAuthorId={articleAuthorId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              articleId={articleId}
              depth={depth + 1}
              parentUserName={comment.user.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
