"use client";

import { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/stats");
    // Fetch users list via a separate endpoint
    const usersRes = await fetch("/api/users");
    if (usersRes.ok) {
      const data = await usersRes.json();
      setUsers(data.data);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setError("");
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    fetchUsers();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Users</h1>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Email
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Role
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
              Joined
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b dark:border-gray-800">
              <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-4 py-3 text-sm">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="rounded border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="READER">READER</option>
                  <option value="AUTHOR">AUTHOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
