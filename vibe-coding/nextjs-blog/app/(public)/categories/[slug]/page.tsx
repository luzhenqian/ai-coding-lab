import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));
  const pageSize = 10;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    categoryId: category.id,
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
          {category.name}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {total} article{total !== 1 ? "s" : ""} in this category
        </p>
      </div>
      {articles.length === 0 ? (
        <p className="py-20 text-center text-gray-400">No articles in this category.</p>
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
