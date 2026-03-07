<template>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <div v-if="!isLoading && anime" class="pb-8">
    <div class="relative w-full h-64">
      <img 
        :src="getImageUrl(anime.backdrop_path || anime.poster_path, 'w780')" 
        class="w-full h-full object-cover opacity-60"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      
      <button 
        @click="$emit('back')" 
        class="absolute top-4 left-4 bg-black/50 p-2 rounded-full backdrop-blur-md active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="absolute bottom-4 left-4 right-4 flex items-end gap-4">
        <img 
          :src="getImageUrl(anime.poster_path, 'w200')" 
          class="w-24 rounded-lg shadow-xl border border-gray-700"
        />
        <div class="flex-1 pb-1">
          <h1 class="text-2xl font-bold leading-tight mb-1 text-white">{{ anime.name }}</h1>
          <div class="flex items-center gap-2 text-xs font-semibold">
            <span class="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded flex items-center gap-1">
              IMDb {{ anime.vote_average.toFixed(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-6">
      <p class="text-sm text-gray-300 leading-relaxed line-clamp-4">
        {{ anime.overview || 'Nenhuma descrição disponível.' }}
      </p>

      <section>
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Episódios (T1)</h3>
        
        <div class="space-y-3">
          <div
            v-for="ep in episodes"
            :key="ep.id"
            @click="watchEpisode(ep.id)"
            class="flex items-center gap-3 bg-gray-800 p-2 rounded-xl border border-gray-700/50 active:bg-gray-700 transition-colors cursor-pointer"
          >
            <img 
              :src="getImageUrl(ep.still_path, 'w300')" 
              class="w-28 h-16 object-cover rounded-lg bg-gray-900"
            />
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-100 truncate">{{ ep.episode_number }}. {{ ep.name }}</h4>
              <div class="flex items-center gap-2 text-[10px] text-gray-400 mt-1 font-medium">
                <span v-if="ep.air_date">{{ formatDate(ep.air_date) }}</span>
                <span v-if="ep.air_date && ep.runtime">•</span>
                <span v-if="ep.runtime">{{ ep.runtime }} min</span>
                <span v-if="ep.vote_average > 0" class="flex items-center text-yellow-500 ml-auto">
                  ★ {{ ep.vote_average.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchAnimeDetails, fetchEpisodes, getImageUrl } from '../services/api';
import type { AnimeDetail, Episode, WebAppPayload } from '../types/tmdb';

const props = defineProps<{ animeId: number }>();
const emit = defineEmits<{ (e: 'back'): void }>();

const anime = ref<AnimeDetail | null>(null);
const episodes = ref<Episode[]>([]);
const isLoading = ref<boolean>(true);

const loadDetails = async (): Promise<void> => {
  anime.value = await fetchAnimeDetails(props.animeId);
  
  if (!anime.value) {
    isLoading.value = false;
    return;
  }

  const validSeason = anime.value.seasons.find(s => s.season_number > 0);
  const targetSeason = validSeason ? validSeason.season_number : 1;

  episodes.value = await fetchEpisodes(props.animeId, targetSeason);
  isLoading.value = false;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const watchEpisode = (epId: number): void => {
  const tg = window.Telegram?.WebApp;
  
  if (!tg || !tg.sendData) {
    console.warn("Ambiente Telegram não detectado ou sendData indisponível.");
    return;
  }

  const payload: WebAppPayload = {
    action: "WATCH",
    animeId: props.animeId.toString(),
    epId: epId.toString()
  };

  tg.HapticFeedback.notificationOccurred('success');
  tg.sendData(JSON.stringify(payload));
};

onMounted(loadDetails);
</script>