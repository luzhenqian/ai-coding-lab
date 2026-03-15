"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "./MarkdownEditor";
import slugify from "slugify";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [content, setContent] = useState(initial?.content || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId || categories[0]?.id || ""
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initial?.tagIds || []
  );
  const [status, setStatus] = useState(initial?.status || "DRAFT");
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initial?.seoDescription || ""
  );
  const [seoImage, setSeoImage] = useState(initial?.seoImage || "");
  const [autoSlug, setAutoSlug] = useState(!initial);

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title, { lower: true, strict: true }));
    }
  }, [title, autoSlug]);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      title,
      slug,
      content,
      summary: summary || undefined,
      coverImage: coverImage || undefined,
      categoryId,
      tagIds: selectedTagIds,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoImage: seoImage || undefined,
    };

    const url = initial ? `/api/posts/${initial.id}` : "/api/posts";
    const method = initial ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save article");
      setLoading(false);
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Slug</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            required
            className="flex-1 rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={() => setAutoSlug(true)}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Auto
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Content</label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Cover Image URL</label>
        <input
          type="text"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://... or /uploads/..."
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
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
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
              className={`rounded-full px-3 py-1 text-sm ${
                selectedTagIds.includes(tag.id)
                  ? "bg-blue-500 text-white"
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
        <div className="flex gap-4">
          {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
            <label key={s} className="flex items-center gap-1">
              <input
                type="radio"
                name="status"
                value={s}
                checked={status === s}
                onChange={() => setStatus(s)}
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <details className="rounded border p-4 dark:border-gray-700">
        <summary className="cursor-pointer text-sm font-medium">
          SEO Settings
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm">SEO Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">SEO Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">OG Image URL</label>
            <input
              type="text"
              value={seoImage}
              onChange={(e) => setSeoImage(e.target.value)}
              className="w-full rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>
      </details>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
