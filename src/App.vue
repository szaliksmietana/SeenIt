<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>

<template>
  <Navbar />
  <main class="container py-4">
    <RouterView />
  </main>
</template>
