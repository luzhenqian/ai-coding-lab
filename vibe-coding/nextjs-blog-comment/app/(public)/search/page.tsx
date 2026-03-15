import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));
  const pageSize = 10;

  if (!q) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Search
          </h1>
        </div>
        <div className="mx-auto max-w-md">
          <SearchBar />
        </div>
      </main>
    );
  }

  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
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
    prisma.article.count({ where }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      <div className="mb-12">
        <Link href="/" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
          ← All articles
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Search: &quot;{q}&quot;
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {total} result{total !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="mb-8 max-w-md">
        <SearchBar />
      </div>
      {articles.length === 0 ? (
        <p className="py-20 text-center text-gray-400">No results found.</p>
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
      <Pagination page={page} totalPages={Math.ceil(total / pageSize)} />
    </main>
  );
}
