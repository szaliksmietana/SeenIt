<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/auth';

const { user, logout } = useAuth();
const router = useRouter();

function handleLogout() {
  logout();
  router.push('/login');
}
</script>

<template>
  <nav class="navbar">
    <!-- Jeśli masz plik logo w public/, możesz podmienić tekst na:
         <img src="/logo.png" alt="SeenIt" class="navbar-logo" /> -->
    <RouterLink to="/movies" class="navbar-brand">SeenIt</RouterLink>

    <!-- Menu pokazujemy tylko zalogowanemu użytkownikowi (v-if). -->
    <div v-if="user" class="navbar-links">
      <RouterLink to="/movies">Filmy</RouterLink>
      <RouterLink to="/movies/add">Dodaj</RouterLink>
      <RouterLink to="/watchlist">Do obejrzenia</RouterLink>
      <RouterLink to="/profile">Profil</RouterLink>
      <!-- Link do CMS widoczny tylko dla administratora. -->
      <RouterLink v-if="user.role === 'admin'" to="/admin">Panel CMS</RouterLink>
      <span class="navbar-user">{{ user.username }}</span>
      <button @click="handleLogout" class="btn btn-sm">Wyloguj</button>
    </div>
  </nav>
</template>
