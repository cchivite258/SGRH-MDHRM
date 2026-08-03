import "vue-router";
import type { Permission, PermissionRequirement } from "@/app/permissions/constants";

declare module "vue-router" {
  interface RouteMeta {
    authRequired?: boolean;
    requiresAuth?: boolean;
    title?: string;
    layout?: unknown;
    permission?: Permission;
    permissions?: PermissionRequirement;
    anyPermissions?: PermissionRequirement;
    allPermissions?: PermissionRequirement;
    dashboardFallback?: boolean;
  }
}
