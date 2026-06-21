<script setup lang="ts">
// Główny komponent. Pasek nawigacji na górze, pod nim aktualna podstrona.
import Navbar from './components/Navbar.vue';
</script>

<template>
  <Navbar />
  <main class="container py-4">
    <RouterView />
  </main>
</template>
