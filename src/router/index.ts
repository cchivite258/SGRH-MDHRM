import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";
import { getAccessToken } from "@/app/localStorage";
import i18n from "@/plugins/i18n";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const title = "Sistema Integrado de Gestao de Recursos Humanos";

router.beforeEach((to, from, next) => {
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  if (nearestWithTitle) {
    const rawTitle = String(nearestWithTitle.meta.title || "");
    const translatedTitle = (i18n as any).global.t(rawTitle) as string;
    document.title = `${translatedTitle || rawTitle} | ${title}`;
  }

  const isAuthRequired = !!to.meta.authRequired;
  if (!isAuthRequired) {
    return next();
  }

  const hasToken = !!getAccessToken();
  if (!hasToken) {
    // Guarda a rota protegida pedida para voltar após login.
    return next({
      path: "/signin",
      query: { redirect: to.fullPath },
    });
  }

  next();
});

export default router;
