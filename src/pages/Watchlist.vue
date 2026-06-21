<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { watchlistApi, type WatchlistItem } from '../api/services';

const items = ref<WatchlistItem[]>([]);
const loading = ref(true);

async function fetchItems() {
  items.value = await watchlistApi.list();
  loading.value = false;
}

onMounted(fetchItems);

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
    <h1>Do obejrzenia</h1>

    <p v-if="loading" class="loader">Ładowanie...</p>
    <p v-else-if="items.length === 0" class="empty">
      Lista jest pusta. <RouterLink to="/movies">Przeglądaj filmy</RouterLink> i dodawaj je tutaj.
    </p>

    <ul v-else class="watchlist">
      <li v-for="item in items" :key="item.id" :class="{ watched: item.watched }">
        <input type="checkbox" :checked="item.watched" @change="toggle(item.id)" />
        <RouterLink :to="`/movies/${item.movie_id}`" class="watchlist-title">
          {{ item.movie.title }} <span class="muted">({{ item.movie.year }})</span>
        </RouterLink>
        <button @click="remove(item.id)" class="btn btn-sm btn-danger">Usuń</button>
      </li>
    </ul>
  </div>
</template>
