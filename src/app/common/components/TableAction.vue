<script lang="ts" setup>
import type { PermissionRequirement } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

const emit = defineEmits(["onView", "onEdit", "onDelete"]);

const props = withDefaults(
  defineProps<{
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    viewPermission?: PermissionRequirement;
    editPermission?: PermissionRequirement;
    deletePermission?: PermissionRequirement;
  }>(),
  {
    canView: true,
    canEdit: true,
    canDelete: true,
    viewPermission: undefined,
    editPermission: undefined,
    deletePermission: undefined,
  }
);

const { canAny } = usePermissions();

// Estes botões continuam genéricos, mas agora só aparecem quando a permissão existe.
const showView = () => props.canView && canAny(props.viewPermission);
const showEdit = () => props.canEdit && canAny(props.editPermission);
const showDelete = () => props.canDelete && canAny(props.deletePermission);
</script>
<template>
  <div class="d-flex" style="justify-content: inherit">
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
    <v-hover v-if="showEdit()">
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-pencil ph-sm"
          color="secondary"
          density="compact"
          :variant="!isHovering ? 'tonal' : 'elevated'"
          rounded
          class="mx-1"
          @click="emit('onEdit')"
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
