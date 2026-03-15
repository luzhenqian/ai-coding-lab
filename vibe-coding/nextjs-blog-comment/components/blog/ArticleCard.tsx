import Link from "next/link";

type ArticleCardProps = {
  title: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  viewCount: number;
  author: { id: string; name: string; image: string | null };
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string }[];
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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      {coverImage && (
        <Link href={`/posts/${slug}`}>
          <img
            src={coverImage}
            alt={title}
            className="h-48 w-full object-cover transition-transform group-hover:scale-105"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <Link
            href={`/categories/${category.slug}`}
            className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
          >
            {category.name}
          </Link>
        </div>
        <Link href={`/posts/${slug}`}>
          <h2 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {title}
          </h2>
        </Link>
        {summary && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500 dark:text-gray-400">
            {summary}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{author.name}</span>
          {publishedAt && (
            <>
              <span>·</span>
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString("zh-CN")}
              </time>
            </>
          )}
          <span>·</span>
          <span>{viewCount} views</span>
        </div>
      </div>
    </article>
  );
}
