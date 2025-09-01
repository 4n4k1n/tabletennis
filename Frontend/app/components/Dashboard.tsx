"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { setAuthToken, playersApi, Player } from "@/lib/api";
import Header from "./Header";
import Leaderboard from "./Leaderboard";
import SubmitMatch from "./SubmitMatch";
import PendingMatches from "./PendingMatches";
import MatchHistory from "./MatchHistory";

export default function Dashboard() {
  const { accessToken, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
      loadProfile();
    }
  }, [accessToken]);

  const loadProfile = async () => {
    try {
      const response = await playersApi.getProfile();
      setPlayer(response.data.player);
    } catch (error) {
      console.error('Failed to load profile:', error);
      signOut();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'leaderboard', label: '🏆 Leaderboard', component: <Leaderboard /> },
    { id: 'submit', label: '⚡ Submit Match', component: <SubmitMatch /> },
    { id: 'pending', label: '⏳ Pending', component: <PendingMatches /> },
    { id: 'history', label: '📊 History', component: <MatchHistory /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header player={player} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </div>
  );
}