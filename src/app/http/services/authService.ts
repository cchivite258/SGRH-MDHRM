import axiosInstance from "@/app/http/axios";
import { useAuthStore } from "@/store/authStore";
import { getAccessToken, setAccessToken, clearTokens, setRefreshToken } from "@/app/localStorage";
import { email } from "@vuelidate/validators";

class AuthService {

    async login(email: string, password: string) {
        try {
        
          console.log("----------------------------------------antes------------------------------------------------------------------------");

          const response = await axiosInstance.post("/auth/login", { email, password });
    
          console.log("🔍 Resposta do login:", response);
    
          // ✅ Garante que a resposta e os dados existem antes de acessá-los
          if (!response || !response.data.data ) {
            
            throw new Error("Resposta inválida da API: Dados ausentes");
          }
    
          const accessToken = response.data.data.token;
          const refreshToken = response.data.data.refreshToken;
    
          if (!accessToken) {
            throw new Error("Resposta inválida da API: Access token ausente");
          }
    
          setAccessToken(accessToken);
          setRefreshToken(refreshToken)
    
          //console.log("🔑 Token salvo:");
    
          const authStore = useAuthStore(); 
          authStore.setToken(accessToken);
          
    
          //console.log("✅ Token salvo no Pinia");
    
          // ✅ Buscar perfil do usuário após login
          const userProfile = await this.getUserProfile();
          authStore.setUser(userProfile);
    
          //console.log("👤 Perfil do usuário salvo:", userProfile);
    
          return response.data;
    
        } catch (error: any) {
            console.error("❌ Erro no login:", error || error.message || error);
            throw error;
          }
          
      }

    async getUserProfile() {
        try {
            const response = await axiosInstance.get("/administration/users/own-profile");
            console.log("👤 Perfil do usuário:", response.data);

            return response.data.data;

        } catch (error) {
            
            console.error("❌ Erro ao buscar perfil do usuário:", error);
            throw error;
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const response = await axiosInstance.post("/auth/refresh-token", { refreshToken });
            const authStore = useAuthStore();

            authStore.setToken(response.data.accessToken);
            setAccessToken(response.data.accessToken);

            return response.data;
            
        } catch (error) {
            console.error("Erro ao renovar token:", error);
            throw error;
        }
    }

    async logout() {
        try {
            await axiosInstance.delete("/auth/logout");
            //console.log('fiz logout')
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            const authStore = useAuthStore();
            authStore.clearUserData();
            clearTokens();
        }
    }

    async forgotPassword(email: string) {
        try {
            const response = await axiosInstance.post("/auth/forget-password", { email });
            return response.data;
        } catch (error) {
            console.error("Erro ao enviar email de recuperação:", error);
            throw error;
        }
    }

    async verifyEmail(email: string, code: string) {
        try {
            const response = await axiosInstance.post("/auth/verify-forget-password", { email, code });
            return response.data;
        } catch (error) {
            console.error("Erro ao verificar email:", error);
            throw error;
        }
    }

    async resetPassword( password: string, confirmPassword: string) {
        try {
            const response = await axiosInstance.post("/auth/reset-password", {  password, confirmPassword });
            return response.data;
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            throw error;
        }
    }


}

export default AuthService;
