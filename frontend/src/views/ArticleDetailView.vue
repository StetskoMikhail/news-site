<template>
  <div class="article-detail">
    <!-- Отладочная информация -->
    <div class="debug-info">
      <p><strong>Route params:</strong> {{ $route.params }}</p>
      <p><strong>Article ID:</strong> {{ articleId }}</p>
      <p><strong>Loading:</strong> {{ loading }}</p>
      <p><strong>Article data:</strong> {{ article }}</p>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <div>Загрузка статьи...</div>
      </div>
    </div>

    <!-- Статья -->
    <div v-else-if="article" class="article-container">
      <!-- Хлебные крошки -->
      <nav class="breadcrumbs">
        <router-link to="/" class="breadcrumb-link">
          ← Назад к новостям
        </router-link>
      </nav>

      <!-- Обложка -->
      <div class="cover-container">
        <img 
          v-if="article.coverImage"
          :src="article.coverImage"
          :alt="article.title"
          class="cover-image"
        />
        <div 
          v-else
          class="cover-placeholder"
        >
          <span class="placeholder-icon">📰</span>
        </div>
      </div>

      <!-- Заголовок и метаданные -->
      <header class="article-header">
        <!-- Категория и избранное -->
        <div class="meta-badges">
          <span 
            v-if="article.category"
            class="category-badge"
          >
            {{ article.category.name }}
          </span>
          <span 
            v-if="article.isFeatured"
            class="featured-badge"
          >
            ★ Избранная статья
          </span>
        </div>

        <!-- Заголовок -->
        <h1 class="article-title">{{ article.title }}</h1>

        <!-- Краткое описание -->
        <p v-if="article.excerpt" class="article-excerpt">
          {{ article.excerpt }}
        </p>

        <!-- Мета-информация -->
        <div class="article-meta">
          <div class="meta-left">
            <!-- Автор -->
            <div v-if="article.author" class="author-info">
              <div class="author-avatar">
                {{ getInitials(article.author.username) }}
              </div>
              <div class="author-details">
                <span class="author-name">{{ article.author.username }}</span>
              </div>
            </div>

            <!-- Дата -->
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span class="meta-text">{{ formatDate(article.publishedAt || article.publishDate) }}</span>
            </div>

            <!-- Просмотры -->
            <div class="meta-item">
              <span class="meta-icon">👁️</span>
              <span class="meta-text">{{ article.views || article.viewCount || 0 }} просмотров</span>
            </div>

            <!-- Источник -->
            <div v-if="article.source" class="meta-item">
              <span class="meta-icon">📝</span>
              <span class="meta-text">{{ article.source }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Контент статьи -->
      <div class="article-content">
        <!-- Для простого текста -->
        <div v-if="typeof article.content === 'string'" class="content-text">
          {{ article.content }}
        </div>

        <!-- Для Strapi blocks -->
        <div v-else-if="Array.isArray(article.content)" class="content-blocks">
          <div 
            v-for="(block, index) in article.content" 
            :key="index"
            class="content-block"
          >
            <div v-if="block.type === 'paragraph'" class="paragraph">
              {{ block.children[0]?.text }}
            </div>
            <div v-else-if="block.type === 'heading'" :class="`heading heading-${block.level}`">
              {{ block.children[0]?.text }}
            </div>
          </div>
        </div>

        <!-- Если контент в другом формате -->
        <div v-else class="content-raw">
          <pre>{{ JSON.stringify(article.content, null, 2) }}</pre>
        </div>
      </div>

      <!-- Кнопки действий (только для редакторов) -->
      <div v-if="authStore.isEditor" class="action-buttons">
        <router-link 
          :to="`/edit/${article.id}`"
          class="edit-button"
        >
          ✏️ Редактировать статью
        </router-link>
        <button 
          @click="handleDelete"
          class="delete-button"
        >
          🗑️ Удалить статью
        </button>
      </div>

      <!-- Навигация -->
      <div class="article-navigation">
        <router-link to="/" class="nav-button back-button">
          ← Вернуться к списку новостей
        </router-link>
      </div>
    </div>

    <!-- Ошибка -->
    <div v-else class="error-container">
      <div class="error-content">
        <div class="error-icon">❌</div>
        <h2 class="error-title">Статья не найдена</h2>
        <p class="error-text">Возможно, статья была удалена или перемещена</p>
        <p class="error-debug">ID статьи: {{ articleId }}</p>
        <router-link to="/" class="error-button">
          Вернуться на главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { articleService } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const article = ref<any>(null)
const loading = ref(true)

// Получаем ID из параметров маршрута
const articleId = computed(() => route.params.id)

const formatDate = (dateString: string) => {
  if (!dateString) return 'Дата не указана'
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Неверная дата'
  }
}

