import Link from "next/link";

type ArticleCardProps = {
  title: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  viewCount: number;
  author: { name: string; image: string | null };
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
};

export function ArticleCard({
  title,
  slug,
  summary,
  coverImage,
  publishedAt,
  viewCount,
  author,
  category,
  tags,
}: ArticleCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50">
      {coverImage && (
        <Link href={`/posts/${slug}`} className="block overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
      <div className="p-6">
        {/* Category + Date */}
        <div className="mb-3 flex items-center gap-3 text-xs">
          <Link
            href={`/categories/${category.slug}`}
            className="rounded-full bg-blue-100 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300"
          >
            {category.name}
          </Link>
          {publishedAt && (
            <time
              dateTime={publishedAt}
              className="text-gray-400 dark:text-gray-500"
            >
              {new Date(publishedAt).toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
              })}
            </time>
          )}
        </div>

        {/* Title */}
        <Link href={`/posts/${slug}`}>
          <h2 className="mb-2 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {title}
          </h2>
        </Link>

        {/* Summary */}
        {summary && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {summary}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Footer: author + views */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {author.image ? (
              <img
                src={author.image}
                alt={author.name}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {author.name.charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {author.name}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {viewCount} views
          </span>
        </div>
      </div>
    </article>
  );
}
