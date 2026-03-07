<template>
  <div class="p-4 pb-8 max-w-7xl mx-auto">
    <header class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-blue-400 tracking-tight">Play Animes</h1>
      <p class="text-sm text-gray-400 mt-1">
        {{ isSearching ? `Resultados para "${searchQuery}"` : 'Populares no momento' }}
      </p>
    </header>

    <div class="relative mb-6 max-w-2xl mx-auto">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        @input="handleInput"
        type="text"
        placeholder="Buscar animes..."
        class="block w-full pl-10 pr-10 py-3 border border-gray-700/50 rounded-xl leading-5 bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
      />
      <button 
        v-if="searchQuery" 
        @click="clearSearch" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      <div 
        v-for="anime in animes" 
        :key="anime.id"
        @click="$emit('select', anime.id)"
        class="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700/50 cursor-pointer transition-transform active:scale-95 flex flex-col h-full group hover:border-gray-500"
      >
        <img 
          :src="getImageUrl(anime.poster_path)" 
          :alt="anime.name" 
          class="w-full aspect-[2/3] object-cover bg-gray-900 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div class="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-xs font-bold text-white">{{ (anime.vote_average || 0).toFixed(1) }}</span>
        </div>
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent p-3 pt-12">
          <h2 class="text-sm font-bold text-white truncate drop-shadow-md group-hover:text-blue-400 transition-colors">{{ anime.name }}</h2>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && animes.length === 0" class="text-center text-gray-500 mt-10">
      Nenhum anime encontrado.
    </div>

    <div ref="sentinel" class="flex justify-center items-center h-20 mt-4">
      <div v-if="isLoading" class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { fetchPopularAnimes, searchAnimes, getImageUrl } from '../services/api';
import type { Anime, PaginatedResponse } from '../types/tmdb';

defineEmits<{ (e: 'select', id: number): void }>();

const animes = ref<Anime[]>([]);
const isLoading = ref<boolean>(false);
const currentPage = ref<number>(1);
const totalPages = ref<number>(1);
const searchQuery = ref<string>('');
const searchTimeout = ref<number | null>(null);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const isSearching = computed((): boolean => searchQuery.value.trim().length > 0);
const hasMorePages = computed((): boolean => currentPage.value < totalPages.value);

const loadData = async (reset: boolean = false): Promise<void> => {
  if (isLoading.value) return;
  
  if (reset) {
    currentPage.value = 1;
    animes.value = [];
  }

  isLoading.value = true;
  const query = searchQuery.value.trim();
  
  let response: PaginatedResponse<Anime> | null = null;

  if (query) {
    response = await searchAnimes(query, currentPage.value);
  }

  if (!query) {
    response = await fetchPopularAnimes(currentPage.value);
  }

  if (response) {
    animes.value.push(...response.results);
    totalPages.value = response.total_pages;
    currentPage.value++;
  }

  isLoading.value = false;
};

const handleInput = (): void => {
  if (searchTimeout.value !== null) {
    clearTimeout(searchTimeout.value);
  }
  
  searchTimeout.value = window.setTimeout(() => {
    loadData(true);
  }, 500);
};

const clearSearch = (): void => {
  searchQuery.value = '';
  if (searchTimeout.value !== null) {
    clearTimeout(searchTimeout.value);
  }
  loadData(true);
};

const setupObserver = (): void => {
  observer = new IntersectionObserver((entries) => {
    const target = entries[0];
    
    // Boundary Protection: Validando o IntersectionObserverEntry estritamente
    if (!target) return;
    if (!target.isIntersecting) return;
    if (!hasMorePages.value) return;
    if (isLoading.value) return;

    loadData(false);
  }, { rootMargin: '100px' });

  if (sentinel.value) {
    observer.observe(sentinel.value);
  }
};

onMounted(() => {
  loadData(true).then(() => {
    setupObserver();
  });
});

onUnmounted(() => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value);
    observer.disconnect();
  }
});
</script>