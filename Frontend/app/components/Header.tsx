"use client";

import { useAuth } from "@/hooks/useAuth";
import { Player } from "@/lib/api";
import { LogOut, Trophy, User } from "lucide-react";

interface HeaderProps {
  player: Player | null;
}

export default function Header({ player }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-800">
              42 Table Tennis
            </h1>
          </div>
          <div className="hidden md:block text-sm text-gray-500">
            Heilbronn Championship
          </div>
        </div>

        {player && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {player.image_url ? (
                <img
                  src={player.image_url}
                  alt={player.login}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              )}
              
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">
                  {player.first_name} {player.last_name}
                </p>
                <p className="text-xs text-gray-500">@{player.login}</p>
              </div>
              
              <div className="hidden lg:flex space-x-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-blue-600">
                    {player.table_soccer_elo}
                  </p>
                  <p className="text-xs text-gray-500">Soccer ELO</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">
                    {player.table_football_elo}
                  </p>
                  <p className="text-xs text-gray-500">Football ELO</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}