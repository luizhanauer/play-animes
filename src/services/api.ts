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
      { 
        headers,
        cache: 'default' // Permitimos cache normal para dados estáticos do TMDB
      }
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
      { 
        headers,
        cache: 'default' 
      }
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
    const res = await fetch(`${TMDB_URL}/tv/${id}?language=pt-BR`, { 
      headers,
      cache: 'default'
    });
    
    if (!res.ok) throw new Error('Falha ao buscar detalhes');
    
    return await res.json() as AnimeDetail;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchEpisodes = async (seriesId: number, seasonNumber: number): Promise<Episode[]> => {
  try {
    const res = await fetch(`${TMDB_URL}/tv/${seriesId}/season/${seasonNumber}?language=pt-BR`, { 
      headers,
      cache: 'default'
    });
    
    if (!res.ok) throw new Error('Falha ao buscar episódios');
    
    const data = await res.json();
    return data.episodes as Episode[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Consumo do Catálogo Próprio com Cache Busting (Garante dados sempre frescos após o Mapeamento)
export const fetchPlayMediaCatalog = async (animeId: number): Promise<PlayMediaCatalog | null> => {
  try {
    // Adiciona o timestamp na URL para forçar um bypass agressivo no cache da WebView do Telegram
    const timestamp = new Date().getTime();
    const url = `https://luizhanauer.github.io/play-media/${animeId}/episodes.json?t=${timestamp}`;
    
    const res = await fetch(url, {
      // Diretiva HTTP padrão para não armazenar cache (funciona em navegadores modernos)
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    
    return await res.json() as PlayMediaCatalog;
  } catch (error) {
    console.error(error);
    return null;
  }
};