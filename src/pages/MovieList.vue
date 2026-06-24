<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { moviesApi, type Movie } from '../api/services';
import { useAuth } from '../stores/auth';

const { user } = useAuth();

const movies = ref<Movie[]>([]);
const loading = ref(true);
const search = ref('');
const type = ref<'' | 'movie' | 'series'>('');

async function fetchMovies() {
  loading.value = true;
  movies.value = await moviesApi.list({
    search: search.value || undefined,
    media_type: type.value || undefined,
  });
  loading.value = false;
}

onMounted(fetchMovies);

let timer: number;
watch([search, type], () => {
  clearTimeout(timer);
  timer = setTimeout(fetchMovies, 300);
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">Filmy i seriale</h1>
      <RouterLink v-if="user?.role === 'admin'" to="/movies/add" class="btn btn-primary">
        + Dodaj
      </RouterLink>
    </div>

    <ul class="nav nav-pills mb-3">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: type === '' }" @click="type = ''">Wszystkie</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: type === 'movie' }" @click="type = 'movie'">Filmy</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: type === 'series' }" @click="type = 'series'">Seriale</button>
      </li>
    </ul>

    <input v-model="search" class="form-control mb-4" placeholder="Szukaj po tytule..." />

    <p v-if="loading" class="text-center text-secondary py-5">Ładowanie...</p>
    <p v-else-if="movies.length === 0" class="text-center text-secondary py-5">Brak wyników.</p>

    <div v-else class="row g-3">
      <div v-for="m in movies" :key="m.id" class="col-6 col-md-4 col-lg-3">
        <RouterLink :to="`/movies/${m.id}`" class="card h-100 text-decoration-none">
          <div class="poster d-flex align-items-center justify-content-center">
            {{ m.media_type === 'series' ? '📺' : '🎬' }}
          </div>
          <div class="card-body">
            <h6 class="card-title mb-1">{{ m.title }}</h6>
            <p class="text-secondary small mb-1">{{ m.year }} · {{ m.genre }}</p>
            <span v-if="m.avg_rating" class="badge text-bg-warning">★ {{ m.avg_rating }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
