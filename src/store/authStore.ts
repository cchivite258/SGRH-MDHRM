import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getAccessToken, setAccessToken, clearTokens } from "@/app/localStorage";

export const useAuthStore = defineStore("auth", () => {
    let storedUser = localStorage.getItem("user");
    let parsedUser = null;

    try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        //console.error("❌ Erro ao parsear o usuário do localStorage:", error);
        localStorage.removeItem("user"); // Remover dados corrompidos
    }

    const user = ref(parsedUser);
    const token = ref(getAccessToken());

    const isAuthenticated = computed(() => !!token.value);

    function setUser(userData: any) {
        if (!userData || typeof userData !== "object") {
            console.error("❌ Dados inválidos ao definir usuário:", userData);
            return;
        }

        user.value = userData;
        localStorage.setItem("user", JSON.stringify(userData));
        //console.log("✅ Usuário salvo:", userData);
    }

    function setToken(accessToken: string) {
        if (!accessToken) {
            console.error("❌ Token inválido:", accessToken);
            return;
        }
        token.value = accessToken;
        setAccessToken(accessToken);
    }

    function clearUserData() {
        user.value = null;
        token.value = null;
        clearTokens();
        localStorage.removeItem("user");
    }

    return { user, token, isAuthenticated, setUser, setToken, clearUserData };
});
