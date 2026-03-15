import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));
  const pageSize = 10;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      include: {
        author: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({
      where: { status: "PUBLISHED", deletedAt: null },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      {/* Page header */}
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Thoughts on AI, technology, and development.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchBar />
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-gray-400 dark:text-gray-500">
            No articles yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              slug={article.slug}
              summary={article.summary}
              coverImage={article.coverImage}
              publishedAt={article.publishedAt?.toISOString() ?? null}
              viewCount={article.viewCount}
              author={article.author}
              category={article.category}
              tags={article.tags.map((at) => at.tag)}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </main>
  );
}
