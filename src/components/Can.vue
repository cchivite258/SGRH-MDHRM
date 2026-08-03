<script lang="ts" setup>
import { computed } from "vue";
import { usePermissions } from "@/composables/usePermissions";
import type { Permission, PermissionRequirement } from "@/app/permissions/constants";

const props = defineProps<{
  permission?: Permission;
  any?: PermissionRequirement;
  all?: PermissionRequirement;
}>();

const { can, canAny, canAll } = usePermissions();

// O componente só mostra o conteúdo do slot quando a permissão passa.
// Também aceita slot "fallback" para mostrar algo alternativo.
const allowed = computed(() => {
  if (props.permission && !can(props.permission)) return false;
  if (props.any && !canAny(props.any)) return false;
  if (props.all && !canAll(props.all)) return false;
  return true;
});
</script>

<template>
  <slot v-if="allowed" :allowed="allowed" />
  <slot v-else name="fallback" :allowed="allowed" />
</template>
