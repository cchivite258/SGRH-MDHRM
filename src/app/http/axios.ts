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

const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfigs.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Evita multiplos refresh em paralelo quando varias requests falham ao mesmo tempo.
let refreshPromise: Promise<string | null> | null = null;

const logAuthFlow = (step: string, payload?: unknown) => {
  const timestamp = new Date().toISOString();
  if (payload !== undefined) {
    console.log(`[AUTH_FLOW][${timestamp}] ${step}`, payload);
    return;
  }
  console.log(`[AUTH_FLOW][${timestamp}] ${step}`);
};

logAuthFlow("axios.ts loaded (interceptors active)");

const maskToken = (token: string | null | undefined) => {
  if (!token) {
    return null;
  }
  if (token.length <= 10) {
    return "***";
  }
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
};

const isAuthRequest = (url?: string) => {
  const normalizedUrl = url || "";
  return normalizedUrl.includes("/auth/login") || normalizedUrl.includes("/auth/refresh-token");
};

const getCurrentRedirectPath = () => {
  const fullPath = router.currentRoute.value.fullPath || "/";

  // Se ja estiver numa pagina de login, o retorno seguro e a home.
  if (fullPath.startsWith("/signin") || fullPath.startsWith("/auth/signin")) {
    return "/";
  }

  return fullPath;
};

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

const isRefreshAuthError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const refreshStatus = error.response?.status;
  return refreshStatus === 401 || refreshStatus === 403;
};

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
  const { data } = await axios.post(`${appConfigs.baseUrl}auth/refresh-token`, { refreshToken });
  const newAccessToken = data?.data?.token as string | undefined;
  const newRefreshToken = data?.data?.refreshToken as string | undefined;

  if (!newAccessToken || !newRefreshToken) {
    throw new Error("Resposta invalida do refresh token");
  }

  setAccessToken(newAccessToken);
  setRefreshToken(newRefreshToken);
  useAuthStore().setToken(newAccessToken);

  logAuthFlow("Refresh success", {
    accessToken: maskToken(newAccessToken),
    refreshToken: maskToken(newRefreshToken),
  });

  return newAccessToken;
};

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
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url || "unknown-url";

    logAuthFlow("Response error intercepted", { status, requestUrl });

    // Nao tenta refresh em endpoints de auth para evitar loops.
    if (!originalRequest || isAuthRequest(originalRequest.url)) {
      logAuthFlow("Skipping refresh for auth endpoint or missing request config", {
        requestUrl,
        hasOriginalRequest: !!originalRequest,
      });
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      // Garante uma unica tentativa de replay por request.
      originalRequest._retry = true;
      logAuthFlow("Starting refresh flow for unauthorized response", { status, requestUrl });

      try {
        if (!refreshPromise) {
          logAuthFlow("Creating refreshPromise");
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
            logAuthFlow("refreshPromise cleared");
          });
        } else {
          logAuthFlow("Reusing existing refreshPromise");
        }

        const newAccessToken = await refreshPromise;

        if (!newAccessToken) {
          // Sem refresh valido, forca login.
          logAuthFlow("Refresh returned null token -> redirect to login");
          await redirectToSignIn();
          return Promise.reject(error);
        }

        // Reenvia a request original com o novo access token.
        logAuthFlow("Retrying original request with refreshed token", { requestUrl });
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("[AUTH_FLOW] Error while refreshing token:", refreshError);

        // So manda para login se o refresh token for rejeitado (expirado/invalido).
        if (isRefreshAuthError(refreshError)) {
          logAuthFlow("Refresh rejected with 401/403 -> redirect to login");
          await redirectToSignIn();
        } else {
          logAuthFlow("Refresh failed but NOT auth-expired. Staying on current session state.");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
