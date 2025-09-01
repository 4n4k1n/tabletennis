"use client";

import { useState } from "react";
import { matchesApi, playersApi, Player } from "@/lib/api";
import { Search, Trophy, Target } from "lucide-react";

export default function SubmitMatch() {
  const [sport, setSport] = useState<'table_soccer' | 'table_football'>('table_soccer');
  const [opponentQuery, setOpponentQuery] = useState('');
  const [selectedOpponent, setSelectedOpponent] = useState<Player | null>(null);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [score, setScore] = useState('');
  const [iWon, setIWon] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await playersApi.search(query);
      setSearchResults(response.data.players);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectOpponent = (player: Player) => {
    setSelectedOpponent(player);
    setOpponentQuery(`${player.first_name} ${player.last_name} (@${player.login})`);
    setSearchResults([]);
  };

  const submitMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOpponent || !score.trim()) {
      setMessage({ type: 'error', text: 'Please select an opponent and enter the score' });
      return;
    }

    setLoading(true);
    try {
      await matchesApi.submit({
        opponent_login: selectedOpponent.login,
        sport,
        score: score.trim(),
        i_won: iWon,
      });

      setMessage({ type: 'success', text: 'Match submitted! Waiting for opponent confirmation.' });
      setSelectedOpponent(null);
      setOpponentQuery('');
      setScore('');
      setIWon(true);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to submit match' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Submit New Match</h2>
        <p className="text-gray-600">Record your match result for ELO calculation</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={submitMatch} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sport
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSport('table_soccer')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                sport === 'table_soccer'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              ⚽ Table Soccer
            </button>
            <button
              type="button"
              onClick={() => setSport('table_football')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                sport === 'table_football'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              🏈 Table Football
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opponent
          </label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={opponentQuery}
                onChange={(e) => {
                  setOpponentQuery(e.target.value);
                  setSelectedOpponent(null);
                  searchPlayers(e.target.value);
                }}
                placeholder="Search by name or login..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {searchResults.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => selectOpponent(player)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    {player.image_url ? (
                      <img src={player.image_url} alt={player.login} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    )}
                    <div>
                      <p className="font-medium">{player.first_name} {player.last_name}</p>
                      <p className="text-sm text-gray-500">@{player.login}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Score
          </label>
          <input
            type="text"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g., 10-7, 2-1, 21-19"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Result
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIWon(true)}
              className={`p-4 border-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                iWon
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Trophy className="h-5 w-5" />
              <span>I Won</span>
            </button>
            <button
              type="button"
              onClick={() => setIWon(false)}
              className={`p-4 border-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                !iWon
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>I Lost</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedOpponent}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Match'}
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your opponent will receive a notification to confirm or deny this match. 
          Only confirmed matches will affect ELO ratings.
        </p>
      </div>
    </div>
  );
}