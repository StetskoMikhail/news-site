<template>
  <header class="bg-blue-600 text-white shadow-lg">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <router-link to="/" class="text-2xl font-bold">NewsSite</router-link>
        
        <div class="space-x-4">
          <router-link to="/" class="hover:text-blue-200">Главная</router-link>
          <template v-if="!user">
            <router-link to="/login" class="hover:text-blue-200">Войти</router-link>
            <router-link to="/register" class="hover:text-blue-200">Регистрация</router-link>
          </template>
          <template v-else>
            <span class="text-blue-200">{{ user.username }}</span>
            <button @click="handleLogout" class="hover:text-blue-200">Выйти</button>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null) // TODO: Заменить на реальные данные пользователя

const handleLogout = () => {
  user.value = null
  router.push('/')
}
</script>