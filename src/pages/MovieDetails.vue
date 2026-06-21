<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { moviesApi, watchlistApi, type Movie } from '../api/services';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

const movie = ref<Movie | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    movie.value = await moviesApi.get(id);
  } catch {
    toast.error('Nie znaleziono filmu');
  } finally {
    loading.value = false;
  }
});

async function handleDelete() {
  if (!confirm('Na pewno usunąć ten film?')) return;
  await moviesApi.remove(id);
  toast.success('Usunięto');
  router.push('/movies');
}

async function handleAddToWatchlist() {
  try {
    await watchlistApi.add(id);
    toast.success('Dodano do listy do obejrzenia');
  } catch (err: any) {
    toast.error(err.message);
  }
}
</script>

<template>
  <p v-if="loading" class="loader">Ładowanie...</p>
  <p v-else-if="!movie" class="empty">Nie znaleziono filmu.</p>

  <div v-else class="detail">
    <RouterLink to="/movies" class="back-link">← Powrót do listy</RouterLink>

    <div class="detail-header">
      <div class="detail-poster">{{ movie.media_type === 'series' ? '📺' : '🎬' }}</div>
      <div>
        <h1>{{ movie.title }}</h1>
        <p class="muted">
          {{ movie.year }} · {{ movie.media_type === 'series' ? 'Serial' : 'Film' }}
          <template v-if="movie.duration_minutes"> · {{ movie.duration_minutes }} min</template>
        </p>
        <p v-if="movie.avg_rating" class="rating-big">★ {{ movie.avg_rating }} / 10</p>
      </div>
    </div>

    <dl class="detail-info">
      <dt>Reżyser</dt><dd>{{ movie.director || '—' }}</dd>
      <dt>Gatunek</dt><dd>{{ movie.genre || '—' }}</dd>
      <dt>Kraj</dt><dd>{{ movie.country || '—' }}</dd>
    </dl>

    <p v-if="movie.description" class="detail-desc">{{ movie.description }}</p>

    <div class="detail-actions">
      <button @click="handleAddToWatchlist" class="btn">+ Do obejrzenia</button>
      <RouterLink :to="`/movies/${movie.id}/edit`" class="btn">Edytuj</RouterLink>
      <button @click="handleDelete" class="btn btn-danger">Usuń</button>
    </div>
  </div>
</template>
