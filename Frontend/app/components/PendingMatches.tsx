"use client";

import { useState, useEffect } from "react";
import { matchesApi, Match } from "@/lib/api";
import { Clock, Check, X, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PendingMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    loadPendingMatches();
  }, []);

  const loadPendingMatches = async () => {
    try {
      const response = await matchesApi.getPending();
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Failed to load pending matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (matchId: number, confirmed: boolean) => {
    setActionLoading(matchId);
    try {
      await matchesApi.confirm(matchId, confirmed);
      await loadPendingMatches();
    } catch (error) {
      console.error('Failed to confirm match:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pending matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-500 mb-2">No Pending Matches</h3>
        <p className="text-gray-400">All caught up! No matches waiting for confirmation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Pending Matches</h2>
        <p className="text-gray-600">Matches waiting for confirmation</p>
      </div>

      {matches.map((match) => {
        const isMySubmission = match.player1.login === login;
        const opponent = isMySubmission ? match.player2 : match.player1;
        const isWinner = match.winner.login === login;

        return (
          <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  match.sport === 'table_soccer' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
                <span className="font-medium text-gray-800">
                  {match.sport === 'table_soccer' ? '⚽ Table Soccer' : '🏈 Table Football'}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                {new Date(match.submitted_at).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {match.player1.image_url ? (
                    <img src={match.player1.image_url} alt={match.player1.login} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  )}
                  <span className="font-medium">
                    {match.player1.first_name} {match.player1.last_name}
                  </span>
                  {match.winner_id === match.player1_id && <Trophy className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-gray-500">@{match.player1.login}</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {match.score}
                </div>
                <div className="text-sm text-gray-500">Score</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {match.player2.image_url ? (
                    <img src={match.player2.image_url} alt={match.player2.login} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  )}
                  <span className="font-medium">
                    {match.player2.first_name} {match.player2.last_name}
                  </span>
                  {match.winner_id === match.player2_id && <Trophy className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-gray-500">@{match.player2.login}</p>
              </div>
            </div>

            {isMySubmission ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Waiting for confirmation</strong> from {opponent.first_name} {opponent.last_name}
                </p>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleConfirm(match.id, true)}
                  disabled={actionLoading === match.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Confirm</span>
                </button>
                
                <button
                  onClick={() => handleConfirm(match.id, false)}
                  disabled={actionLoading === match.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Deny</span>
                </button>
              </div>
            )}

            {actionLoading === match.id && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-600">Processing...</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}