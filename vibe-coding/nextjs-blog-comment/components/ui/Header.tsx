"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Blog
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            About
          </Link>
          <Link href="/search" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            Search
          </Link>
          {session?.user ? (
            <>
              {(session.user.role === "ADMIN" || session.user.role === "AUTHOR") && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
