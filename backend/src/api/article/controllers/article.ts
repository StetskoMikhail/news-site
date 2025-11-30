/**
 * article controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::article.article",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const user = ctx.state.user;

        if (!user) {
          return ctx.unauthorized("You must be logged in to create an article");
        }
        // АВТОГЕНЕРАЦИЯ SLUG В КОНТРОЛЛЕРЕ
        if (ctx.request.body.data.title && !ctx.request.body.data.slug) {
          // Динамический импорт slugify
          const slugifyModule = await import("slugify");
          const slugify = slugifyModule.default;

          ctx.request.body.data.slug =
            slugify(ctx.request.body.data.title, {
              lower: true,
              strict: true,
            }) +
            "-" +
            Date.now();
        }
        // УБИРАЕМ авто-привязку - пусть Strapi сам разбирается
        const response = await super.create(ctx);
        return response;
      } catch (error) {
        strapi.log.error("Error creating article:", error);
        return ctx.badRequest("Failed to create article");
      }
    },

    async find(ctx) {
      try {
        const user = ctx.state.user;

        // Если пользователь author - показываем только его статьи
        if (user && user.role.name === "Author") {
          // Исправлено: безопасное создание filters
          const existingFilters =
            ctx.query.filters && typeof ctx.query.filters === "object"
              ? { ...ctx.query.filters }
              : {};

          ctx.query.filters = {
            ...existingFilters,
            author: { id: user.id },
          };
        }

        const response = await super.find(ctx);
        return response;
      } catch (error) {
        strapi.log.error("Error fetching articles:", error);
        return ctx.badRequest("Failed to fetch articles");
      }
    },

  async findOne(ctx) {
  try {
    const { id } = ctx.params;
    console.log(`🔍 FindOne request for ID: ${id}`);

    // ВАЖНО: Используем прямой запрос к базе с точным ID
    const article = await strapi.db.query('api::article.article').findOne({
      where: {
        id: Number(id)  // ТОЧНОЕ совпадение по ID
      },
      populate: ['author', 'category', 'coverImage']
    });

    console.log('🎯 SEARCH RESULT:');
    console.log(`   Requested ID: ${id}`);
    console.log(`   Found:`, article ? `ID: ${article.id}, Title: "${article.title}"` : 'NOT FOUND');

    if (!article) {
      console.log(`❌ Article with ID ${id} not found in database`);
      return ctx.notFound(`Article with ID ${id} not found`);
    }

    const sanitizedEntity = await this.sanitizeOutput(article, ctx);
    return this.transformResponse(sanitizedEntity);
    
  } catch (error) {
    console.error('💥 Error in findOne:', error);
    return ctx.badRequest("Failed to fetch article");
  }
},

    async update(ctx) {
      try {
        const user = ctx.state.user;
        const { id } = ctx.params;

        // Для авторов проверяем владение статьей
        if (user && user.role.name === "Author") {
          const article = (await strapi.entityService.findOne(
            "api::article.article",
            id,
            {
              populate: ["author"] as any,
            },
          )) as any;

          if (!article || !article.author || article.author.id !== user.id) {
            return ctx.forbidden("You can only update your own articles");
          }
        }

        const response = await super.update(ctx);
        return response;
      } catch (error) {
        strapi.log.error("Error updating article:", error);
        return ctx.badRequest("Failed to update article");
      }
    },

    async delete(ctx) {
      try {
        const user = ctx.state.user;
        const { id } = ctx.params;

        // Для авторов проверяем владение статьей
        if (user && user.role.name === "Author") {
          const article = (await strapi.entityService.findOne(
            "api::article.article",
            id,
            {
              populate: ["author"] as any,
            },
          )) as any;

          if (!article || !article.author || article.author.id !== user.id) {
            return ctx.forbidden("You can only delete your own articles");
          }
        }

        const response = await super.delete(ctx);
        return response;
      } catch (error) {
        strapi.log.error("Error deleting article:", error);
        return ctx.badRequest("Failed to delete article");
      }
    },

    // 🔥 КАСТОМНЫЕ ENDPOINTS ПО ЗАДАНИЮ:

    // 1. GET /api/articles/featured - лента "в избранном"
async featured(ctx) {
  try {
    console.log('📡 Featured articles request');
    
    // Сохраняем оригинальный query
    const originalQuery = { ...ctx.query };
    
    // Устанавливаем фильтр для избранных статей
    ctx.query = {
      ...ctx.query,
      filters: {
        isFeatured: true
      },
      sort: 'publishedAt:desc',
      populate: ['coverImage', 'category', 'author']
    };

    // Используем встроенный метод find
    const response = await super.find(ctx);
    
    // Восстанавливаем оригинальный query
    ctx.query = originalQuery;
    
    console.log(`✅ Found ${response.data.length} featured articles`);
    return response;
    
  } catch (error) {
    console.error('❌ Error in featured:', error);
    return ctx.badRequest('Error fetching featured articles: ' + error.message);
  }
},

   // 2. POST /api/articles/:id/publish - публикация черновика (только editor)
async publish(ctx) {
  const { id } = ctx.params;
  
  console.log(`📡 Publish article request: ${id}`);
  
  // Проверяем права (только editor)
  const user = ctx.state.user;
  if (!user || user.role.name !== 'editor') {
    return ctx.forbidden('Only editors can publish articles');
  }

  try {
    const entity = await strapi.entityService.findOne('api::article.article', id);
    
    if (!entity) {
      return ctx.notFound('Article not found');
    }

    // Публикуем статью
    const updatedEntity = await strapi.entityService.update('api::article.article', id, {
      data: {
        publishedAt: new Date().toISOString(),
      }
    });

    // УБРАТЬ ЭТОТ БЛОК - audit-log больше не существует
    // await strapi.entityService.create('api::audit-log.audit-log', {
    //   data: {
    //     action: 'publish',
    //     entity: 'article',
    //     entityId: id,
    //     userId: user.id,
    //     timestamp: new Date().toISOString(),
    //     details: `Article "${entity.title}" published by ${user.username}`
    //   }
    // });

    // Просто логируем в консоль
    console.log(`📝 Article "${entity.title}" published by ${user.username}`);

    const sanitizedEntity = await this.sanitizeOutput(updatedEntity, ctx);
    return this.transformResponse(sanitizedEntity);
  } catch (error) {
    console.error('Error publishing article:', error);
    return ctx.badRequest('Error publishing article');
  }
},
   // 3. Дополнительный: Увеличение просмотров
// 3. Дополнительный: Увеличение просмотров
async incrementViews(ctx) {
  const { id } = ctx.params;

  try {
    console.log(`📡 Increment views for article: ${id}`);

    // Находим статью
    const entity = await strapi.entityService.findOne('api::article.article', Number(id));
    
    if (!entity) {
      return ctx.notFound('Article not found');
    }

    // Обновляем счетчик просмотров
    const updatedEntity = await strapi.entityService.update('api::article.article', Number(id), {
      data: {
        viewCount: (entity.viewCount || 0) + 1
      }
    });

    console.log(`✅ Views incremented for article ${id}: ${entity.viewCount || 0} → ${updatedEntity.viewCount}`);

    const sanitizedEntity = await this.sanitizeOutput(updatedEntity, ctx);
    return this.transformResponse(sanitizedEntity);
  } catch (error) {
    console.error('❌ Error incrementing views:', error);
    return ctx.badRequest('Error incrementing views');
  }
}
  })
);