<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import Status from "@/app/common/components/Status.vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { roleService } from "@/app/http/httpServiceProvider";
import { useRoleStore } from "@/store/roleStore";
import CreateUpdateRoleModal from "@/components/users/roles/CreateUpdateRoleModal.vue";
import ViewRoleModal from "@/components/users/roles/ViewRoleModal.vue";
import type { OptionType } from "@/app/common/types/option.type";
import type { RoleFetchParams, RoleFormType, RoleListingType } from "@/components/users/roles/types";
import { roleHeader } from "@/components/users/roles/listView/utils";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import type { PermissionRequirement } from "@/app/permissions/constants";

const { t } = useI18n();
const toast = useToast();
const roleStore = useRoleStore();
const router = useRouter();
const { can, canAny } = usePermissions();

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const roleData = ref<RoleFormType | null>(null);
const viewRoleData = ref<RoleListingType | null>(null);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const searchQuery = ref("");
const searchProps = "name,description";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedRoles = ref<RoleListingType[]>([]);
const errorMsg = ref("");
const viewLoading = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const actionOptions: OptionType[] = [
  { title: t("t-view"), value: "view", icon: "ph-eye" },
  { title: t("t-manage-permissions"), value: "manage-permissions", icon: "ph-key" },
  { title: t("t-edit"), value: "edit", icon: "ph-pencil-simple" },
  { title: t("t-delete"), value: "delete", icon: "ph-trash" },
];

const loadingList = computed(() => roleStore.loading);
const totalItems = computed(() => roleStore.pagination.totalElements);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const canCreateRole = computed(() => can(PERMISSIONS.ACCESS_MANAGEMENT.ROLES.CREATE));
const canDeleteRole = computed(() => can(PERMISSIONS.ACCESS_MANAGEMENT.ROLES.DELETE));

const actionPermissionByValue: Record<string, PermissionRequirement> = {
  view: PERMISSIONS.ACCESS_MANAGEMENT.ROLES.VIEW,
  "manage-permissions": PERMISSIONS.ACCESS_MANAGEMENT.ROLES.MANAGE_PERMISSIONS,
  edit: PERMISSIONS.ACCESS_MANAGEMENT.ROLES.UPDATE,
  delete: PERMISSIONS.ACCESS_MANAGEMENT.ROLES.DELETE,
};

const dynamicActionOptions = computed(() =>
  actionOptions.filter(option => canAny(actionPermissionByValue[option.value]))
);

const defaultRole = (): RoleFormType => ({
  name: "",
  description: "",
});

const handleApiError = (error: unknown) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const message = getApiErrorMessages(error, t("t-message-save-error"))[0] || t("t-message-save-error");
  errorMsg.value = message;

  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});

watch(selectedRoles, newSelection => {
  console.log("Roles selecionadas:", newSelection);
}, { deep: true });

const fetchRoles = async ({ page, itemsPerPage, sortBy, search }: RoleFetchParams) => {
  try {
    await roleStore.fetchRoles(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "name",
      sortBy[0]?.order || "asc",
      search || searchQuery.value,
      searchProps
    );

    currentPage.value = (roleStore.pagination.currentPage ?? page - 1) + 1;
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach(message => toast.error(message));
  }
};

const toggleSelection = (item: RoleListingType) => {
  const index = selectedRoles.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedRoles.value = [...selectedRoles.value, item];
  } else {
    selectedRoles.value = selectedRoles.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, newVal => {
  if (!newVal) {
    roleData.value = null;
    errorMsg.value = "";
  }
});

watch(viewDialog, newVal => {
  if (!newVal) {
    viewRoleData.value = null;
  }
});

