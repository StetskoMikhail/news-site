<template>
  <article 
    class="card article-card"
    @click="$router.push(`/article/${article.id}`)"
  >
    <!-- Обложка статьи -->
    <div class="image-container">
      <img 
        v-if="article.coverImage && article.coverImage !== ''"
        :src="article.coverImage"
        :alt="article.title"
        class="article-image"
        @error="handleImageError"
      />
      <div 
        v-else
        class="placeholder-image"
      >
        <span class="placeholder-icon">📰</span>
      </div>
      
      <!-- Бейдж избранного -->
      <div 
        v-if="article.isFeatured"
        class="featured-badge"
      >
        <span class="star">★</span>
        Избранное
      </div>
      
      <!-- Категория -->
      <div 
        v-if="article.category && article.category.name"
        class="category-badge"
      >
        {{ article.category.name }}
      </div>
    </div>

    <!-- Контент карточки -->
    <div class="content">
      <!-- Заголовок -->
      <h3 class="title">
        {{ article.title }}
      </h3>

      <!-- Краткое описание -->
      <p class="excerpt">
        {{ article.excerpt || 'Читайте подробности в полной версии статьи...' }}
      </p>

      <!-- Мета-информация -->
      <div class="meta-info">
        <div class="meta-left">
          <!-- Дата -->
          <span class="meta-item">
            <span class="icon">📅</span>
            {{ formatDate(article.publishDate) }}
          </span>
        </div>
        
        <!-- Просмотры -->
        <span class="meta-item">
          <span class="icon">👁️</span>
          {{ article.viewCount || 0 }}
        </span>
      </div>

      <!-- Автор и кнопка -->
      <div class="footer">
        <div class="author">
          <div class="avatar">
            <span class="avatar-text">
              {{ getInitials(article.author?.username || 'А') }}
            </span>
          </div>
          <span class="author-name">{{ article.author?.username || 'Автор' }}</span>
        </div>
        
        <!-- Стрелка -->
        <div class="arrow">
          →
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface Article {
  id: number
  title: string
  excerpt: string
  content: any
  publishDate: string
  viewCount: number
  isFeatured?: boolean
  coverImage?: string
  category?: {
    name: string
    slug: string
  }
  author?: {
    username: string
    email: string
  }
}

const props = defineProps<{
  article: Article
}>()

// Обработчик ошибок загрузки изображений
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.log('❌ Image failed to load:', img.src)
  img.style.display = 'none'
  
  // Показываем placeholder
  const container = img.parentElement
  if (container) {
    const placeholder = container.querySelector('.placeholder-image') as HTMLElement
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'сегодня'
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'сегодня'
  }
}

const getInitials = (username: string) => {
  return username ? username.charAt(0).toUpperCase() : 'А'
}
</script>

<style scoped>
.article-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #bfdbfe;
}

.image-container {
  position: relative;
  overflow: hidden;
  height: 12rem;
}

.article-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .article-image {
  transform: scale(1.05);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 3rem;
  color: #93c5fd;
  opacity: 0.5;
}

.featured-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.star {
  margin-right: 0.25rem;
}

.category-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #2563eb;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.content {
  padding: 1.25rem;
}

.title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card:hover .title {
  color: #2563eb;
}

.excerpt {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 0.25rem;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.author {
  display: flex;
  align-items: center;
}

.avatar {
  width: 1.5rem;
  height: 1.5rem;
  background: #dbeafe;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

.avatar-text {
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
}

.author-name {
  font-size: 0.75rem;
  color: #6b7280;
}

.arrow {
  color: #2563eb;
  transition: transform 0.2s ease;
}

.article-card:hover .arrow {
  transform: translateX(4px);
}
</style>