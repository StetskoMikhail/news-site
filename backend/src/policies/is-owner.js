"use strict";

module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  // Editor и Administrator могут всё
  if (user.role.name === "Editor" || user.role.name === "Administrator") {
    return true;
  }

  // Author может создавать статьи (POST)
  if (policyContext.request.method === "POST") {
    return true;
  }

  // Author может читать статьи (GET)
  if (policyContext.request.method === "GET") {
    return true;
  }

  // Для UPDATE и DELETE - ЗАПРЕЩАЕМ на уровне политики
  // Детальная проверка будет в контроллере
  if (
    policyContext.request.method === "PUT" ||
    policyContext.request.method === "DELETE"
  ) {
    return false; // Запрещаем Author обновлять и удалять через политику
  }

  return false;
};
