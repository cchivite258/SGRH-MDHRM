<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import FormCard from "@/app/common/components/FormCard.vue";
import FormPageHeader from "@/app/common/components/FormPageHeader.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import {
  moduleService,
  permissionService,
  rolePermissionService,
  roleService,
} from "@/app/http/httpServiceProvider";
import type { ModuleListingType } from "@/components/users/modules/types";
import type {
  PermissionListingType,
  RolePermissionListingType,
} from "@/components/users/permissions/types";
import type { RoleListingType } from "@/components/users/roles/types";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const roleId = computed(() => String(route.params.id || ""));
const role = ref<RoleListingType | null>(null);
const modules = ref<ModuleListingType[]>([]);
const selectedModuleId = ref<number | null>(null);
const permissionsByModule = ref<Record<number, PermissionListingType[]>>({});
const loadedModuleIds = ref<number[]>([]);
const rolePermissions = ref<RolePermissionListingType[]>([]);
const selectedPermissionIds = ref<number[]>([]);
const initialPermissionIds = ref<number[]>([]);
const associationIdByPermissionId = ref<Record<number, number>>({});
const moduleSearch = ref("");
const permissionSearch = ref("");
const loading = ref(false);
const loadingPermissions = ref(false);
const saving = ref(false);

const selectedPermissionIdSet = computed(() => new Set(selectedPermissionIds.value));

const filteredModules = computed(() => {
  const query = moduleSearch.value.trim().toLowerCase();
  if (!query) return modules.value;

  return modules.value.filter(module => {
    return [module.name, module.description]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query));
  });
});

const currentModule = computed(() =>
  modules.value.find(module => module.id === selectedModuleId.value) || null
);

const currentPermissions = computed(() => {
  if (!selectedModuleId.value) return [];

  const permissions = permissionsByModule.value[selectedModuleId.value] || [];
  const query = permissionSearch.value.trim().toLowerCase();
  if (!query) return permissions;

  return permissions.filter(permission => {
    return [permission.name, permission.slug, permission.description]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query));
  });
});

const currentModulePermissionIds = computed(() =>
  (permissionsByModule.value[selectedModuleId.value || -1] || []).map(permission => permission.id)
);

const isCurrentModuleAllSelected = computed(() => {
  const ids = currentModulePermissionIds.value;
  return ids.length > 0 && ids.every(id => selectedPermissionIdSet.value.has(id));
});

const isCurrentModuleIndeterminate = computed(() => {
  const ids = currentModulePermissionIds.value;
  const selectedCount = ids.filter(id => selectedPermissionIdSet.value.has(id)).length;
  return selectedCount > 0 && selectedCount < ids.length;
});

const currentModuleSelectedCount = computed(() =>
  currentModulePermissionIds.value.filter(id => selectedPermissionIdSet.value.has(id)).length
);

const hasChanges = computed(() => {
  const initial = [...initialPermissionIds.value].sort((a, b) => a - b).join(",");
  const current = [...selectedPermissionIds.value].sort((a, b) => a - b).join(",");
  return initial !== current;
});

const moduleSelectedCount = (moduleId: number) => {
  const permissions = permissionsByModule.value[moduleId];
  if (permissions) {
    return permissions.filter(permission => selectedPermissionIdSet.value.has(permission.id)).length;
  }

  return rolePermissions.value.filter(item => item.permission?.module?.id === moduleId).length;
};

const moduleTotalCount = (moduleId: number) => {
  const permissions = permissionsByModule.value[moduleId];
  return permissions ? permissions.length : null;
};

const setPermissionsByModuleResponses = (
  items: Array<{ moduleId: number; permissions: PermissionListingType[] }>,
  availableModules: ModuleListingType[] = modules.value
) => {
  const permissionsByModuleId = items.reduce<Record<number, PermissionListingType[]>>((acc, item) => {
    acc[item.moduleId] = item.permissions;
    return acc;
  }, {});

  permissionsByModule.value = availableModules.reduce<Record<number, PermissionListingType[]>>((acc, module) => {
    acc[module.id] = permissionsByModuleId[module.id] || [];
    return acc;
  }, {});
  loadedModuleIds.value = availableModules.map(module => module.id);
};

