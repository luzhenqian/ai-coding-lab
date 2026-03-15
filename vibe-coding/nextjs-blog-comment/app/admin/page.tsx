import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatsCard } from "@/components/admin/StatsCard";

export default async function AdminDashboard() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const [articleCount, viewsResult] = await Promise.all([
    prisma.article.count({
      where: isAdmin
        ? { status: "PUBLISHED", deletedAt: null }
        : { authorId: session?.user.id, deletedAt: null },
    }),
    prisma.article.aggregate({
      _sum: { viewCount: true },
      where: isAdmin
        ? { deletedAt: null }
        : { authorId: session?.user.id, deletedAt: null },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={isAdmin ? "Published Articles" : "My Articles"}
          value={articleCount}
        />
        <StatsCard
          label="Total Views"
          value={viewsResult._sum.viewCount || 0}
        />
      </div>
    </div>
  );
}
