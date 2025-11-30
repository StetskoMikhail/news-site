<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
</script>

<style scoped>
</style>