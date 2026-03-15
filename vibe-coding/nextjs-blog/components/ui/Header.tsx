"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import { SearchBar } from "./SearchBar";

export function Header() {
  const { user, isAuthenticated, isAdmin, isAuthor } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg dark:border-gray-800/80 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 lg:px-8">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Blog
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Center: search */}
        <div className="hidden w-56 md:block">
          <SearchBar />
        </div>

        {/* Right: auth */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              {(isAdmin || isAuthor) && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {user?.name?.charAt(0) || "?"}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 px-6 py-4 md:hidden dark:border-gray-800">
          <div className="mb-4">
            <SearchBar />
          </div>
          <nav className="space-y-3">
            <Link href="/" className="block text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/about" className="block text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            {isAuthenticated ? (
              <>
                {(isAdmin || isAuthor) && (
                  <Link href="/admin" className="block text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block text-sm font-medium text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block text-sm font-medium text-blue-600" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
