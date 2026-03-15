import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "READER") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-gray-500">
            You do not have permission to access the admin panel.
          </p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <Link href="/admin" className="mb-8 block text-xl font-bold">
          Admin Panel
        </Link>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="block rounded px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/posts"
            className="block rounded px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Posts
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/admin/categories"
                className="block rounded px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                Categories
              </Link>
              <Link
                href="/admin/tags"
                className="block rounded px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                Tags
              </Link>
              <Link
                href="/admin/comments"
                className="block rounded px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                Comments
              </Link>
              <Link
                href="/admin/users"
                className="block rounded px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                Users
              </Link>
            </>
          )}
        </nav>
        <div className="mt-8 border-t pt-4 dark:border-gray-800">
          <Link
            href="/"
            className="block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            Back to Blog
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
