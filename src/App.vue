<script setup lang="ts">
// Główny komponent. Pokazuje pasek nawigacji na górze,
// a pod nim RouterView — czyli aktualną podstronę wybraną przez router.
import Navbar from './components/Navbar.vue';
</script>

<template>
  <Navbar />
  <main class="container">
    <RouterView />
  </main>
</template>
