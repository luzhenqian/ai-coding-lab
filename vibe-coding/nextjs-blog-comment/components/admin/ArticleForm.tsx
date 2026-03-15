"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string; createdAt: Date; updatedAt: Date };
type Tag = { id: string; name: string; slug: string; createdAt: Date; updatedAt: Date };

type ArticleFormProps = {
  categories: Category[];
  tags: Tag[];
  initial?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    coverImage: string;
    categoryId: string;
    tagIds: string[];
    status: string;
    seoTitle: string;
    seoDescription: string;
    seoImage: string;
  };
};

export function ArticleForm({ categories, tags, initial }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = !!initial;

  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [content, setContent] = useState(initial?.content || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tagIds || []);
  const [status, setStatus] = useState(initial?.status || "DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      title,
      slug,
      content,
      summary,
      coverImage,
      categoryId,
      tagIds: selectedTags,
      status,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/posts/${initial.id}` : "/api/posts",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save article");
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Failed to save article");
    } finally {
      setSaving(false);
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Cover Image URL</label>
        <input
          type="text"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded px-3 py-1 text-sm ${
                selectedTags.includes(tag.id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Content (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={20}
          className="w-full rounded border px-3 py-2 font-mono text-sm dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : isEditing ? "Update" : "Create"}
      </button>
    </form>
  );
}
