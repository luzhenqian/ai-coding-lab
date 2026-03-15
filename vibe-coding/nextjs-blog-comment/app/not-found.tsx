import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">
          404
        </h1>
        <p className="mt-4 text-xl font-medium">Page Not Found</p>
        <p className="mt-2 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
