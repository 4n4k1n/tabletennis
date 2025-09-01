"use client";

import { useState, useEffect } from "react";
import { leaderboardApi, LeaderboardEntry } from "@/lib/api";
import { Trophy, Medal, Award, TrendingUp, User } from "lucide-react";

export default function Leaderboard() {
  const [sport, setSport] = useState<'table_soccer' | 'table_football'>('table_soccer');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [sport]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await leaderboardApi.get(sport);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        <p className="text-gray-600">ELO rankings for 42 Heilbronn champions</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSport('table_soccer')}
            className={`px-6 py-2 rounded-md transition-colors ${
              sport === 'table_soccer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚽ Table Soccer
          </button>
          <button
            onClick={() => setSport('table_football')}
            className={`px-6 py-2 rounded-md transition-colors ${
              sport === 'table_football'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏈 Table Football
          </button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Rankings Yet</h3>
          <p className="text-gray-400">Be the first to submit a match for {sport.replace('_', ' ')}!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.player.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getRankBg(entry.rank)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex items-center space-x-3">
                    {entry.player.image_url ? (
                      <img
                        src={entry.player.image_url}
                        alt={entry.player.login}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {entry.player.first_name} {entry.player.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">@{entry.player.login}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      sport === 'table_soccer' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {entry.elo}
                    </div>
                    <div className="text-xs text-gray-500">ELO</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {entry.wins}-{entry.losses}
                    </div>
                    <div className="text-xs text-gray-500">W-L</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {entry.win_rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                </div>
              </div>

              {entry.rank <= 3 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className={`font-medium ${
                      entry.rank === 1 ? 'text-yellow-600' :
                      entry.rank === 2 ? 'text-gray-600' : 'text-amber-600'
                    }`}>
                      {entry.rank === 1 ? '👑 Current Champion' :
                       entry.rank === 2 ? '🥈 Runner Up' : '🥉 Third Place'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">How ELO Works</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Everyone starts at 1200 ELO points</p>
          <p>• Win against higher-rated players for more points</p>
          <p>• Lose fewer points when losing to higher-rated players</p>
          <p>• Only confirmed matches affect your rating</p>
        </div>
      </div>
    </div>
  );
}