const setRolePermissions = (items: RolePermissionListingType[]) => {
  rolePermissions.value = items;
  selectedPermissionIds.value = items
    .map(item => item.permission?.id)
    .filter((id): id is number => typeof id === "number");
  initialPermissionIds.value = [...selectedPermissionIds.value];
  associationIdByPermissionId.value = items.reduce<Record<number, number>>((acc, item) => {
    if (typeof item.permission?.id === "number") {
      acc[item.permission.id] = item.id;
    }
    return acc;
  }, {});
};

const loadPermissionsForModule = async (moduleId: number) => {
  if (loadedModuleIds.value.includes(moduleId)) return;

  loadingPermissions.value = true;
  try {
    const { content } = await permissionService.getPermissionsByModule(moduleId);
    permissionsByModule.value = {
      ...permissionsByModule.value,
      [moduleId]: content,
    };
    loadedModuleIds.value = [...loadedModuleIds.value, moduleId];
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach(message => toast.error(message));
  } finally {
    loadingPermissions.value = false;
  }
};

const selectModule = async (moduleId: number) => {
  selectedModuleId.value = moduleId;
  permissionSearch.value = "";
  await loadPermissionsForModule(moduleId);
};

const togglePermission = (permissionId: number) => {
  if (selectedPermissionIdSet.value.has(permissionId)) {
    selectedPermissionIds.value = selectedPermissionIds.value.filter(id => id !== permissionId);
    return;
  }

  selectedPermissionIds.value = [...selectedPermissionIds.value, permissionId];
};

const toggleCurrentModuleSelection = () => {
  const ids = currentModulePermissionIds.value;
  if (!ids.length) return;

  if (isCurrentModuleAllSelected.value) {
    selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !ids.includes(id));
    return;
  }

  selectedPermissionIds.value = Array.from(new Set([...selectedPermissionIds.value, ...ids]));
};

const clearAllSelection = () => {
  selectedPermissionIds.value = [];
};

const reloadRolePermissions = async () => {
  const items = await rolePermissionService.getRolePermissionsByRole(roleId.value);
  setRolePermissions(items);
};

const loadData = async () => {
  loading.value = true;

  try {
    const [roleResponse, modulesResponse, rolePermissionResponse] = await Promise.all([
      roleService.findRoleById(roleId.value),
      moduleService.getModules(0, 10000000, "name", "asc"),
      rolePermissionService.getRolePermissionsByRole(roleId.value),
    ]);

    const permissionsByModuleResponse = await Promise.all(
      modulesResponse.content.map(async module => {
        const { content } = await permissionService.getPermissionsByModule(module.id);
        return {
          moduleId: module.id,
          permissions: content,
        };
      })
    );

    role.value = roleResponse;
    modules.value = modulesResponse.content;
    setPermissionsByModuleResponses(permissionsByModuleResponse, modulesResponse.content);
    setRolePermissions(rolePermissionResponse);

    const firstAssociatedModuleId = modules.value.find(module =>
      (permissionsByModule.value[module.id] || []).some(permission =>
        selectedPermissionIds.value.includes(permission.id)
      )
    )?.id;
    const firstModuleId = firstAssociatedModuleId || modules.value[0]?.id || null;
    if (firstModuleId) {
      selectedModuleId.value = firstModuleId;
      permissionSearch.value = "";
    }
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach(message => toast.error(message));
  } finally {
    loading.value = false;
  }
};

const onSave = async () => {
  if (!hasChanges.value) {
    toast.info(t("t-no-permission-changes"));
    return;
  }

  saving.value = true;

  try {
    const existingAssociationIds = Object.values(associationIdByPermissionId.value);
    if (existingAssociationIds.length) {
      await rolePermissionService.deleteManyRolePermissions(existingAssociationIds);
    }

    if (selectedPermissionIds.value.length) {
      await rolePermissionService.createManyRolePermissions(
        selectedPermissionIds.value.map(permissionId => ({
          roleId: roleId.value,
          permissionId,
        }))
      );
    }

    await reloadRolePermissions();
    toast.success(t("t-role-permissions-updated"));
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
  } finally {
    saving.value = false;
  }
};

const onBack = () => {
  router.push("/users/roles/list");
};

onMounted(loadData);
</script>

