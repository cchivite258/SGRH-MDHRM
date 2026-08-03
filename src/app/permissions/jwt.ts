import type { Permission } from "@/app/permissions/constants";

export type JwtPayload = Record<string, unknown>;

// O JWT usa base64url, que troca alguns caracteres do base64 normal.
// Esta função desfaz essa troca para conseguirmos ler o payload no browser.
const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);

  try {
    return decodeURIComponent(
      decoded
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return decoded;
  }
};

export const decodeJwtPayload = (token: string | null): JwtPayload | null => {
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
};

// Aceita vários formatos comuns de permissões no token:
// strings, arrays de strings ou objectos com slug/name/authority.
const normalizePermissionValue = (value: unknown): Permission[] => {
  if (!value) return [];

  if (typeof value === "string") {
    return value
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizePermissionValue(item));
  }

  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return normalizePermissionValue(
      item.slug || item.permission || item.authority || item.name || item.code || item.value
    );
  }

  return [];
};

// Procura as permissões em claims comuns do JWT e remove duplicados.
export const extractPermissionsFromJwtPayload = (payload: JwtPayload | null): Permission[] => {
  if (!payload) return [];

  const claimValues = [
    payload.claims,
    payload.permissions,
    payload.permission,
    payload.perms,
    payload.authorities,
    payload.authority,
    payload.scope,
    payload.scp,
    payload.roles,
    payload.role,
    payload.rolePermissions,
  ];

  return Array.from(new Set(claimValues.flatMap((value) => normalizePermissionValue(value))));
};
