import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/authStore";
import type { Permission, PermissionRequirement } from "@/app/permissions/constants";

const normalizeRequirement = (requirement?: PermissionRequirement): Permission[] => {
  if (!requirement) return [];
  if (typeof requirement === "string") return [requirement];
  return requirement.flatMap((item) => normalizeRequirement(item as PermissionRequirement));
};

// Composable global para qualquer componente perguntar:
// "este utilizador pode fazer isto?"
export const usePermissions = () => {
  const authStore = useAuthStore();
  const { permissions, isAccessLoaded } = storeToRefs(authStore);

  const can = (permission?: Permission) => {
    if (!permission) return true;
    return authStore.hasPermission(permission);
  };

  // Verdadeiro se o utilizador tiver pelo menos uma das permissões.
  const canAny = (required?: PermissionRequirement) => {
    const requirements = normalizeRequirement(required);
    if (!requirements.length) return true;
    return requirements.some((permission) => can(permission));
  };

  // Verdadeiro apenas se o utilizador tiver todas as permissões.
  const canAll = (required?: PermissionRequirement) => {
    const requirements = normalizeRequirement(required);
    if (!requirements.length) return true;
    return requirements.every((permission) => can(permission));
  };

  // Ajuda para formulários: um campo pode ficar oculto, só leitura ou editável.
  const useFieldAccess = (viewPermission: PermissionRequirement, editPermission: PermissionRequirement) => {
    const canView = computed(() => canAny([...normalizeRequirement(viewPermission), ...normalizeRequirement(editPermission)]));
    const canEdit = computed(() => canAny(editPermission));
    const hidden = computed(() => !canView.value);
    const readonly = computed(() => canView.value && !canEdit.value);
    const disabled = computed(() => readonly.value);
    const mode = computed<"hidden" | "readonly" | "edit">(() => {
      if (hidden.value) return "hidden";
      return readonly.value ? "readonly" : "edit";
    });

    return {
      canView,
      canEdit,
      hidden,
      readonly,
      disabled,
      mode,
    };
  };

  return {
    permissions,
    isAccessLoaded,
    can,
    canAny,
    canAll,
    useFieldAccess,
  };
};
