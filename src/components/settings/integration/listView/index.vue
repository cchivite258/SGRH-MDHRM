<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import Status from "@/app/common/components/Status.vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import { integrationDefinitionService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import CreateUpdateIntegrationModal from "@/components/settings/integration/CreateUpdateIntegrationModal.vue";
import ViewIntegrationModal from "@/components/settings/integration/ViewIntegrationModal.vue";
import { listViewHeader } from "@/components/settings/integration/listView/utils";
import type {
  IntegrationDefinitionForm,
  IntegrationDefinitionId,
  IntegrationDefinitionListing,
  IntegrationDefinitionOption,
} from "@/components/settings/integration/types";
import type { OptionType } from "@/app/common/types/option.type";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import type { PermissionRequirement } from "@/app/permissions/constants";

const { t } = useI18n();
const toast = useToast();
const { can, canAny } = usePermissions();

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const integrationData = ref<IntegrationDefinitionListing | IntegrationDefinitionForm | null>(null);
const deleteId = ref<IntegrationDefinitionId | null>(null);
const deleteLoading = ref(false);
const statusLoadingId = ref<IntegrationDefinitionId | null>(null);
const searchQuery = ref("");
const searchProps = "name,code,application,companyCode";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const errorMsg = ref("");
const integrations = ref<IntegrationDefinitionListing[]>([]);
const totalItems = ref(0);
const loadingList = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const emptyForm = (): IntegrationDefinitionForm => ({
  id: "-1",
  application: "",
  name: "",
  description: "",
  baseUrl: "",
  apiVersion: "",
  tenant: "",
  companyCode: "",
  username: "",
  password: "",
  timeoutSeconds: 30,
});

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const canCreateIntegration = computed(() => can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.CREATE));
const canUpdateIntegration = computed(() => can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.UPDATE));

const actionOptions: OptionType[] = [
  { title: "Consultar", value: "view", icon: "ph-eye" },
  { title: "Editar", value: "edit", icon: "ph-pencil-simple" },
  { title: "Activar", value: "activate", icon: "ph-check-circle" },
  { title: "Desactivar", value: "deactivate", icon: "ph-x-circle" },
  { title: "Eliminar", value: "delete", icon: "ph-trash" },
];

const actionPermissionByValue: Record<string, PermissionRequirement> = {
  view: PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.VIEW,
  edit: PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.UPDATE,
  activate: PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.ACTIVATE,
  deactivate: PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.DEACTIVATE,
  delete: PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.DELETE,
};

const getActionOptions = (item: IntegrationDefinitionListing) =>
  actionOptions.filter(option => {
    if (!canAny(actionPermissionByValue[option.value])) return false;
    if (option.value === "delete" && item.removable === false) return false;
    if (option.value === "activate" && item.active) return false;
    if (option.value === "deactivate" && !item.active) return false;
    return true;
  });

const handleApiError = (error: any) => {
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

const fetchIntegrations = async ({ page, itemsPerPage, sortBy, search }: IntegrationDefinitionOption) => {
  loadingList.value = true;

  try {
    const { content, meta } = await integrationDefinitionService.getIntegrationDefinitions(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "createdAt",
      sortBy[0]?.order || "asc",
      search,
      searchProps
    );

    integrations.value = content;
    totalItems.value = meta.totalElements ?? content.length;
    currentPage.value = (meta.page ?? page - 1) + 1;
  } catch (error) {
    integrations.value = [];
    totalItems.value = 0;
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    loadingList.value = false;
  }
};

const reloadIntegrations = () =>
  fetchIntegrations({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
    search: searchQuery.value,
  });

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    integrationData.value = null;
  }
});

watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    integrationData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const onCreateEditClick = (data: IntegrationDefinitionListing | null) => {
  if (!data && !canCreateIntegration.value) return;
  if (data && !canUpdateIntegration.value) return;

  integrationData.value = data
    ? {
        ...data,
        password: "",
      }
    : emptyForm();

  dialog.value = true;
};

