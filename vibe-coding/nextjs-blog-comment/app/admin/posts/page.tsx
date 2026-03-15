import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArticleActions } from "./ArticleActions";

export default async function AdminPostsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const articles = await prisma.article.findMany({
    where: isAdmin
      ? { deletedAt: null }
      : { authorId: session?.user.id, deletedAt: null },
    include: {
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500">No articles yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Views
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                >
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <span className="font-medium">{article.title}</span>
                      {isAdmin && (
                        <span className="ml-2 text-xs text-gray-400">
                          by {article.author.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        article.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : article.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {article.category.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {article.viewCount}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <ArticleActions articleId={article.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