watch(deleteDialog, newVal => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const onCreateClick = () => {
  if (!canCreateRole.value) return;

  roleData.value = defaultRole();
  dialog.value = true;
};

const onEditClick = (data: RoleListingType) => {
  if (!can(PERMISSIONS.ACCESS_MANAGEMENT.ROLES.UPDATE)) return;

  roleData.value = {
    id: data.id,
    name: data.name,
    description: data.description,
  };
  dialog.value = true;
};

const onManagePermissionsClick = (data: RoleListingType) => {
  if (!can(PERMISSIONS.ACCESS_MANAGEMENT.ROLES.MANAGE_PERMISSIONS)) return;

  router.push(`/users/roles/edit/${data.id}`);
};

const onActionSelect = (option: string, data: RoleListingType) => {
  if (option === "manage-permissions") {
    onManagePermissionsClick(data);
  }
};

const onViewClick = async (data: RoleListingType) => {
  if (!can(PERMISSIONS.ACCESS_MANAGEMENT.ROLES.VIEW)) return;

  viewRoleData.value = data;
  viewDialog.value = true;

  viewLoading.value = true;
  try {
    viewRoleData.value = await roleService.findRoleById(data.id);
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach(message => toast.error(message));
  } finally {
    viewLoading.value = false;
  }
};

const onSubmit = async (data: RoleFormType, callbacks?: { onSuccess?: () => void; onFinally?: () => void }) => {
  if ((!data.id && !canCreateRole.value) || (data.id && !can(PERMISSIONS.ACCESS_MANAGEMENT.ROLES.UPDATE))) return;

  try {
    if (!data.id) {
      await roleService.createRole(data);
      toast.success(t("t-toast-message-created"));
    } else {
      await roleService.updateRole(data.id, data);
      toast.success(t("t-toast-message-update"));
    }

    await fetchRoles({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (id: string) => {
  if (!canDeleteRole.value) return;

  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!canDeleteRole.value) return;

  deleteLoading.value = true;

  try {
    await roleService.deleteRole(deleteId.value!);
    selectedRoles.value = selectedRoles.value.filter(role => role.id !== deleteId.value);
    await fetchRoles({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t("t-toast-message-deleted"));
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};
</script>

<template>
  <ListingPageShell
    class="role-listing-page"
    :title="$t('t-roles-list')"
    :subtitle="$t('t-roles-list-subtitle')"
    :action-label="$t('t-add-role')"
    :show-action="canCreateRole"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateClick"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-roles')" />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer
      v-model="selectedRoles"
      v-model:page="currentPage"
      :headers="roleHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="roleStore.roles"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      @load-items="fetchRoles"
    >
      <template #body="{ items }">
        <tr v-for="item in items as RoleListingType[]" :key="item.id" class="role-listing-table__row">
          <td v-if="canDeleteRole" data-label="">
            <v-checkbox
              :model-value="selectedRoles.some(selected => selected.id === item.id)"
              @update:model-value="toggleSelection(item)"
              hide-details
              density="compact"
            />
          </td>
          <td data-label="Nome" class="role-listing-table__primary-cell">
            {{ item.name || "-" }}
          </td>
          <td data-label="Descricao">
            {{ item.description || "-" }}
          </td>
          <td data-label="Disponibilidade">
            <Status :status="item.enabled ? 'active' : 'unactive'" />
          </td>
          <td data-label="Accao" class="role-listing-table__actions-cell">
            <TableActionMenu
              :menu-items="dynamicActionOptions"
              @onSelect="onActionSelect($event, item)"
              @onView="onViewClick(item)"
              @onEdit="onEditClick(item)"
              @onDelete="onDelete(item.id)"
            />
          </td>
        </tr>
      </template>

      <template v-if="roleStore.roles.length === 0" #body>
        <tr>
          <td :colspan="roleHeader.length + (canDeleteRole ? 1 : 0)" class="role-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="role-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="role-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="role-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faca uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateRoleModal v-if="roleData" v-model="dialog" :data="roleData" :error="errorMsg" @onSubmit="onSubmit" />
  <ViewRoleModal v-if="viewRoleData" v-model="viewDialog" :data="viewRoleData" :loading="viewLoading" />
  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete" :loading="deleteLoading" />
</template>

<style scoped>
.role-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.role-listing-page :deep(.v-table),
.role-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.role-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.role-listing-page :deep(.v-table__wrapper > table > thead),
.role-listing-page :deep(.v-data-table thead) {
  background: #f3f6fa;
}

.role-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.role-listing-page :deep(.v-data-table-header th),
.role-listing-page :deep(.v-data-table__th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-bottom: 10px;
  padding-top: 10px;
  text-transform: none;
}

.role-listing-table__primary-cell {
  color: #0f172a;
  font-weight: 700;
}

.role-listing-table__actions-cell {
  text-align: center;
}

.role-listing-table__empty-title {
  color: #172033;
  font-size: 0.95rem;
  font-weight: 700;
}

.role-listing-table__empty-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}

@media (max-width: 767px) {
  .role-listing-page :deep(.v-table__wrapper) {
    overflow-x: auto;
  }
}
</style>
