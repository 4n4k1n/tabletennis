import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export interface Player {
  id: number;
  intra_id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  campus: string;
  table_soccer_elo: number;
  table_football_elo: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  winner_id: number;
  player1: Player;
  player2: Player;
  winner: Player;
  sport: 'table_soccer' | 'table_football';
  score: string;
  status: 'pending' | 'confirmed' | 'denied';
  player1_elo_before: number;
  player2_elo_before: number;
  player1_elo_after: number;
  player2_elo_after: number;
  submitted_at: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  player: Player;
  elo: number;
  wins: number;
  losses: number;
  win_rate: number;
  rank: number;
}

export const matchesApi = {
  submit: (data: {
    opponent_login: string;
    sport: 'table_soccer' | 'table_football';
    score: string;
    i_won: boolean;
  }) => api.post('/matches/submit', data),
  
  confirm: (matchId: number, confirmed: boolean) =>
    api.put(`/matches/${matchId}/confirm`, { confirmed }),
  
  getPending: () => api.get('/matches/pending'),
  
  getHistory: () => api.get('/matches/history'),
};

export const leaderboardApi = {
  get: (sport: 'table_soccer' | 'table_football') =>
    api.get('/leaderboard', { params: { sport } }),
};

export const playersApi = {
  getProfile: () => api.get('/profile'),
  
  search: (query: string) => api.get('/players/search', { params: { q: query } }),
  
  getStats: (login: string) => api.get(`/players/${login}/stats`),
};