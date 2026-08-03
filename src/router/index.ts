import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";
import { getAccessToken } from "@/app/localStorage";
import i18n from "@/plugins/i18n";
import { useAuthStore } from "@/store/authStore";

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

  const isAuthRequired = to.matched.some((record) => !!record.meta.authRequired || !!record.meta.requiresAuth);
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

  const authStore = useAuthStore();

  // Depois de confirmar que há sessão, verifica as permissões declaradas
  // no meta de cada rota combinada. Se falhar, envia para /403.
  const hasUnauthorizedRoute = to.matched.some((record) => {
    const { permission, permissions, anyPermissions, allPermissions } = record.meta;

    if (permission && !authStore.hasPermission(permission)) return true;

    const permissionsToCheck = permissions || allPermissions;
    if (permissionsToCheck) {
      const required = Array.isArray(permissionsToCheck) ? permissionsToCheck : [permissionsToCheck];
      if (!required.every((item) => authStore.hasPermission(item))) return true;
    }

    if (anyPermissions) {
      const required = Array.isArray(anyPermissions) ? anyPermissions : [anyPermissions];
      if (!required.some((item) => authStore.hasPermission(item))) return true;
    }

    return false;
  });

  if (hasUnauthorizedRoute && to.matched.some((record) => !!record.meta.dashboardFallback)) {
    return next({
      path: "/inicio",
      query: { redirect: to.fullPath },
    });
  }

  if (hasUnauthorizedRoute && to.path !== "/403") {
    return next({
      path: "/403",
      query: { redirect: to.fullPath },
    });
  }

  next();
});

export default router;
