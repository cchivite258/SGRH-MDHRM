import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import appConfigs from "@/app/appConfigurations";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/app/localStorage";
import router from "@/router";
import { useAuthStore } from "@/store/authStore";

// Instância usada por todos os serviços da aplicação.
// Uma chamada como axiosInstance.get("/users") será enviada para:
// `${appConfigs.baseUrl}/users`.
const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfigs.baseUrl,
});

// Campo interno que marca uma request que já foi repetida depois de renovar o
// token. Sem esta marca, uma resposta 401/403 poderia criar um ciclo infinito.
type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Guarda a renovação que estiver em curso. Se várias requests receberem 401/403
// ao mesmo tempo, todas aguardam esta mesma Promise em vez de enviarem vários
// refresh tokens para a API.
let refreshPromise: Promise<string | null> | null = null;

// Logger auxiliar do fluxo de autenticação. Está desativado neste momento.
// Para diagnosticar o fluxo, basta voltar a ativar os console.log abaixo.
const logAuthFlow = (step: string, payload?: unknown) => {
  // const timestamp = new Date().toISOString();
  // if (payload !== undefined) {
  //   console.log(`[AUTH_FLOW][${timestamp}] ${step}`, payload);
  //   return;
  // }
  // console.log(`[AUTH_FLOW][${timestamp}] ${step}`);
  return;
};

logAuthFlow("axios.ts loaded (interceptors active)");

// Oculta a maior parte do token antes de o escrever nos logs. Um token completo
// nunca deve ser exposto na consola.
const maskToken = (token: string | null | undefined) => {
  if (!token) {
    return null;
  }
  if (token.length <= 10) {
    return "***";
  }
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
};

// Identifica endpoints de autenticação. Erros nestas rotas não devem tentar
// renovar o token, porque o próprio refresh poderia voltar a chamar-se em ciclo.
const isAuthRequest = (url?: string) => {
  const normalizedUrl = url || "";
  return normalizedUrl.includes("/auth/login") || normalizedUrl.includes("/auth/refresh-token");
};

// Obtém a página para onde o utilizador deve regressar depois de iniciar sessão.
const getCurrentRedirectPath = () => {
  const fullPath = router.currentRoute.value.fullPath || "/";

  // Se ja estiver numa pagina de login, o retorno seguro e a home.
  if (fullPath.startsWith("/signin") || fullPath.startsWith("/auth/signin")) {
    return "/";
  }

  return fullPath;
};

// Termina a sessão local e envia o utilizador para o login, conservando a rota
// atual no parâmetro `redirect`.
const redirectToSignIn = async () => {
  const authStore = useAuthStore();
  // Limpa sessao local antes de redirecionar para forcar novo login.
  authStore.clearUserData();

  const redirect = getCurrentRedirectPath();
  if (router.currentRoute.value.path !== "/signin") {
    // Mantem a rota atual para o utilizador voltar apos autenticar.
    logAuthFlow("Redirecting to /signin", { redirect });
    await router.push({ path: "/signin", query: { redirect } });
  }
};

// Só considera o refresh definitivamente inválido quando a API responde 401 ou
// 403. Erros de rede ou falhas 5xx não apagam imediatamente a sessão local.
const isRefreshAuthError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const refreshStatus = error.response?.status;
  return refreshStatus === 401 || refreshStatus === 403;
};

// Troca o refresh token guardado por um novo par de access/refresh tokens.
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  logAuthFlow("Refresh token check", {
    hasRefreshToken: !!refreshToken,
    refreshToken: maskToken(refreshToken),
  });

  if (!refreshToken) {
    logAuthFlow("Refresh skipped: no refresh token available");
    return null;
  }

  logAuthFlow("Calling /auth/refresh-token");

  // Usa o axios base, sem os interceptors desta instância. Assim, esta chamada
  // não recebe o access token expirado e não entra no interceptor de resposta.
  // O Axios combina o baseURL e a rota garantindo a barra entre `v1` e `auth`.
  const { data } = await axios.post(
    "/auth/refresh-token",
    { refreshToken },
    { baseURL: appConfigs.baseUrl }
  );
  const newAccessToken = data?.data?.token as string | undefined;
  const newRefreshToken = data?.data?.refreshToken as string | undefined;

  // A renovação só é válida quando a API devolve os dois tokens esperados.
  if (!newAccessToken || !newRefreshToken) {
    throw new Error("Resposta invalida do refresh token");
  }

  setAccessToken(newAccessToken);
  setRefreshToken(newRefreshToken);

  // Mantém o Pinia sincronizado com o valor persistido no localStorage.
  useAuthStore().setToken(newAccessToken);

  logAuthFlow("Refresh success", {
    accessToken: maskToken(newAccessToken),
    refreshToken: maskToken(newRefreshToken),
  });

  return newAccessToken;
};

// INTERCEPTOR DE REQUEST
// Executa antes de cada chamada feita através de axiosInstance.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    logAuthFlow("Request interceptor", {
      method: config.method,
      url: config.url,
      hasAccessToken: !!token,
      accessToken: maskToken(token),
    });

    if (token) {
      // Envia o access token no formato esperado pela API.
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPONSE
// Respostas com sucesso passam diretamente. Nos erros, verifica se é possível
// renovar o token e repetir automaticamente a request original.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url || "unknown-url";

    logAuthFlow("Response error intercepted", { status, requestUrl });

    // Não tenta refresh em endpoints de autenticação para evitar ciclos.
    if (!originalRequest || isAuthRequest(originalRequest.url)) {
      logAuthFlow("Skipping refresh for auth endpoint or missing request config", {
        requestUrl,
        hasOriginalRequest: !!originalRequest,
      });
      return Promise.reject(error);
    }

    // A API usa 401/403 para indicar que o access token já não autoriza a
    // operação. `_retry` garante apenas uma tentativa por request.
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      logAuthFlow("Starting refresh flow for unauthorized response", { status, requestUrl });

      try {
        if (!refreshPromise) {
          // A primeira request inicia a renovação.
          logAuthFlow("Creating refreshPromise");
          refreshPromise = refreshAccessToken().finally(() => {
            // Liberta a referência para permitir uma renovação futura.
            refreshPromise = null;
            logAuthFlow("refreshPromise cleared");
          });
        } else {
          // As restantes requests aguardam a renovação que já está em curso.
          logAuthFlow("Reusing existing refreshPromise");
        }

        const newAccessToken = await refreshPromise;

        if (!newAccessToken) {
          // Não existe refresh token local: a aplicação exige novo login.
          logAuthFlow("Refresh returned null token -> redirect to login");
          await redirectToSignIn();
          return Promise.reject(error);
        }

        // Substitui o token expirado e reenvia exatamente a request que falhou.
        logAuthFlow("Retrying original request with refreshed token", { requestUrl });
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("[AUTH_FLOW] Error while refreshing token:", refreshError);

        // Redireciona para login apenas se o refresh token foi rejeitado. Uma
        // falha temporária da rede/servidor é devolvida à chamada original.
        if (isRefreshAuthError(refreshError)) {
          logAuthFlow("Refresh rejected with 401/403 -> redirect to login");
          await redirectToSignIn();
        } else {
          logAuthFlow("Refresh failed but NOT auth-expired. Staying on current session state.");
        }

        return Promise.reject(refreshError);
      }
    }

    // Qualquer erro que não seja tratado acima continua para o serviço/componente
    // que fez a chamada, onde poderá ser apresentado ao utilizador.
    return Promise.reject(error);
  }
);

export default axiosInstance;
