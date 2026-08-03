import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getAccessToken, setAccessToken, clearTokens } from "@/app/localStorage";
import { decodeJwtPayload, extractPermissionsFromJwtPayload, type JwtPayload } from "@/app/permissions/jwt";
import { ALL_CLAIMS, READ_IMPLYING_ACTIONS, type Permission } from "@/app/permissions/constants";

const knownClaimSet = new Set<string>(ALL_CLAIMS);

function getImpliedReadPermission(permission: Permission) {
  const [action, ...resourceParts] = permission.split(".");
  const isReadImplyingAction = READ_IMPLYING_ACTIONS.includes(
    action as (typeof READ_IMPLYING_ACTIONS)[number]
  );

  if (!isReadImplyingAction || resourceParts.length === 0) return null;

  const impliedReadPermission = `read.${resourceParts.join(".")}`;
  return knownClaimSet.has(impliedReadPermission) ? impliedReadPermission : null;
}

function expandPermissionsWithImpliedReads(rawPermissions: Permission[]) {
  const expandedPermissions = new Set<Permission>(rawPermissions);

  rawPermissions.forEach((permission) => {
    const impliedReadPermission = getImpliedReadPermission(permission);
    if (impliedReadPermission) {
      expandedPermissions.add(impliedReadPermission);
    }
  });

  return Array.from(expandedPermissions);
}

export const useAuthStore = defineStore("auth", () => {
  const storedUser = localStorage.getItem("user");
  let parsedUser = null;

  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("user");
  }

  const user = ref(parsedUser);
  const token = ref(getAccessToken());
  const tokenPayload = ref<JwtPayload | null>(null);
  const permissions = ref<Permission[]>([]);
  const isAccessLoaded = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const permissionSet = computed(() => new Set(permissions.value));

  // Sempre que o token entra ou é renovado, o payload é relido
  // e a lista reactiva de permissões é actualizada.
  function syncAccessFromToken(accessToken: string | null) {
    tokenPayload.value = decodeJwtPayload(accessToken);
    // Guarda tambem as leituras implicitas para a UI inteira usar a mesma lista reactiva.
    permissions.value = expandPermissionsWithImpliedReads(
      extractPermissionsFromJwtPayload(tokenPayload.value)
    );
    isAccessLoaded.value = true;
  }

  syncAccessFromToken(token.value);

  function setUser(userData: any) {
    if (!userData || typeof userData !== "object") {
      console.error("Dados invalidos ao definir usuario:", userData);
      return;
    }

    user.value = userData;
    localStorage.setItem("user", JSON.stringify(userData));
  }

  function setToken(accessToken: string) {
    if (!accessToken) {
      console.error("Token invalido:", accessToken);
      return;
    }

    token.value = accessToken;
    setAccessToken(accessToken);
    syncAccessFromToken(accessToken);
  }

  function clearUserData() {
    user.value = null;
    token.value = null;
    tokenPayload.value = null;
    permissions.value = [];
    isAccessLoaded.value = true;
    clearTokens();
    localStorage.removeItem("user");
  }

  // Verifica permissão exacta, permissões globais "*" e permissões por módulo,
  // por exemplo "employee.*" autoriza "employee.create".
  function hasPermission(permission: Permission) {
    if (!permission) return true;
    if (permissionSet.value.has("*") || permissionSet.value.has(permission)) return true;

    // Leitura implicita: quem tem uma accao de escrita no mesmo recurso
    // tambem pode consultar esse recurso na UI.
    if (permission.startsWith("read.")) {
      const resource = permission.replace(/^read\./, "");
      if (READ_IMPLYING_ACTIONS.some((action) => permissionSet.value.has(`${action}.${resource}`))) {
        return true;
      }
    }

    const [action, ...resourceParts] = permission.split(".");
    const resource = resourceParts.join(".");

    return (
      (!!action && permissionSet.value.has(`${action}.*`)) ||
      (!!resource && permissionSet.value.has(`*.${resource}`))
    );
  }

  return {
    user,
    token,
    tokenPayload,
    permissions,
    isAuthenticated,
    isAccessLoaded,
    hasPermission,
    setUser,
    setToken,
    clearUserData,
  };
});
