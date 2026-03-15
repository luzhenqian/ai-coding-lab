"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/categories", {
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
    fetchCategories();
  }

  async function handleUpdate(id: string) {
    setError("");
    const res = await fetch(`/api/categories/${id}`, {
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
    fetchCategories();
  }

  async function handleDelete(id: string) {
    setError("");
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    fetchCategories();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>

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
          placeholder="New category name"
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
          {categories.map((cat) => (
            <tr
              key={cat.id}
              className="border-b dark:border-gray-800"
            >
              <td className="px-4 py-3 text-sm">
                {editId === cat.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {cat.slug}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {cat._count.articles}
              </td>
              <td className="px-4 py-3 text-sm">
                {editId === cat.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(cat.id)}
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
                        setEditId(cat.id);
                        setEditName(cat.name);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
