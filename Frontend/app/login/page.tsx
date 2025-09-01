"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, signIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏓 Table Tennis
          </h1>
          <p className="text-gray-300 text-lg">
            42 Heilbronn Championship
          </p>
          <p className="text-gray-400 mt-2">
            Track matches • ELO Rankings • Compete with friends
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={signIn}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Sign in with 42 School
          </button>

          <div className="text-gray-400 text-sm">
            <p>Only for 42 Heilbronn students</p>
          </div>
        </div>

        <div className="mt-8 text-gray-500 text-xs">
          <p>🏆 Compete in Table Soccer & Table Football</p>
          <p>📈 Track your ELO rating progression</p>
          <p>✅ Confirm matches with opponents</p>
        </div>
      </div>
    </div>
  );
}