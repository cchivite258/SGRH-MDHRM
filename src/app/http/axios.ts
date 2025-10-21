import axios, { AxiosInstance, AxiosError } from "axios";
import appConfigs from "@/app/appConfigurations";
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken } from "@/app/localStorage";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfigs.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com erros de autenticação (401) ou 403
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 403) {
      const originalRequest = error.config;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${appConfigs.baseUrl}auth/refresh-token`, { refreshToken });
          setAccessToken(data.data.token);
          setRefreshToken(data.data.refreshToken);
          console.log('------------------------------token actualizado', data)

          // Atualizar o token e refazer a requisição original
          originalRequest!.headers["Authorization"] = `Bearer ${data.data.token}`;
          return axios(originalRequest!);
        } catch (refreshError) {
          console.error("Erro ao renovar token:", refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