const getInitials = (username: string) => {
  return username ? username.charAt(0).toUpperCase() : 'А'
}

const handleDelete = async () => {
  if (!article.value || !confirm('Вы уверены что хотите удалить эту статью?')) return

  try {
    await articleService.deleteArticle(article.value.id)
    router.push('/')
  } catch (error) {
    alert('Ошибка при удалении статьи')
    console.error('Ошибка удаления:', error)
  }
}

onMounted(async () => {
  try {
    const id = articleId.value
    console.log('🔄 Загружаем статью по ID:', id)
    
    // ПРОСТОЙ ЗАПРОС ПО ID
    const response = await articleService.getArticleById(id)
    console.log('📦 Ответ API:', response)
    
    if (response.data) {
      // Используем данные как есть от API
      article.value = response.data
      console.log('✅ Статья загружена:', article.value)
    } else {
      console.log('❌ Статья не найдена')
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки статьи:', error)
    
    // Если не сработало, пробуем альтернативный метод
    try {
      console.log('🔄 Пробуем альтернативный метод загрузки...')
      const id = articleId.value
      const filterResponse = await articleService.getArticles({
        [`filters[id][$eq]`]: id
      })
      
      if (filterResponse.data && filterResponse.data.length > 0) {
        article.value = filterResponse.data[0]
        console.log('✅ Статья найдена через фильтр:', article.value)
      }
    } catch (filterError) {
      console.error('❌ Ошибка альтернативного метода:', filterError)
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.article-detail {
  min-height: 100vh;
  background-color: #f9fafb;
}

/* Отладочная информация */
.debug-info {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem;
  font-size: 0.75rem;
  color: #92400e;
}

.debug-info p {
  margin: 0.25rem 0;
}

/* Загрузка */
.loading-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-content {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 1.125rem;
  color: #6b7280;
}

/* Основной контейнер */
.article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}

/* Хлебные крошки */
.breadcrumbs {
  margin-bottom: 2rem;
}

.breadcrumb-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #1d4ed8;
}

/* Обложка */
.cover-container {
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 4rem;
  color: #93c5fd;
  opacity: 0.5;
}

/* Заголовок статьи */
.article-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.meta-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.category-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.featured-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.article-excerpt {
  font-size: 1.25rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: #dbeafe;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-weight: 700;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #374151;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-icon {
  font-size: 1rem;
}

/* Контент статьи */
.article-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  line-height: 1.8;
  color: #374151;
}

.content-text {
  white-space: pre-line;
  font-size: 1.125rem;
}

.content-blocks {
  font-size: 1.125rem;
}

.content-block {
  margin-bottom: 1.5rem;
}

.paragraph {
  margin-bottom: 1rem;
}

.heading {
  font-weight: 700;
  margin: 2rem 0 1rem 0;
  color: #111827;
}

.heading-1 {
  font-size: 2rem;
}

.heading-2 {
  font-size: 1.5rem;
}

.heading-3 {
  font-size: 1.25rem;
}

.content-raw {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.875rem;
}

/* Кнопки действий */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.edit-button, .delete-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.edit-button {
  background: #2563eb;
  color: white;
}

.edit-button:hover {
  background: #1d4ed8;
}

.delete-button {
  background: #dc2626;
  color: white;
}

.delete-button:hover {
  background: #b91c1c;
}

/* Навигация */
.article-navigation {
  text-align: center;
}

.nav-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #374151;
  text-decoration: none;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Ошибка */
.error-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.error-content {
  background: white;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.error-text {
  color: #6b7280;
  margin-bottom: 1rem;
}

.error-debug {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.error-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: background 0.2s;
}

.error-button:hover {
  background: #1d4ed8;
}

/* Адаптивность */
@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .meta-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .article-header,
  .article-content {
    padding: 1.5rem;
  }
  
  .cover-image,
  .cover-placeholder {
    height: 250px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .edit-button,
  .delete-button {
    text-align: center;
  }
  
  .debug-info {
    display: none;
  }
}
</style>