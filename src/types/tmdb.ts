export interface Anime {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  original_language: string;
  genre_ids: number[];
}

export interface Season {
  season_number: number;
  episode_count: number;
}

export interface AnimeDetail extends Anime {
  overview: string;
  seasons: Season[];
  backdrop_path: string | null;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
  vote_average: number;
}

export interface PlayMediaEpisode {
  episode_number: number;
  stream_id: string;
}

export interface PlayMediaSeason {
  season_number: number;
  episodes: PlayMediaEpisode[];
}

export interface PlayMediaCatalog {
  anime_id: number;
  provider: string;
  seasons: PlayMediaSeason[];
}

export interface MappedEpisode extends Episode {
  stream_id?: string;
}

export interface WebAppPayload {
  action: 'WATCH' | 'START_MAPPING';
  animeId: string;
  epId?: string;
  streamId?: string;
  season?: number;
  episode?: number;
  adminKey?: string; // Novo campo para a validação no Go
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}