const onViewClick = (data: IntegrationDefinitionListing) => {
  if (!can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.VIEW)) return;

  integrationData.value = data;
  viewDialog.value = true;
};

const onSubmit = async (data: IntegrationDefinitionForm, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  if ((!data.id && !canCreateIntegration.value) || (data.id && !canUpdateIntegration.value)) return;

  try {
    const response = !data.id
      ? await integrationDefinitionService.createIntegrationDefinition(data)
      : await integrationDefinitionService.updateIntegrationDefinition(data.id, data);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(!data.id ? t("t-toast-message-created") : t("t-toast-message-update"));
    await fetchIntegrations({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (item: IntegrationDefinitionListing) => {
  if (!can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.DELETE) || item.removable === false) return;

  deleteId.value = item.id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.DELETE) || !deleteId.value) return;

  deleteLoading.value = true;

  try {
    await integrationDefinitionService.deleteIntegrationDefinition(deleteId.value);
    await fetchIntegrations({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t("t-toast-message-deleted"));
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const onToggleActive = async (item: IntegrationDefinitionListing, activate: boolean) => {
  const allowed = activate
    ? canAny(actionPermissionByValue.activate)
    : canAny(actionPermissionByValue.deactivate);
  if (!allowed || statusLoadingId.value) return;

  statusLoadingId.value = item.id;

  try {
    const response = activate
      ? await integrationDefinitionService.activateIntegrationDefinition(item.id)
      : await integrationDefinitionService.deactivateIntegrationDefinition(item.id);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(activate ? t("t-integration-activated") : t("t-integration-deactivated"));
    await reloadIntegrations();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    statusLoadingId.value = null;
  }
};

const onActionSelect = (option: string, item: IntegrationDefinitionListing) => {
  if (option === "view") onViewClick(item);
  if (option === "edit") onCreateEditClick(item);
  if (option === "activate") onToggleActive(item, true);
  if (option === "deactivate") onToggleActive(item, false);
  if (option === "delete") onDelete(item);
};

const display = (value?: string | null) => value?.trim() || "-";
</script>

<template>
  <ListingPageShell
    class="integration-listing-page"
    :title="$t('t-integrations')"
    subtitle="Consulte, pesquise e faça a gestão das instalações das aplicações externas."
    :action-label="$t('t-add-integration')"
    :show-action="canCreateIntegration"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-integration')" />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer
      v-model:page="currentPage"
      :headers="listViewHeader.map(item => ({ ...item, title: item.title ? $t(`t-${item.title}`) : '' }))"
      :items="integrations"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-select="false"
      :show-pagination="false"
      @load-items="fetchIntegrations"
    >
      <template #body="{ items }">
        <tr v-for="item in items as IntegrationDefinitionListing[]" :key="item.id" class="integration-listing-table__row">
          <td data-label="Código" class="integration-listing-table__primary-cell">
            <span class="integration-listing-table__text" :title="display(item.code)">
              {{ display(item.code) }}
            </span>
          </td>
          <td data-label="Aplicação">
            {{ display(item.application) }}
          </td>
          <td data-label="Nome">
            <span class="integration-listing-table__text" :title="display(item.name)">
              {{ display(item.name) }}
            </span>
          </td>
          <td data-label="Empresa">
            {{ display(item.companyCode) }}
          </td>
          <td data-label="Estado">
            <Status :status="item.active ? 'active' : 'INACTIVE'" />
          </td>
          <td data-label="Acção" class="integration-listing-table__actions-cell">
            <v-progress-circular
              v-if="statusLoadingId === item.id"
              indeterminate
              size="20"
              width="2"
              color="primary"
            />
            <TableActionMenu
              v-else
              :menu-items="getActionOptions(item)"
              @onSelect="onActionSelect($event, item)"
            />
          </td>
        </tr>
      </template>

      <template v-if="!integrations.length" #body>
        <tr>
          <td :colspan="listViewHeader.length" class="integration-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="integration-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="integration-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="integration-listing-table__empty-subtitle mt-1">
              {{ $t("t-integration-empty-subtitle") }}
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateIntegrationModal
    v-if="dialog && integrationData"
    v-model="dialog"
    :data="integrationData as IntegrationDefinitionForm"
    :error="errorMsg"
    @onSubmit="onSubmit"
  />

  <ViewIntegrationModal
    v-if="viewDialog && integrationData"
    v-model="viewDialog"
    :data="integrationData as IntegrationDefinitionListing"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    :loading="deleteLoading"
    @onConfirm="onConfirmDelete"
  />
</template>

<style scoped>
.integration-listing-page :deep(.data-table-server-wrapper) {
  --integration-listing-surface: #ffffff;
  --integration-listing-surface-strong: #f3f6fa;
  --integration-listing-surface-hover: #fcfdff;
  --integration-listing-border: #e8edf3;
  --integration-listing-border-soft: #eef2f7;
  --integration-listing-border-strong: #d8e1ec;
  --integration-listing-text: #334155;
  --integration-listing-text-strong: #0f172a;
  --integration-listing-text-muted: #64748b;
  --integration-listing-shadow-accent: #cbd5e1;
  background: var(--integration-listing-surface);
  border: 1px solid var(--integration-listing-border);
  border-radius: 14px;
  overflow: hidden;
}

.integration-listing-page :deep(.v-table),
.integration-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.integration-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.integration-listing-page :deep(.v-table__wrapper > table) {
  table-layout: fixed;
  width: 100%;
}

.integration-listing-page :deep(.v-table__wrapper > table > thead),
.integration-listing-page :deep(.v-data-table thead) {
  background: var(--integration-listing-surface-strong);
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.integration-listing-page :deep(.v-data-table-header th),
.integration-listing-page :deep(.v-data-table__th) {
  background-color: var(--integration-listing-surface-strong) !important;
  border-bottom: 1px solid var(--integration-listing-border-strong);
  color: var(--integration-listing-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.integration-listing-page :deep(.v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  line-height: 1.2;
  white-space: normal;
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.integration-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid var(--integration-listing-border-soft);
  color: var(--integration-listing-text);
  font-size: 0.78rem;
  line-height: 1.35;
  padding: 18px 8px;
  vertical-align: middle;
}

.integration-listing-page :deep(.v-data-table__tr:hover) {
  background: var(--integration-listing-surface-hover) !important;
}

.integration-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--integration-listing-shadow-accent);
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(1)),
.integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(1)) {
  width: 14%;
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(2)),
.integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(2)) {
  width: 16%;
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(3)),
.integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(3)) {
  width: 28%;
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(4)),
.integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(4)) {
  width: 18%;
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(5)),
.integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(5)) {
  width: 14%;
}

.integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(6)),
.integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(6)) {
  width: 72px;
}

.integration-listing-table__primary-cell {
  color: var(--integration-listing-text);
  font-weight: 500;
  line-height: 1.45;
}

.integration-listing-table__text {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
}

.integration-listing-table__actions-cell {
  text-align: center;
  white-space: nowrap;
}

.integration-listing-page :deep(.integration-listing-table__actions-cell .d-flex) {
  gap: 6px;
  justify-content: center !important;
  width: 100%;
}

.integration-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.integration-listing-table__empty-avatar {
  border: 1px solid var(--integration-listing-border);
}

.integration-listing-table__empty-title {
  color: var(--integration-listing-text-strong);
  font-size: 0.98rem;
  font-weight: 700;
}

.integration-listing-table__empty-subtitle {
  color: var(--integration-listing-text-muted);
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .integration-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .integration-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .integration-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .integration-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: #ffffff;
    border: 1px solid var(--integration-listing-border);
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid var(--integration-listing-border-soft);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100% !important;
  }

  .integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .integration-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: var(--integration-listing-text-muted);
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }
}
</style>
