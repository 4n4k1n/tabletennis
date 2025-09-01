"use client";

import { useState, useEffect } from "react";
import { matchesApi, Match } from "@/lib/api";
import { History, Trophy, TrendingUp, TrendingDown, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<'all' | 'table_soccer' | 'table_football'>('all');
  const { login } = useAuth();

  useEffect(() => {
    loadMatchHistory();
  }, []);

  const loadMatchHistory = async () => {
    try {
      const response = await matchesApi.getHistory();
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Failed to load match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => 
    selectedSport === 'all' || match.sport === selectedSport
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getELOChange = (match: Match, isPlayer1: boolean) => {
    if (match.status !== 'confirmed') return null;
    
    const eloBefore = isPlayer1 ? match.player1_elo_before : match.player2_elo_before;
    const eloAfter = isPlayer1 ? match.player1_elo_after : match.player2_elo_after;
    const change = eloAfter - eloBefore;
    
    return (
      <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {change >= 0 ? '+' : ''}{change}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading match history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <History className="h-12 w-12 text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Match History</h2>
        <p className="text-gray-600">Your complete match record and ELO progression</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedSport('all')}
            className={`px-4 py-2 rounded-md transition-colors text-sm ${
              selectedSport === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Sports
          </button>
          <button
            onClick={() => setSelectedSport('table_soccer')}
            className={`px-4 py-2 rounded-md transition-colors text-sm ${
              selectedSport === 'table_soccer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚽ Soccer
          </button>
          <button
            onClick={() => setSelectedSport('table_football')}
            className={`px-4 py-2 rounded-md transition-colors text-sm ${
              selectedSport === 'table_football'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏈 Football
          </button>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Match History</h3>
          <p className="text-gray-400">Start playing to build your match history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const isPlayer1 = match.player1.login === login;
            const opponent = isPlayer1 ? match.player2 : match.player1;
            const isWinner = match.winner.login === login;
            const myELOChange = getELOChange(match, isPlayer1);

            return (
              <div
                key={match.id}
                className={`border rounded-lg p-4 ${
                  match.status === 'confirmed' 
                    ? isWinner 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      match.sport === 'table_soccer' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="font-medium text-gray-800">
                      {match.sport === 'table_soccer' ? '⚽ Table Soccer' : '🏈 Table Football'}
                    </span>
                    {getStatusIcon(match.status)}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {myELOChange}
                    <div className="text-sm text-gray-500">
                      {new Date(match.confirmed_at || match.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {match.player1.image_url ? (
                        <img 
                          src={match.player1.image_url} 
                          alt={match.player1.login} 
                          className="w-8 h-8 rounded-full" 
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      )}
                      <span className={`font-medium ${
                        match.player1.login === login ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {match.player1.login === login ? 'You' : match.player1.first_name}
                      </span>
                      {match.winner_id === match.player1_id && match.status === 'confirmed' && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    {match.status === 'confirmed' && (
                      <div className="text-xs text-gray-500">
                        {match.player1_elo_before} → {match.player1_elo_after}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800 mb-1">
                      {match.score}
                    </div>
                    <div className={`text-sm ${
                      match.status === 'confirmed' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {match.status === 'confirmed' ? 'Confirmed' : 'Denied'}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {match.player2.image_url ? (
                        <img 
                          src={match.player2.image_url} 
                          alt={match.player2.login} 
                          className="w-8 h-8 rounded-full" 
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      )}
                      <span className={`font-medium ${
                        match.player2.login === login ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {match.player2.login === login ? 'You' : match.player2.first_name}
                      </span>
                      {match.winner_id === match.player2_id && match.status === 'confirmed' && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    {match.status === 'confirmed' && (
                      <div className="text-xs text-gray-500">
                        {match.player2_elo_before} → {match.player2_elo_after}
                      </div>
                    )}
                  </div>
                </div>

                {match.status === 'denied' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-red-600 text-center">
                      This match was disputed and did not affect ELO ratings
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📈 Total Matches</h4>
          <p className="text-2xl font-bold text-blue-600">
            {matches.filter(m => m.status === 'confirmed').length}
          </p>
          <p className="text-sm text-blue-600">Confirmed matches</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">🏆 Win Rate</h4>
          <p className="text-2xl font-bold text-green-600">
            {(() => {
              const confirmedMatches = matches.filter(m => m.status === 'confirmed');
              const wins = confirmedMatches.filter(m => m.winner.login === login).length;
              const rate = confirmedMatches.length > 0 ? (wins / confirmedMatches.length * 100) : 0;
              return rate.toFixed(1);
            })()}%
          </p>
          <p className="text-sm text-green-600">Overall performance</p>
        </div>
      </div>
    </div>
  );
}