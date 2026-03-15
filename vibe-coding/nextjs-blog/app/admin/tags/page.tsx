"use client";

import { useState, useEffect } from "react";

type Tag = {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    const res = await fetch("/api/tags");
    const data = await res.json();
    setTags(data.data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setName("");
    fetchTags();
  }

  async function handleUpdate(id: string) {
    setError("");
    const res = await fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setEditId(null);
    fetchTags();
  }

  async function handleDelete(id: string) {
    setError("");
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    fetchTags();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tags</h1>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name"
          required
          className="rounded border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Slug
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Articles
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id} className="border-b dark:border-gray-800">
              <td className="px-4 py-3 text-sm">
                {editId === tag.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                  />
                ) : (
                  tag.name
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{tag.slug}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {tag._count.articles}
              </td>
              <td className="px-4 py-3 text-sm">
                {editId === tag.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(tag.id)}
                      className="text-green-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditId(tag.id);
                        setEditName(tag.name);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
