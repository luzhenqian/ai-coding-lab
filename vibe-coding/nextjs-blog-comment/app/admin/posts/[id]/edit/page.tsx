import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArticleForm } from "@/components/admin/ArticleForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: Props) {
  const session = await auth();
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!article) notFound();

  if (
    session?.user.role !== "ADMIN" &&
    session?.user.id !== article.authorId
  ) {
    notFound();
  }

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Article</h1>
      <ArticleForm
        categories={categories}
        tags={tags}
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          content: article.content,
          summary: article.summary || "",
          coverImage: article.coverImage || "",
          categoryId: article.categoryId,
          tagIds: article.tags.map((t) => t.tagId),
          status: article.status,
          seoTitle: article.seoTitle || "",
          seoDescription: article.seoDescription || "",
          seoImage: article.seoImage || "",
        }}
      />
    </div>
  );
}
