'use strict';

module.exports = {
  routes: [
    // 🔥 КАСТОМНЫЕ ENDPOINTS - ДОЛЖНЫ БЫТЬ ПЕРВЫМИ!
    {
      method: 'GET',
      path: '/articles/featured',
      handler: 'article.featured',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/articles/:id/publish',
      handler: 'article.publish'
    },
    {
      method: 'POST',
      path: '/articles/:id/increment-views',
      handler: 'article.incrementViews',
      config: {
        auth: false
      }
    },
    
    // Базовые CRUD endpoints - ПОСЛЕ кастомных!
    {
      method: 'POST',
      path: '/articles',
      handler: 'article.create'
    },
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/articles/:id',
      handler: 'article.findOne',
      config: {
        auth: false
      }
    },
    {
      method: 'PUT',
      path: '/articles/:id',
      handler: 'article.update'
    },
    {
      method: 'DELETE',
      path: '/articles/:id',
      handler: 'article.delete'
    }
  ]
};