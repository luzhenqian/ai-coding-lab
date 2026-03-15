"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type PaginationProps = {
  page: number;
  totalPages: number;
};

export function Pagination({ page, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function createPageUrl(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={createPageUrl(page - 1)}
          className="rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Previous
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={createPageUrl(p)}
          className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            p === page
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {p}
        </Link>
      ))}

      {page < totalPages && (
        <Link
          href={createPageUrl(page + 1)}
          className="rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
