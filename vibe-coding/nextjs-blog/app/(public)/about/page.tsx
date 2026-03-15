import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Next.js Blog",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold">About</h1>
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Welcome to my personal blog. Here I share my thoughts on web
          development, technology, and more.
        </p>
        <p>
          This blog is built with Next.js, TypeScript, and Tailwind CSS.
          It uses PostgreSQL for data storage and is deployed on Vercel.
        </p>
      </div>
    </main>
  );
}