<template>
  <div class="role-permissions-page">
    <FormPageHeader
      :title="$t('t-edit-role-permissions')"
      :subtitle="role ? `${role.name} - ${$t('t-role-permissions-subtitle')}` : $t('t-role-permissions-subtitle')"
      :loading="saving"
      :save-disabled="loading || saving"
      @back="onBack"
      @save="onSave"
    />

    <FormCard>
      <div v-if="loading" class="role-permissions-page__loading">
        <v-progress-linear color="primary" indeterminate />
      </div>

      <div v-else class="role-permissions-page__layout">
        <aside class="role-permissions-page__modules">
          <div class="role-permissions-page__section-head">
            <div>
              <h2>{{ $t("t-modules") }}</h2>
              <p>{{ $t("t-permission-modules-helper") }}</p>
            </div>
          </div>

          <v-text-field
            v-model="moduleSearch"
            variant="solo"
            density="compact"
            hide-details
            prepend-inner-icon="ph-magnifying-glass"
            :placeholder="$t('t-search-for-modules')"
            class="role-permissions-page__search"
          />

          <div class="role-permissions-page__module-list">
            <button
              v-for="module in filteredModules"
              :key="module.id"
              type="button"
              class="role-permissions-page__module-button"
              :class="{ 'is-active': module.id === selectedModuleId }"
              @click="selectModule(module.id)"
            >
              <span>
                <strong>{{ module.name }}</strong>
                <small>{{ module.description || "-" }}</small>
              </span>
              <span class="role-permissions-page__module-count">
                {{ moduleSelectedCount(module.id) }}
                <template v-if="moduleTotalCount(module.id) !== null">/{{ moduleTotalCount(module.id) }}</template>
              </span>
            </button>
          </div>
        </aside>

        <section class="role-permissions-page__permissions">
          <div class="role-permissions-page__section-head role-permissions-page__permissions-head">
            <div>
              <h2>{{ currentModule?.name || $t("t-permissions") }}</h2>
              <p>{{ $t("t-role-permissions-selection-helper") }}</p>
            </div>

            <div class="role-permissions-page__summary">
              <strong>{{ selectedPermissionIds.length }}</strong>
              <span>{{ $t("t-selected-permissions") }}</span>
            </div>
          </div>

          <div class="role-permissions-page__toolbar">
            <v-text-field
              v-model="permissionSearch"
              variant="solo"
              density="compact"
              hide-details
              prepend-inner-icon="ph-magnifying-glass"
              :placeholder="$t('t-search-for-permissions')"
              class="role-permissions-page__search"
            />

            <v-btn
              color="secondary"
              variant="outlined"
              :disabled="loadingPermissions || !currentModulePermissionIds.length"
              @click="toggleCurrentModuleSelection"
            >
              <i class="ph-check-square-offset me-2" />
              {{ isCurrentModuleAllSelected ? $t("t-clear-module-selection") : $t("t-select-module-permissions") }}
            </v-btn>

            <v-btn color="danger" variant="text" :disabled="!selectedPermissionIds.length" @click="clearAllSelection">
              <i class="ph-x me-2" />
              {{ $t("t-clear-all") }}
            </v-btn>
          </div>

          <v-progress-linear v-if="loadingPermissions" color="primary" indeterminate class="mb-3" />

          <div v-if="!selectedModuleId" class="role-permissions-page__empty">
            {{ $t("t-select-module-to-view-permissions") }}
          </div>

          <div v-else-if="!currentPermissions.length && !loadingPermissions" class="role-permissions-page__empty">
            {{ $t("t-no-permissions-found") }}
          </div>

          <div v-else class="role-permissions-page__permission-list">
            <label
              v-for="permission in currentPermissions"
              :key="permission.id"
              class="role-permissions-page__permission-item"
              :class="{ 'is-selected': selectedPermissionIdSet.has(permission.id) }"
            >
              <v-checkbox
                :model-value="selectedPermissionIdSet.has(permission.id)"
                color="secondary"
                density="compact"
                hide-details
                @update:model-value="togglePermission(permission.id)"
              />
              <span>
                <strong>{{ permission.name || permission.slug }}</strong>
                <small>{{ permission.description || permission.slug || "-" }}</small>
              </span>
            </label>
          </div>

          <div
            v-if="currentModulePermissionIds.length"
            class="role-permissions-page__module-state"
            :class="{ 'is-complete': isCurrentModuleAllSelected, 'is-partial': isCurrentModuleIndeterminate }"
          >
            <i class="ph-info" />
            <span>
              {{ $t("t-current-module-selection") }}:
              {{ currentModuleSelectedCount }}/{{ currentModulePermissionIds.length }}
            </span>
          </div>
        </section>
      </div>

    </FormCard>

    <div v-if="!loading" class="role-permissions-page__footer-actions">
      <v-btn
        color="secondary"
        variant="outlined"
        :disabled="saving"
        @click="onBack"
      >
        <i class="ph-arrow-left me-2" />
        {{ $t("t-back-to-list") }}
      </v-btn>

      <v-btn
        color="secondary"
        variant="elevated"
        :loading="saving"
        :disabled="loading || saving"
        @click="onSave"
      >
        <i class="ph-floppy-disk me-2" />
        {{ $t("t-save") }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.role-permissions-page__loading {
  padding: 20px 0;
}

.role-permissions-page__layout {
  display: grid;
  gap: 22px;
  grid-template-columns: minmax(260px, 330px) minmax(0, 1fr);
}

.role-permissions-page__modules,
.role-permissions-page__permissions {
  min-width: 0;
}

.role-permissions-page__modules {
  border-right: 1px solid #e5ebf3;
  padding-right: 22px;
}

.role-permissions-page__section-head {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.role-permissions-page__section-head h2 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 0 0 4px;
}

.role-permissions-page__section-head p {
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.35;
  margin: 0;
}

.role-permissions-page__search {
  margin-bottom: 14px;
}

.role-permissions-page__module-list {
  display: grid;
  gap: 8px;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 4px;
}

.role-permissions-page__module-button {
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5ebf3;
  border-radius: 8px;
  color: #334155;
  cursor: pointer;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-height: 58px;
  padding: 10px 12px;
  text-align: left;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  width: 100%;
}

.role-permissions-page__module-button:hover,
.role-permissions-page__module-button.is-active {
  background: #f8fafc;
  border-color: #94a3b8;
}

.role-permissions-page__module-button strong,
.role-permissions-page__permission-item strong {
  color: #172033;
  display: block;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.2;
}

.role-permissions-page__module-button small,
.role-permissions-page__permission-item small {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  line-height: 1.3;
  margin-top: 3px;
}

.role-permissions-page__module-count {
  align-items: center;
  background: #eef2f7;
  border-radius: 999px;
  color: #334155;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.72rem;
  font-weight: 700;
  justify-content: center;
  min-width: 34px;
  padding: 4px 8px;
}

.role-permissions-page__permissions-head {
  align-items: center;
}

.role-permissions-page__summary {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e5ebf3;
  border-radius: 8px;
  display: inline-flex;
  gap: 8px;
  min-height: 34px;
  padding: 6px 10px;
}

.role-permissions-page__summary strong {
  color: #0f172a;
  font-size: 1rem;
}

.role-permissions-page__summary span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 600;
}

