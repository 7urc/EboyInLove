interface Anime {
  id: string;
  title: string;
  image: string;
  banner?: string;
  score?: number;
  description?: string;
  genres?: string[];
  year?: number;
  status?: string;
  language: 'VF' | 'VOSTFR';
  url: string;
  lastEpisode?: {
    number: string;
    season?: string;
    title?: string;
  };
  totalEpisodes?: number;
}

interface LatestEpisode {
  animeId: string;
  animeTitle: string;
  episodeNumber: string;
  season?: string;
  language: 'VF' | 'VOSTFR';
  releaseDate: string;
  image: string;
  url: string;
}