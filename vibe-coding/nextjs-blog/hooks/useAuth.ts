"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: user?.role === "ADMIN",
    isAuthor: user?.role === "AUTHOR",
    isReader: user?.role === "READER",
  };
}
