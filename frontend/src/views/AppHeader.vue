<template>
  <header class="bg-blue-600 text-white shadow-lg">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Логотип -->
        <router-link to="/" class="text-2xl font-bold flex items-center space-x-2">
          <span>📰</span>
          <span>NewsSite</span>
        </router-link>
        
        <!-- Навигация -->
        <div class="flex items-center space-x-6">
          <router-link to="/" class="hover:text-blue-200 transition-colors font-medium">
            Главная
          </router-link>
          
          <router-link to="/categories" class="hover:text-blue-200 transition-colors font-medium">
            Категории
          </router-link>
          
          <!-- Кнопка создания статьи только для редакторов -->
          <router-link 
            v-if="authStore.isEditor"
            to="/create" 
            class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center space-x-2"
          >
            <span>📝</span>
            <span>Создать статью</span>
          </router-link>

          <!-- Авторизация -->
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/login" class="hover:text-blue-200 transition-colors font-medium">
              Войти
            </router-link>
            <router-link to="/register" class="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors font-medium">
              Регистрация
            </router-link>
          </template>
          
          <template v-else>
            <!-- Бейдж роли для редакторов -->
            <span 
              v-if="authStore.isEditor"
              class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium border border-purple-300"
            >
              Редактор
            </span>
            
            <span class="text-blue-200 font-medium flex items-center space-x-2">
              <span>👋</span>
              <span>{{ authStore.user?.username }}</span>
            </span>
            
            <button 
              @click="handleLogout" 
              class="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-400 transition-colors font-medium"
            >
              Выйти
            </button>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>