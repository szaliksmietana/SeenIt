<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { moviesApi, type Movie } from '../api/services';

const movies = ref<Movie[]>([]);
const loading = ref(true);
const search = ref('');
const type = ref('');

// Pobiera filmy z uwzględnieniem wyszukiwania i filtra typu.
async function fetchMovies() {
  loading.value = true;
  movies.value = await moviesApi.list({
    search: search.value || undefined,
    media_type: type.value || undefined,
  });
  loading.value = false;
}

// Pobierz raz przy wejściu na stronę.
onMounted(fetchMovies);

// Reaguj na zmianę wyszukiwarki/filtra z lekkim opóźnieniem (debounce),
// żeby nie odpytywać przy każdej literze.
let timer: number;
watch([search, type], () => {
  clearTimeout(timer);
  timer = setTimeout(fetchMovies, 300);
});
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Filmy i seriale</h1>
      <RouterLink to="/movies/add" class="btn btn-primary">+ Dodaj</RouterLink>
    </div>

    <div class="filters">
      <input v-model="search" placeholder="Szukaj po tytule..." />
      <select v-model="type">
        <option value="">Wszystkie</option>
        <option value="movie">Filmy</option>
        <option value="series">Seriale</option>
      </select>
    </div>

    <p v-if="loading" class="loader">Ładowanie...</p>
    <p v-else-if="movies.length === 0" class="empty">Brak wyników.</p>
    <div v-else class="movie-grid">
      <!-- v-for = dla każdego filmu wygeneruj kartę. :key pomaga Vue śledzić elementy. -->
      <RouterLink
        v-for="m in movies"
        :key="m.id"
        :to="`/movies/${m.id}`"
        class="movie-card"
      >
        <div class="movie-card-poster">{{ m.media_type === 'series' ? '📺' : '🎬' }}</div>
        <div class="movie-card-body">
          <h3>{{ m.title }}</h3>
          <p class="muted">{{ m.year }} · {{ m.genre }}</p>
          <span v-if="m.avg_rating" class="rating">★ {{ m.avg_rating }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
