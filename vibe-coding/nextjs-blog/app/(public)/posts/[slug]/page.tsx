import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { TagList } from "@/components/blog/TagList";
import { ViewCounter } from "@/components/blog/ViewCounter";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: {
          tag: { select: { id: true, name: true, slug: true } },
        },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary || undefined,
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary || undefined,
      images: article.seoImage || article.coverImage
        ? [{ url: article.seoImage || article.coverImage! }]
        : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
      <ViewCounter articleId={article.id} />

      {/* Back link */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to articles
      </Link>

      {/* Cover image */}
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="mb-8 h-72 w-full rounded-2xl object-cover shadow-lg"
        />
      )}

      {/* Category badge */}
      <Link
        href={`/categories/${article.category.slug}`}
        className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
      >
        {article.category.name}
      </Link>

      {/* Title */}
      <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem] dark:text-white">
        {article.title}
      </h1>

      {/* Metadata row */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {article.author.image ? (
            <img
              src={article.author.image}
              alt={article.author.name}
              className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {article.author.name.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {article.author.name}
          </span>
        </div>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        {article.publishedAt && (
          <time dateTime={article.publishedAt.toISOString()}>
            {article.publishedAt.toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span>{article.viewCount} views</span>
      </div>

      {/* Tags */}
      <div className="mb-10">
        <TagList tags={article.tags.map((at) => at.tag)} />
      </div>

      {/* Divider */}
      <hr className="mb-10 border-gray-200 dark:border-gray-800" />

      {/* Article body */}
      <article>
        <MarkdownRenderer content={article.content} />
      </article>

      {/* Comments */}
      <section className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-800">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
          Comments ({article.comments.length})
        </h2>
        {article.comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {article.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
              >
                <div className="mb-2 flex items-center gap-2 text-sm">
                  {comment.user.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {comment.user.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.user.name}
                  </span>
                  <time className="text-gray-400" dateTime={comment.createdAt.toISOString()}>
                    {comment.createdAt.toLocaleDateString("zh-CN")}
                  </time>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
