<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <div v-if="!isLoading && anime" class="pb-8 max-w-7xl mx-auto">
    <div class="relative w-full h-64 sm:h-80 md:h-96 rounded-b-3xl overflow-hidden shadow-2xl">
      <img 
        :src="getImageUrl(anime.backdrop_path || anime.poster_path, 'w1280')" 
        class="w-full h-full object-cover opacity-60"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
      
      <button 
        @click="$emit('back')" 
        class="absolute top-4 left-4 bg-black/50 p-2 rounded-full backdrop-blur-md active:scale-95 transition-transform hover:bg-black/70"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="absolute bottom-4 left-4 right-4 flex items-end gap-4 md:gap-6 md:left-8 md:bottom-8">
        <img 
          :src="getImageUrl(anime.poster_path, 'w300')" 
          class="w-24 md:w-32 rounded-lg shadow-xl border border-gray-700/80"
        />
        <div class="flex-1 pb-1">
          <h1 class="text-2xl md:text-4xl font-bold leading-tight mb-2 text-white drop-shadow-lg">{{ anime.name }}</h1>
          <div class="flex items-center gap-2 text-xs md:text-sm font-semibold">
            <span class="bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
              IMDb {{ anime.vote_average.toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 md:p-8 md:pt-6 space-y-6 md:space-y-8">
      <p class="text-sm md:text-base text-gray-300 leading-relaxed md:w-3/4">
        {{ anime.overview || 'Nenhuma descrição disponível.' }}
      </p>

      <section>
        <h3 class="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider mb-4 md:mb-6 border-b border-gray-800 pb-2">
          Episódios (T{{ targetSeasonNumber }})
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div
            v-for="ep in mappedEpisodes"
            :key="ep.id"
            class="flex items-center gap-3 md:gap-4 bg-gray-800 p-2.5 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors group"
          >
            <img 
              :src="getImageUrl(ep.still_path, 'w300')" 
              class="w-28 md:w-36 h-16 md:h-20 object-cover rounded-lg bg-gray-900 shadow-inner"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-center h-full py-1">
              <h4 class="text-sm md:text-base font-bold text-gray-100 truncate group-hover:text-blue-400 transition-colors">
                {{ ep.episode_number }}. {{ ep.name }}
              </h4>
              
              <div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mt-1 font-medium w-full">
                <span v-if="ep.air_date">{{ formatDate(ep.air_date) }}</span>
                <span v-if="ep.air_date && ep.vote_average > 0">•</span>
                <span v-if="ep.vote_average > 0" class="flex items-center text-yellow-500 font-bold">
                  ★ {{ ep.vote_average.toFixed(1) }}
                </span>
              </div>
              
              <div class="flex items-center gap-2 mt-2.5">
                <button
                  v-if="ep.stream_id"
                  @click="watchEpisode(ep.episode_number, ep.stream_id)"
                  class="bg-blue-600/90 hover:bg-blue-500 text-white text-xs md:text-sm font-bold py-1.5 md:py-2 px-4 rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  Assistir
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                </button>

                <button
                  v-if="isAdmin"
                  @click="prepareMapping(ep.episode_number)"
                  class="bg-purple-600/90 hover:bg-purple-500 text-white text-xs md:text-sm font-bold py-1.5 md:py-2 px-4 rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-1.5 border border-purple-400/30"
                >
                  Mapear
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchAnimeDetails, fetchEpisodes, fetchPlayMediaCatalog, getImageUrl } from '../services/api';
import type { AnimeDetail, Episode, PlayMediaCatalog, MappedEpisode, WebAppPayload } from '../types/tmdb';

const props = defineProps<{ animeId: number }>();
defineEmits<{ (e: 'back'): void }>();

// Estados Reativos
const anime = ref<AnimeDetail | null>(null);
const tmdbEpisodes = ref<Episode[]>([]);
const playMediaCatalog = ref<PlayMediaCatalog | null>(null);
const isLoading = ref<boolean>(true);
const targetSeasonNumber = ref<number>(1);

// Flag de Admin (A validação real ocorre no Bot Go)
const isAdmin = ref<boolean>(true); 

// Composição de Dados: Mescla o TMDB com o Catálogo Local
const mappedEpisodes = computed<MappedEpisode[]>(() => {
  return tmdbEpisodes.value.map((ep) => ({
    ...ep,
    stream_id: getStreamId(ep.episode_number)
  }));
});

// Busca o Stream ID ofuscado no JSON do GitHub Pages
const getStreamId = (epNumber: number): string | undefined => {
  if (!playMediaCatalog.value) return undefined;
  
  const season = playMediaCatalog.value.seasons.find(s => s.season_number === targetSeasonNumber.value);
  if (!season) return undefined;

  const episode = season.episodes.find(e => e.episode_number === epNumber);
  return episode?.stream_id;
};

// Carregamento Atômico de Dados
const loadDetails = async (): Promise<void> => {
  const [animeData, catalogData] = await Promise.all([
    fetchAnimeDetails(props.animeId),
    fetchPlayMediaCatalog(props.animeId)
  ]);
  
  anime.value = animeData;
  playMediaCatalog.value = catalogData;

  if (!anime.value) {
    isLoading.value = false;
    return;
  }

  // Prioriza a primeira temporada disponível que não seja a 0 (especiais)
  const validSeason = anime.value.seasons.find(s => s.season_number > 0);
  targetSeasonNumber.value = validSeason ? validSeason.season_number : 1;

  tmdbEpisodes.value = await fetchEpisodes(props.animeId, targetSeasonNumber.value);
  isLoading.value = false;
};

// Formatação de Data seguindo padrão local
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Ação: Assistir
 * Envia o payload WATCH para o bot entregar o arquivo do grupo privado
 */
const watchEpisode = (epNumber: number, streamId: string): void => {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.sendData) {
    console.warn("Ambiente Telegram não detectado.");
    return;
  }

  const payload: WebAppPayload = {
    action: "WATCH",
    animeId: props.animeId.toString(),
    epId: epNumber.toString(),
    streamId: streamId
  };

  tg.HapticFeedback.notificationOccurred('success');
  tg.sendData(JSON.stringify(payload));
};

/**
 * Ação Admin: Mapear
 * Sinaliza ao bot que o próximo vídeo recebido no chat será deste episódio
 */
const prepareMapping = (epNumber: number): void => {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.sendData) return;

  const payload = {
    action: "START_MAPPING",
    animeId: props.animeId.toString(),
    season: targetSeasonNumber.value,
    episode: epNumber
  };

  tg.HapticFeedback.impactOccurred('medium');
  tg.sendData(JSON.stringify(payload));
  
  // Fecha o Mini App para permitir o upload no chat
  setTimeout(() => tg.close(), 150);
};

onMounted(loadDetails);
</script>