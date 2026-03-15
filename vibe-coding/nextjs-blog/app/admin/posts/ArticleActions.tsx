"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function ArticleActions({ articleId }: { articleId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this article?")) return;

    const res = await fetch(`/api/posts/${articleId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/posts/${articleId}/edit`}
        className="text-blue-600 hover:underline"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
  );
}
