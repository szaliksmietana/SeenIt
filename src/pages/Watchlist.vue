<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { watchlistApi, type WatchlistItem } from '../api/services';

const items = ref<WatchlistItem[]>([]);
const loading = ref(true);
const type = ref<'' | 'movie' | 'series'>('');

async function fetchItems() {
  items.value = await watchlistApi.list();
  loading.value = false;
}

onMounted(fetchItems);

const filtered = computed(() => {
  if (!type.value) return items.value;
  return items.value.filter((i) => i.movie.media_type === type.value);
});

async function toggle(id: number) {
  await watchlistApi.toggleWatched(id);
  fetchItems();
}

async function remove(id: number) {
  await watchlistApi.remove(id);
  toast.success('Usunięto z listy');
  fetchItems();
}
</script>

<template>
  <div>
    <h1 class="h3 mb-3">Do obejrzenia</h1>

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

    <p v-if="loading" class="text-center text-secondary py-5">Ładowanie...</p>
    <p v-else-if="items.length === 0" class="text-center text-secondary py-5">
      Lista jest pusta. <RouterLink to="/movies">Przeglądaj filmy</RouterLink> i dodawaj je tutaj.
    </p>
    <p v-else-if="filtered.length === 0" class="text-center text-secondary py-5">Brak pozycji w tej kategorii.</p>

    <ul v-else class="list-group">
      <li v-for="item in filtered" :key="item.id" class="list-group-item d-flex align-items-center gap-3">
        <input type="checkbox" class="form-check-input m-0" :checked="item.watched" @change="toggle(item.id)" />
        <RouterLink
          :to="`/movies/${item.movie_id}`"
          class="flex-grow-1 text-decoration-none"
          :class="{ 'text-decoration-line-through text-secondary': item.watched }"
        >
          {{ item.movie.title }}
          <span class="text-secondary small">({{ item.movie.year }} · {{ item.movie.media_type === 'series' ? 'serial' : 'film' }})</span>
        </RouterLink>
        <button @click="remove(item.id)" class="btn btn-sm btn-outline-danger">Usuń</button>
      </li>
    </ul>
  </div>
</template>
