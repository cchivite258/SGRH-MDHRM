<script lang="ts" setup>
import type { PermissionRequirement } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

const emit = defineEmits(["onView", "onDelete"]);

const props = withDefaults(
  defineProps<{
    canView?: boolean;
    canDelete?: boolean;
    viewPermission?: PermissionRequirement;
    deletePermission?: PermissionRequirement;
  }>(),
  {
    canView: true,
    canDelete: true,
    viewPermission: undefined,
    deletePermission: undefined,
  }
);

const { canAny } = usePermissions();

// Mantem o componente reutilizavel e evita mostrar accoes sem permissao.
const showView = () => props.canView && canAny(props.viewPermission);
const showDelete = () => props.canDelete && canAny(props.deletePermission);
</script>
<template>
  <div class="d-flex" style="gap: 8px; justify-content: inherit">
    <v-hover v-if="showView()">
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-eye ph-sm"
          color="primary"
          density="compact"
          :variant="!isHovering ? 'tonal' : 'elevated'"
          rounded
          @click="emit('onView')"
        />
      </template>
    </v-hover>
    <v-hover v-if="showDelete()">
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-trash ph-sm"
          color="danger"
          density="compact"
          rounded
          :variant="!isHovering ? 'tonal' : 'elevated'"
          @click="emit('onDelete')"
        />
      </template>
    </v-hover>
  </div>
</template>
