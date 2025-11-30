import axios from 'axios'

const API_URL = 'http://localhost:1337/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерфейсы для данных
export interface Article {
  id: number
  documentId?: string
  title: string
  slug: string
  content: string
  excerpt?: string
  publishedAt: string
  publishDate?: string
  views: number
  viewCount?: number
  isFeatured: boolean
  source?: string
  createdAt: string
  updatedAt: string
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

export interface StrapiResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiSingleResponse<T> {
  data: T
  meta: {}
}

export interface Category {
  id: number
  attributes: {
    name: string
    slug: string
    createdAt: string
    updatedAt: string
  }
}

// Вспомогательная функция для обработки изображений
const processImageData = (imageData: any): string => {
  console.log('🖼️ RAW Image data received:', imageData)
  
  if (!imageData) {
    console.log('❌ Image data is null or undefined')
    return ''
  }
  
  // Если это строка (уже обработанный URL)
  if (typeof imageData === 'string') {
    console.log('📝 Image is string:', imageData)
    if (imageData.startsWith('http')) return imageData
    if (imageData.startsWith('/')) return `http://localhost:1337${imageData}`
    return `http://localhost:1337${imageData}`
  }
  
  // Если это объект Strapi с data
  if (imageData.data) {
    console.log('📦 Image has data property:', imageData.data)
    
    // Для MongoDB структура может быть разной
    const imageAttributes = imageData.data.attributes || imageData.data
    
    console.log('🔍 Image attributes:', imageAttributes)
    
    const url = imageAttributes?.url || imageAttributes?.formats?.thumbnail?.url
    
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:1337${url}`
      console.log('✅ Built image URL:', fullUrl)
      return fullUrl
    } else {
      console.log('❌ No URL found in image attributes')
    }
  }
  
  // Если это простой объект с url
  if (imageData.url) {
    console.log('🔗 Image has direct url:', imageData.url)
    return imageData.url.startsWith('http') ? imageData.url : `http://localhost:1337${imageData.url}`
  }
  
  // Если это attributes объект
  if (imageData.attributes) {
    console.log('🏷️ Image has attributes:', imageData.attributes)
    const url = imageData.attributes.url
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:1337${url}`
      console.log('✅ Built image URL from attributes:', fullUrl)
      return fullUrl
    }
  }
  
  console.log('❌ No valid image structure found')
  return ''
}

// Вспомогательная функция для обработки отношений (relations)
const processRelationData = (relationData: any): any => {
  if (!relationData) return null
  
  // Если это массив данных Strapi
  if (Array.isArray(relationData)) {
    return relationData.map(item => ({
      id: item.id,
      ...item.attributes
    }))
  }
  
  // Если это объект данных Strapi
  if (relationData.data) {
    if (Array.isArray(relationData.data)) {
      return relationData.data.map((item: any) => ({
        id: item.id,
        ...item.attributes
      }))
    } else {
      return {
        id: relationData.data.id,
        ...relationData.data.attributes
      }
    }
  }
  
  // Если это уже обработанный объект
  return relationData
}

// Функция для преобразования данных статьи из Strapi формата
const transformArticleData = (articleData: any): Article => {
  if (!articleData) return {} as Article
  
  // Если данные уже в нужном формате (из getArticles)
  if (articleData.id && articleData.title) {
    return {
      ...articleData,
      coverImage: processImageData(articleData.coverImage),
      category: processRelationData(articleData.category),
      author: processRelationData(articleData.author)
    }
  }
  
  // Если данные в Strapi формате (из getArticleById)
  if (articleData.attributes) {
    const attributes = articleData.attributes
    return {
      id: articleData.id,
      documentId: articleData.documentId,
      title: attributes.title,
      slug: attributes.slug,
      content: attributes.content,
      excerpt: attributes.excerpt,
      publishedAt: attributes.publishedAt,
      publishDate: attributes.publishDate,
      views: attributes.views,
      viewCount: attributes.viewCount,
      isFeatured: attributes.isFeatured,
      source: attributes.source,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
      coverImage: processImageData(attributes.coverImage),
      category: processRelationData(attributes.category),
      author: processRelationData(attributes.author)
    }
  }
  
  return {} as Article
}

export const articleService = {
  // Получить все статьи
async getArticles(params?: any): Promise<{data: Article[]}> {
  try {
    console.log('📡 API: Запрос всех статей')
    
    // ПРАВИЛЬНЫЙ ФОРМАТ для Strapi v4 - строковый
    const defaultParams = {
       populate: '*',
      sort: 'publishedAt:desc',
      ...params
    }
    
    const response = await api.get('/articles', { params: defaultParams })
    console.log('📦 API: Ответ всех статей', response.data)
    
    // Детальная отладка coverImage
    console.log('🖼️ CoverImage debug in articles list:')
    response.data.data.forEach((article: any, index: number) => {
      console.log(`Статья ${index + 1} (ID: ${article.id}):`, {
        hasCoverImage: !!article.coverImage,
        coverImageData: article.coverImage,
        title: article.title
      })
    })
    
    const transformedData = {
      data: response.data.data.map((article: any) => transformArticleData(article))
    }
    
    return transformedData
    
  } catch (error) {
    console.error('❌ API: Ошибка загрузки статей:', error)
    throw error
  }
},

  // Получить статью по ID
  async getArticleById(id: string | number): Promise<{data: Article}> {
    const response = await api.get(`/articles/${id}?populate=*`)
    return { data: transformArticleData(response.data.data) }
  },

  // Получить избранные статьи
  async getFeaturedArticles(): Promise<{data: Article[]}> {
    const response = await api.get('/articles/featured')
    return { data: response.data.data.map((article: any) => transformArticleData(article)) }
  },

  // Увеличить просмотры
  async incrementViews(id: number | string): Promise<any> {
    const response = await api.post(`/articles/${id}/increment-views`)
    return response.data
  },

  // Публикация статьи (для редакторов)
  async publishArticle(id: number | string, token: string): Promise<any> {
    const response = await api.post(`/articles/${id}/publish`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },



  // Остальные методы без изменений
  async createArticle(articleData: any) {
    try {
      const response = await api.post('/articles', { data: articleData })
      return response.data
    } catch (error) {
      console.error('❌ API: Ошибка создания статьи:', error)
      throw error
    }
  },

  async updateArticle(id: number, articleData: any) {
    try {
      const response = await api.put(`/articles/${id}`, { data: articleData })
      return response.data
    } catch (error) {
      console.error(`❌ API: Ошибка обновления статьи ${id}:`, error)
      throw error
    }
  },

  async deleteArticle(id: number) {
    try {
      const response = await api.delete(`/articles/${id}`)
      return response.data
    } catch (error) {
      console.error(`❌ API: Ошибка удаления статьи ${id}:`, error)
      throw error
    }
  },

  // Поиск статей по фильтрам
  async searchArticles(filters: any): Promise<{data: Article[]}> {
    try {
      console.log('📡 API: Поиск статей по фильтрам', filters)
      
      const response = await api.get('/articles', {
        params: {
          ...filters,
          populate: '*'
        }
      })
      
      const transformedData = {
        data: response.data.data.map((article: any) => transformArticleData(article))
      }
      
      return transformedData
      
    } catch (error) {
      console.error('❌ API: Ошибка поиска статей:', error)
      throw error
    }
  }
}

export const authService = {
  async login(email: string, password: string) {
    try {
      console.log('📡 API: Авторизация пользователя')
      const response = await api.post('/auth/local', {
        identifier: email,
        password
      })
      return response.data
    } catch (error) {
      console.error('❌ API: Ошибка авторизации:', error)
      throw error
    }
  },

  async register(username: string, email: string, password: string) {
    try {
      console.log('📡 API: Регистрация пользователя')
      const response = await api.post('/auth/local/register', {
        username,
        email,
        password
      })
      return response.data
    } catch (error) {
      console.error('❌ API: Ошибка регистрации:', error)
      throw error
    }
  },

  async getMe(token: string) {
    try {
      console.log('📡 API: Получение данных пользователя')
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      console.error('❌ API: Ошибка получения данных пользователя:', error)
      throw error
    }
  }
}

export const categoryService = {
  async getCategories() {
    try {
      console.log('📡 API: Запрос категорий')
      const response = await api.get('/categories?populate=*')
      return response.data
    } catch (error) {
      console.error('❌ API: Ошибка загрузки категорий:', error)
      throw error
    }
  },

  async getCategory(slug: string) {
    try {
      console.log(`📡 API: Запрос категории ${slug}`)
      const response = await api.get(`/categories?filters[slug][$eq]=${slug}&populate=*`)
      return response.data
    } catch (error) {
      console.error(`❌ API: Ошибка загрузки категории ${slug}:`, error)
      throw error
    }
  },

  async getCategoryById(id: string | number) {
    try {
      console.log(`📡 API: Запрос категории по ID: ${id}`)
      const response = await api.get(`/categories/${id}?populate=*`)
      return response.data
    } catch (error) {
      console.error(`❌ API: Ошибка загрузки категории ${id}:`, error)
      throw error
    }
  }
}

// Обработчик ошибок API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🚨 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message
    })
    return Promise.reject(error)
  }
)

export default api