.role-permissions-page__toolbar {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 1fr) auto auto;
  margin-bottom: 12px;
}

.role-permissions-page__toolbar .v-btn {
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}

.role-permissions-page__permission-list {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.role-permissions-page__permission-item {
  align-items: flex-start;
  border: 1px solid #e5ebf3;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  gap: 6px;
  grid-template-columns: 26px minmax(0, 1fr);
  min-height: 72px;
  padding: 10px;
}

.role-permissions-page__permission-item.is-selected {
  background: #f8fafc;
  border-color: #94a3b8;
}

.role-permissions-page__empty {
  align-items: center;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  display: flex;
  font-size: 0.84rem;
  justify-content: center;
  min-height: 180px;
  padding: 18px;
  text-align: center;
}

.role-permissions-page__module-state {
  align-items: center;
  color: #64748b;
  display: flex;
  font-size: 0.76rem;
  gap: 7px;
  margin-top: 12px;
}

.role-permissions-page__module-state.is-complete {
  color: #047857;
}

.role-permissions-page__module-state.is-partial {
  color: #b45309;
}

.role-permissions-page__footer-actions {
  border-top: 1px solid #e5ebf3;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
  padding-top: 18px;
}

.role-permissions-page__footer-actions .v-btn {
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 36px;
  padding-inline: 14px;
  text-transform: none;
}

@media (max-width: 991px) {
  .role-permissions-page__layout {
    grid-template-columns: 1fr;
  }

  .role-permissions-page__modules {
    border-right: 0;
    border-bottom: 1px solid #e5ebf3;
    padding-bottom: 20px;
    padding-right: 0;
  }

  .role-permissions-page__module-list,
  .role-permissions-page__permission-list {
    max-height: none;
  }

  .role-permissions-page__permission-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .role-permissions-page__toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .role-permissions-page__permission-list {
    grid-template-columns: 1fr;
  }

  .role-permissions-page__footer-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
