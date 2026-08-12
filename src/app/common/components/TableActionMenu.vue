<script lang="ts" setup>
import ListMenuWithIcon from "@/app/common/components/ListMenuWithIcon.vue";
import type { OptionType } from "@/app/common/types/option.type";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePermissions } from "@/composables/usePermissions";
import type { PermissionRequirement } from "@/app/permissions/constants";

const emit = defineEmits(["onView", "onEdit", "onDelete", "onSelect"]);

const defaultOptions: OptionType[] = [
  { title: "Consultar", value: "view", icon: "ph-eye" },
  { title: "Editar", value: "edit", icon: "ph-pencil-simple" },
  { title: "Eliminar", value: "delete", icon: "ph-trash" }
];

const props = withDefaults(
  defineProps<{
    menuItems?: OptionType[];
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    viewPermission?: PermissionRequirement;
    editPermission?: PermissionRequirement;
    deletePermission?: PermissionRequirement;
    permissionByValue?: Record<string, PermissionRequirement>;
  }>(),
  {
    menuItems: undefined,
    canView: true,
    canEdit: true,
    canDelete: true,
    viewPermission: undefined,
    editPermission: undefined,
    deletePermission: undefined,
    permissionByValue: undefined,
  }
);

const { canAny } = usePermissions();
const route = useRoute();

const normalizeRequirement = (requirement?: unknown): string[] => {
  if (!requirement) return [];
  if (typeof requirement === "string") return [requirement];
  if (Array.isArray(requirement)) return requirement.flatMap(item => normalizeRequirement(item));
  return [];
};

const routePermissionRequirements = computed(() =>
  route.matched.flatMap(record =>
    normalizeRequirement(record.meta.anyPermissions ?? record.meta.permissions ?? record.meta.allPermissions ?? record.meta.permission)
  )
);

const inferredReadPermission = computed(() =>
  routePermissionRequirements.value.find(permission => permission.startsWith("read."))
);

const inferredActionPermission = (action: "read" | "update" | "delete") => {
  const readPermission = inferredReadPermission.value;
  if (!readPermission) return undefined;
  return readPermission.replace(/^read\./, `${action}.`);
};

const isAllowed = (option: OptionType) => {
  const explicitPermission = props.permissionByValue?.[option.value];
  if (explicitPermission) return canAny(explicitPermission);

  if (option.value === "view") {
    return props.canView && canAny(props.viewPermission ?? inferredActionPermission("read"));
  }

  if (option.value === "edit") {
    return props.canEdit && canAny(props.editPermission ?? inferredActionPermission("update"));
  }

  if (option.value === "delete") {
    return props.canDelete && canAny(props.deletePermission ?? inferredActionPermission("delete"));
  }

  return true;
};

const options = computed(() => (props.menuItems ?? defaultOptions).filter(isAllowed));

const onSelect = (option: string) => {
  emit("onSelect", option);

  switch (option) {
    case "view":
      emit("onView");
      break;
    case "edit":
      emit("onEdit");
      break;
    case "delete":
      emit("onDelete");
      break;
  }
};
</script>

<template>
  <ListMenuWithIcon v-if="options.length" align="center" :menuItems="options" @onSelect="onSelect" />
</template>
