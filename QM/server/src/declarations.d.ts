declare module 'anime-vostfr' {
  export interface AnimeBasic {
    id: string;
    title: string;
    url: string;
    image: string;
    score?: string;
    year?: string;
    genres?: string[];
  }

  export interface Episode {
    number: string;
    url: string;
    title?: string;
  }

  export interface AnimeDetails {
    synop: string;
    banner: string;
    trailer: string;
    eps: Episode[];
  }

  export function loadAnime(): Promise<AnimeBasic[]>;
  export function loadAnimeVF(): Promise<AnimeBasic[]>;
  export function searchAnime(data: AnimeBasic[], name: string): AnimeBasic[];
  export function searchMovieAnime(data: AnimeBasic[], name: string): AnimeBasic[];
  export function getGenres(anime: AnimeBasic[]): string[];
  export function getMoreInformation(url: string): Promise<AnimeDetails>;
  export function getEmbed(episodeUrl: string): Promise<string[]>;
  export function popularAnime(data: AnimeBasic[]): AnimeBasic[];
  export function bestScoreAnime(data: AnimeBasic[]): AnimeBasic[];
  export function movieAnime(data: AnimeBasic[]): AnimeBasic[];
}