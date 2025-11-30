<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Заголовок -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Категории новостей</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Исследуйте новости по интересующим вас темам и категориям
        </p>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-xl shadow-lg p-6">
          <div class="animate-pulse">
            <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <!-- Список категорий -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
        >
          <div class="p-6">
            <!-- Название категории -->
            <h3 class="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <span class="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              {{ category.attributes.name }}
            </h3>
            
            <!-- Статистика -->
            <div class="flex items-center text-sm text-gray-500 mb-4">
              <span class="flex items-center mr-4">
                <span class="mr-1">📰</span>
                {{ getArticleCount(category) }} статей
              </span>
              <span class="flex items-center">
                <span class="mr-1">🔗</span>
                /{{ category.attributes.slug }}
              </span>
            </div>

            <!-- Кнопка просмотра -->
            <router-link 
              :to="`/?category=${category.attributes.slug}`"
              class="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center group"
            >
              <span>Смотреть новости</span>
              <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-if="!loading && categories.length === 0" class="text-center py-12">
        <div class="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <div class="text-6xl mb-4">📂</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Категорий пока нет</h3>
          <p class="text-gray-600 mb-6">Категории появятся здесь после их создания в админ-панели</p>
          <router-link 
            to="/" 
            class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Вернуться на главную
          </router-link>
        </div>
      </div>

      <!-- Информационный блок -->
      <div v-if="!loading && categories.length > 0" class="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div class="flex items-start">
          <div class="text-2xl mr-4">💡</div>
          <div>
            <h3 class="font-bold text-blue-900 mb-2">Как это работает?</h3>
            <p class="text-blue-800">
              Выберите интересующую категорию чтобы просмотреть все новости по этой теме. 
              Каждая категория содержит уникальные статьи от наших авторов и редакторов.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoryService, type Category } from '@/services/api'

const categories = ref<Category[]>([])
const loading = ref(true)

// В реальном приложении здесь бы был запрос для получения количества статей
// Пока используем заглушку
const getArticleCount = (category: Category) => {
  // Заглушка - в реальном приложении нужно делать отдельный запрос
  // или чтобы бэкенд возвращал count в ответе
  const counts: { [key: string]: number } = {
    'politics': 15,
    'technology': 23,
    'sports': 8,
    'entertainment': 12,
    'science': 7,
    'business': 18
  }
  
  return counts[category.attributes.slug] || Math.floor(Math.random() * 20) + 5
}

onMounted(async () => {
  try {
    const response = await categoryService.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Дополнительные стили для красивого отображения */
.category-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}
</style>