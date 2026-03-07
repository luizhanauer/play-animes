<template>
  <div class="min-h-screen bg-gray-900 text-white p-4 font-sans selection:bg-blue-500/30">
    <header class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-blue-400 tracking-tight">Play Animes</h1>
      <p class="text-sm text-gray-400 mt-1">Seu catálogo direto no Telegram</p>
    </header>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-if="error" class="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm mb-6 text-center">
      {{ error }}
    </div>

    <main v-if="!isLoading && catalog.length > 0" class="space-y-6 pb-8">
      <section 
        v-for="anime in catalog" 
        :key="anime.id" 
        class="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700/50"
      >
        <div class="flex items-start space-x-4 mb-5">
          <img 
            :src="anime.coverUrl" 
            :alt="anime.title" 
            class="w-24 h-32 object-cover rounded-xl shadow-md bg-gray-700" 
            loading="lazy"
          />
          <div class="flex-1">
            <h2 class="text-xl font-bold leading-tight mb-2">{{ anime.title }}</h2>
            <span
              class="text-xs px-2.5 py-1 rounded-md font-semibold inline-block"
              :class="anime.status === 'Lançamento' ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'"
            >
              {{ anime.status }}
            </span>
          </div>
        </div>

        <div class="space-y-2.5">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Episódios Disponíveis</h3>
          
          <div
            v-for="ep in anime.episodes"
            :key="ep.id"
            class="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-transparent hover:border-gray-600 transition-colors"
          >
            <div class="flex flex-col">
              <span class="text-[10px] text-gray-400 font-medium tracking-wide">EPISÓDIO {{ ep.number }}</span>
              <span class="text-sm font-semibold text-gray-100">{{ ep.title }}</span>
            </div>
            
            <button
              @click="watchEpisode(anime.id, ep.id)"
              class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              Assistir
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// --- Types (Domain Integrity) ---
interface Episode {
  id: string;
  number: number;
  title: string;
}

interface Anime {
  id: string;
  title: string;
  status: string;
  coverUrl: string;
  episodes: Episode[];
}

interface WebAppPayload {
  action: string;
  animeId: string;
  epId: string;
}

// Declaração para o TS entender a injeção do script do Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

// --- State ---
const catalog = ref<Anime[]>([]);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

// Constante apontando para o seu GitHub Pages atual
const CATALOG_URL = './animes.json';

// --- Services ---
const loadCatalog = async (): Promise<void> => {
  try {
    const response = await fetch(CATALOG_URL);
    if (!response.ok) {
      throw new Error('Não foi possível carregar o catálogo no momento.');
    }
    catalog.value = await response.json();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Ocorreu um erro técnico inesperado.';
  } finally {
    isLoading.value = false;
  }
};

const watchEpisode = (animeId: string, epId: string): void => {
  const tg = window.Telegram?.WebApp;

  // Boundary Protection: Validando o contexto do Telegram (Sem 'else')
  if (!tg) {
    error.value = "Abra este catálogo diretamente pelo botão no chat do Telegram.";
    return;
  }

  if (!tg.sendData) {
    error.value = "Recurso 'sendData' bloqueado. Use o botão do teclado do bot para abrir o app.";
    return;
  }

  // Prepara o payload exatamente como o struct WebAppPayload do Golang espera
  const payload: WebAppPayload = {
    action: "WATCH",
    animeId: animeId,
    epId: epId
  };

  tg.HapticFeedback.notificationOccurred('success');
  tg.sendData(JSON.stringify(payload));
};

// --- Lifecycle ---
onMounted(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand(); // Faz o app ocupar a tela toda do celular (melhor UX)
    tg.setHeaderColor('#111827'); // Cor de fundo do gray-900 do Tailwind
  }
  
  loadCatalog();
});
</script>