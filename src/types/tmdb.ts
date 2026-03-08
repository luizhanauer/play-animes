// src/types/tmdb.ts

/**
 * Representação básica de um anime vinda do TMDB (Discover/Search)
 */
export interface Anime {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  original_language: string;
  genre_ids: number[];
}

/**
 * Estrutura de temporada resumida para detalhes do anime
 */
export interface Season {
  season_number: number;
  episode_count: number;
}

/**
 * Detalhes completos de um anime (TMDB /tv/{id})
 */
export interface AnimeDetail extends Anime {
  overview: string;
  seasons: Season[];
  backdrop_path: string | null;
}

/**
 * Estrutura de um episódio individual (TMDB /tv/{id}/season/{n})
 */
export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
  vote_average: number;
}

/** * --- Tipagens do Play Media (Domínio Local / GitHub Pages) --- 
 * Estas refletem o seu JSON estruturado em /docs/{id}/episodes.json
 */

export interface PlayMediaEpisode {
  episode_number: number;
  stream_id: string; // Hash Base64 (ex: TVF_OA==)
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

/** * --- Tipagens de Agregação (UI) --- 
 */

export interface MappedEpisode extends Episode {
  stream_id?: string;
}

/**
 * Payload enviado via tg.sendData para o Bot (Go)
 * Suporta as ações 'WATCH' e 'START_MAPPING'
 */
export interface WebAppPayload {
  action: 'WATCH' | 'START_MAPPING';
  animeId: string;
  
  // Campos para WATCH
  epId?: string;       // Número do episódio para contexto/log
  streamId?: string;   // O hash Base64 para entrega do arquivo
  
  // Campos para START_MAPPING (Admin Mode)
  season?: number;
  episode?: number;
}

/**
 * Resposta padrão de paginação do TMDB
 */
export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}