import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
};

export function Pagination({ page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={`?page=${page - 1}`}
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Previous
        </Link>
      )}
      <span className="px-4 py-2 text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={`?page=${page + 1}`}
          className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Next
        </Link>
      )}
    </div>
  );
}
