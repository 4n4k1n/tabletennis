"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signIn: () => signIn("42-school"),
    signOut,
    user: session?.user,
    accessToken: session?.accessToken,
    login: session?.login,
  };
}