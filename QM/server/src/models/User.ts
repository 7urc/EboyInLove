export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  favorites: string[];
  watchlist: string[];
  watchHistory: WatchHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchHistoryItem {
  animeId: string;
  animeTitle: string;
  episode: number;
  season?: number;
  timestamp: number; // position in seconds
  watchedAt: Date;
  language: 'VF' | 'VOSTFR';
}