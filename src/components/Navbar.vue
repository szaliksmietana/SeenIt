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
  <!-- Gotowy komponent navbar z Bootstrapa. -->
  <nav class="navbar navbar-expand bg-body-tertiary border-bottom">
    <div class="container">
      <!-- Jeśli masz logo w public/, podmień tekst na:
           <img src="/logo.png" alt="SeenIt" height="28" /> -->
      <RouterLink to="/movies" class="navbar-brand fw-bold">SeenIt</RouterLink>

      <!-- Menu tylko dla zalogowanego użytkownika. -->
      <ul v-if="user" class="navbar-nav ms-auto align-items-center gap-2">
        <li class="nav-item"><RouterLink to="/movies" class="nav-link">Filmy</RouterLink></li>
        <li class="nav-item"><RouterLink to="/watchlist" class="nav-link">Do obejrzenia</RouterLink></li>
        <li class="nav-item"><RouterLink to="/profile" class="nav-link">Profil</RouterLink></li>
        <!-- Dodawanie i panel CMS tylko dla administratora. -->
        <li v-if="user.role === 'admin'" class="nav-item">
          <RouterLink to="/movies/add" class="nav-link">Dodaj</RouterLink>
        </li>
        <li v-if="user.role === 'admin'" class="nav-item">
          <RouterLink to="/admin" class="nav-link">Panel CMS</RouterLink>
        </li>
        <li class="nav-item"><span class="navbar-text fw-semibold">{{ user.username }}</span></li>
        <li class="nav-item">
          <button @click="handleLogout" class="btn btn-sm btn-outline-secondary">Wyloguj</button>
        </li>
      </ul>
    </div>
  </nav>
</template>
