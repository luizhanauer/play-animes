<template>
  <div class="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500/30">
    <DetailView 
      v-if="selectedAnimeId" 
      :animeId="selectedAnimeId" 
      @back="clearSelection" 
    />
    <HomeView 
      v-if="!selectedAnimeId" 
      @select="setAnime" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HomeView from './components/HomeView.vue';
import DetailView from './components/DetailView.vue';

const selectedAnimeId = ref<number | null>(null);

const setAnime = (id: number): void => {
  selectedAnimeId.value = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const clearSelection = (): void => {
  selectedAnimeId.value = null;
};

onMounted(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#111827');
  }
});
</script>