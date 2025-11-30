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
        const user = ctx.state.user;
        const { id } = ctx.params;

        // Для авторов проверяем, что статья принадлежит им
        if (user && user.role.name === "Author") {
          const article = (await strapi.entityService.findOne(
            "api::article.article",
            id,
            {
              populate: ["author"] as any,
            },
          )) as any;

          if (!article || !article.author || article.author.id !== user.id) {
            return ctx.forbidden("You can only access your own articles");
          }
        }

        const response = await super.findOne(ctx);
        return response;
      } catch (error) {
        strapi.log.error("Error fetching article:", error);
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
  }),
);
