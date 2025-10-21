import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes";
import appConfigs from "@/app/appConfigurations";
import { authService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router";
//import { useAuthStore } from "@/store/authStore"; 

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//const authStore = useAuthStore(); 

const title = "Sistema Integrado de Gestão de Recursos Humanos";

router.beforeEach(async (to, from, next)  => {
  const auth = appConfigs.auth;
  const router = useRouter();

  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find((r) => r.meta && r.meta.title);

  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title + " | " + title || title;
  }

  const isAuthRequired = to.meta.authRequired;

  if (!isAuthRequired) {
    //console.log('netx0------------')
    return next();
  }

  try {
    const user = await authService.getUserProfile();
    console.log("user", user);

    const isUserLoggedIn = Object.keys(user).length > 0;
    console.log("isUserLoggedIn", isUserLoggedIn);

    if (isUserLoggedIn) {
      next();
    } else {
      next("/signin");
    }
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    next("/signin");
  }
  
  
});

export default router;
