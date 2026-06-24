<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { moviesApi, adminApi, type Movie, type User } from '../api/services';

const movies = ref<Movie[]>([]);
const users = ref<User[]>([]);
const loading = ref(true);

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
  <p v-if="loading" class="text-center text-secondary py-5">Ładowanie...</p>

  <div v-else>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">Panel CMS</h1>
      <RouterLink to="/movies/add" class="btn btn-primary">+ Dodaj film</RouterLink>
    </div>
    <div class="row g-3 mb-4">
      <div class="col">
        <div class="card text-center">
          <div class="card-body">
            <div class="display-6 fw-bold text-primary">{{ movies.length }}</div>
            <div class="text-secondary small">Filmy / seriale</div>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card text-center">
          <div class="card-body">
            <div class="display-6 fw-bold text-primary">{{ users.length }}</div>
            <div class="text-secondary small">Użytkownicy</div>
          </div>
        </div>
      </div>
    </div>

    <h2 class="h5 mb-2">Filmy i seriale</h2>
    <table class="table table-hover align-middle">
      <thead>
        <tr><th>ID</th><th>Tytuł</th><th>Rok</th><th>Typ</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="m in movies" :key="m.id">
          <td>{{ m.id }}</td>
          <td>{{ m.title }}</td>
          <td>{{ m.year }}</td>
          <td>{{ m.media_type === 'series' ? 'Serial' : 'Film' }}</td>
          <td class="text-end">
            <button @click="deleteMovie(m.id)" class="btn btn-sm btn-outline-danger">Usuń</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h2 class="h5 mb-2 mt-4">Użytkownicy</h2>
    <table class="table table-hover align-middle">
      <thead>
        <tr><th>ID</th><th>Login</th><th>Email</th><th>Rola</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.username }}</td>
          <td>{{ u.email }}</td>
          <td>
            <span class="badge" :class="u.role === 'admin' ? 'text-bg-primary' : 'text-bg-secondary'">
              {{ u.role === 'admin' ? 'Administrator' : 'Użytkownik' }}
            </span>
          </td>
          <td class="text-end">
            <button v-if="u.role !== 'admin'" @click="deleteUser(u.id)" class="btn btn-sm btn-outline-danger">
              Usuń
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
