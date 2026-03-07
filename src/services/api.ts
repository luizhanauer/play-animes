import type { Anime, AnimeDetail, Episode, PaginatedResponse, PlayMediaCatalog } from '../types/tmdb';

const TMDB_URL = 'https://api.themoviedb.org/3';
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  accept: 'application/json',
};

// Image Builder Pattern com Fallback para 404 (http.cat)
export const getImageUrl = (path: string | null, width: string = 'w500'): string => {
  if (!path) return 'https://http.cat/404';
  return `https://image.tmdb.org/t/p/${width}${path}`;
};

export const fetchPopularAnimes = async (page: number = 1): Promise<PaginatedResponse<Anime> | null> => {
  try {
    const res = await fetch(
      `${TMDB_URL}/discover/tv?include_adult=false&language=pt-BR&sort_by=popularity.desc&with_genres=16&with_original_language=ja&page=${page}`,
      { headers }
    );
    
    if (!res.ok) throw new Error('Falha ao buscar animes populares');
    
    return await res.json() as PaginatedResponse<Anime>;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const searchAnimes = async (query: string, page: number = 1): Promise<PaginatedResponse<Anime> | null> => {
  try {
    const res = await fetch(
      `${TMDB_URL}/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=pt-BR&page=${page}`,
      { headers }
    );

    if (!res.ok) throw new Error('Falha ao pesquisar animes');

    const data = (await res.json()) as PaginatedResponse<Anime>;
    
    const onlyAnimes = data.results.filter(
      (item) => item.original_language === 'ja' && item.genre_ids.includes(16)
    );

    return {
      ...data,
      results: onlyAnimes
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchAnimeDetails = async (id: number): Promise<AnimeDetail | null> => {
  try {
    const res = await fetch(`${TMDB_URL}/tv/${id}?language=pt-BR`, { headers });
    if (!res.ok) throw new Error('Falha ao buscar detalhes');
    
    return await res.json() as AnimeDetail;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchEpisodes = async (seriesId: number, seasonNumber: number): Promise<Episode[]> => {
  try {
    const res = await fetch(`${TMDB_URL}/tv/${seriesId}/season/${seasonNumber}?language=pt-BR`, { headers });
    if (!res.ok) throw new Error('Falha ao buscar episódios');
    
    const data = await res.json();
    return data.episodes as Episode[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Consumo do Catálogo Próprio (JSON)
export const fetchPlayMediaCatalog = async (animeId: number): Promise<PlayMediaCatalog | null> => {
  try {
    const res = await fetch(`https://luizhanauer.github.io/play-media/${animeId}.json`);
    
    // Boundary Protection: Retorno silencioso (sem erro fatal) se o JSON não existir
    if (!res.ok) return null;
    
    return await res.json() as PlayMediaCatalog;
  } catch (error) {
    console.error(error);
    return null;
  }
};