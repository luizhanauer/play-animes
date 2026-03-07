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

// --- Tipagens do Play Media (Seu JSON do GitHub Pages) ---
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

// --- Tipagens de Agregação (UI) ---
export interface MappedEpisode extends Episode {
  stream_id?: string;
}

export interface WebAppPayload {
  action: string;
  animeId: string;
  epId: string;
  streamId?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}