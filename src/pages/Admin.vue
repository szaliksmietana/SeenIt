<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { moviesApi, adminApi, type Movie, type User } from '../api/services';

// Panel CMS — dostępny tylko dla administratora (pilnuje tego router).
// Pozwala przeglądać i usuwać filmy oraz użytkowników.
const movies = ref<Movie[]>([]);
const users = ref<User[]>([]);
const loading = ref(true);

// Pobiera jednocześnie filmy i użytkowników.
async function fetchData() {
  loading.value = true;
  const [m, u] = await Promise.all([moviesApi.list(), adminApi.allUsers()]);
  movies.value = m;
  users.value = u;
  loading.value = false;
}

onMounted(fetchData);

async function deleteMovie(id: number) {
  if (!confirm('Usunąć ten film?')) return;
  await moviesApi.remove(id);
  toast.success('Film usunięty');
  fetchData();
}

async function deleteUser(id: number) {
  if (!confirm('Usunąć tego użytkownika?')) return;
  await adminApi.removeUser(id);
  toast.success('Użytkownik usunięty');
  fetchData();
}
</script>

<template>
  <p v-if="loading" class="loader">Ładowanie...</p>

  <div v-else>
    <h1>Panel CMS</h1>

    <!-- Liczniki treści -->
    <div class="stats">
      <div class="stat-box">
        <span class="stat-num">{{ movies.length }}</span>
        <span class="stat-label">Filmy / seriale</span>
      </div>
      <div class="stat-box">
        <span class="stat-num">{{ users.length }}</span>
        <span class="stat-label">Użytkownicy</span>
      </div>
    </div>

    <!-- Tabela filmów -->
    <h2 class="admin-section">Filmy i seriale</h2>
    <table class="admin-table">
      <thead>
        <tr><th>ID</th><th>Tytuł</th><th>Rok</th><th>Typ</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="m in movies" :key="m.id">
          <td>{{ m.id }}</td>
          <td>{{ m.title }}</td>
          <td>{{ m.year }}</td>
          <td>{{ m.media_type === 'series' ? 'Serial' : 'Film' }}</td>
          <td><button @click="deleteMovie(m.id)" class="btn btn-sm btn-danger">Usuń</button></td>
        </tr>
      </tbody>
    </table>

    <!-- Tabela użytkowników -->
    <h2 class="admin-section">Użytkownicy</h2>
    <table class="admin-table">
      <thead>
        <tr><th>ID</th><th>Login</th><th>Email</th><th>Rola</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.username }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role === 'admin' ? 'Administrator' : 'Użytkownik' }}</td>
          <td>
            <!-- Administratora nie da się usunąć, żeby nie zablokować panelu. -->
            <button
              v-if="u.role !== 'admin'"
              @click="deleteUser(u.id)"
              class="btn btn-sm btn-danger"
            >Usuń</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
