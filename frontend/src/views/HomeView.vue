<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Отладочная информация -->
      <div v-if="!loading" class="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 class="font-bold mb-2">🐛 Отладка данных:</h3>
        <div v-for="(article, index) in articles.slice(0, 3)" :key="article.id" class="text-sm mb-2">
          <strong>Статья {{ index + 1 }}:</strong> 
          ID: {{ article.id }}, 
          Title: {{ article.title }}
        </div>
      </div>

      <!-- Заголовок -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Последние новости</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Самые свежие и интересные статьи от нашей редакции
        </p>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="card loading-card">
          <div class="loading-pulse">
            <div class="loading-line wide"></div>
            <div class="loading-line medium"></div>
            <div class="loading-line full"></div>
            <div class="loading-line two-thirds"></div>
          </div>
        </div>
      </div>

      <!-- Реальные карточки -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArticleCard 
          v-for="article in articles" 
          :key="article.id" 
          :article="article" 
        />
      </div>

      <!-- Сообщение если нет новостей -->
      <div v-if="!loading && articles.length === 0" class="text-center py-12">
        <div class="empty-card">
          <div class="empty-icon">📰</div>
          <h3 class="empty-title">Новостей пока нет</h3>
          <p class="empty-text">Статьи появятся здесь после их создания</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ArticleCard from '../components/ArticleCard.vue'
import { articleService } from '../services/api'

const articles = ref<any[]>([])
const loading = ref(true)

// Загрузка статей
const loadArticles = async () => {
  try {
    console.log('🔄 Загружаем статьи...')
    const response = await articleService.getArticles()
    console.log('📦 Ответ от API:', response)
    
    // Проверяем изображения в каждой статье
    articles.value = response.data || []
    
    console.log('🖼️ Проверка изображений в статьях:')
    articles.value.forEach((article, index) => {
      console.log(`Статья ${index + 1}:`, {
        id: article.id,
        title: article.title,
        coverImage: article.coverImage,
        hasImage: !!article.coverImage && article.coverImage !== ''
      })
    })
    
  } catch (error) {
    console.error('❌ Ошибка загрузки новостей:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-card {
  padding: 1.5rem;
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.loading-line {
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.loading-line.wide {
  height: 1rem;
  width: 75%;
}

.loading-line.medium {
  height: 0.75rem;
  width: 50%;
}

.loading-line.full {
  height: 0.75rem;
  width: 100%;
}

.loading-line.two-thirds {
  height: 0.75rem;
  width: 66.666667%;
}

.empty-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 28rem;
  margin: 0 auto;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 0.5rem;
  }
}
</style>