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
import { periodConfigService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import CreateUpdatePeriodConfigModal from "@/components/settings/periodConfig/CreateUpdatePeriodConfigModal.vue";
import ViewPeriodConfigModal from "@/components/settings/periodConfig/ViewPeriodConfigModal.vue";
import {
  formatPeriodBound,
  listViewHeader,
  periodConfigTypeOptions,
} from "@/components/settings/periodConfig/listView/utils";
import type {
  PeriodConfigForm,
  PeriodConfigId,
  PeriodConfigListing,
  PeriodConfigOption,
} from "@/components/settings/periodConfig/types";
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
const periodConfigData = ref<PeriodConfigListing | PeriodConfigForm | null>(null);
const deleteId = ref<PeriodConfigId | null>(null);
const deleteLoading = ref(false);
const statusLoadingId = ref<PeriodConfigId | null>(null);
const searchQuery = ref("");
const searchProps = "type";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const errorMsg = ref("");
const periodConfigs = ref<PeriodConfigListing[]>([]);
const totalItems = ref(0);
const loadingList = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const canCreatePeriodConfig = computed(() => can(PERMISSIONS.SETTINGS.PERIOD_CONFIG.CREATE));
const canUpdatePeriodConfig = computed(() => can(PERMISSIONS.SETTINGS.PERIOD_CONFIG.UPDATE));

const actionOptions: OptionType[] = [
  { title: "Consultar", value: "view", icon: "ph-eye" },
  { title: "Editar", value: "edit", icon: "ph-pencil-simple" },
  { title: "Activar", value: "activate", icon: "ph-check-circle" },
  { title: "Desactivar", value: "deactivate", icon: "ph-x-circle" },
  { title: "Eliminar", value: "delete", icon: "ph-trash" },
];

const actionPermissionByValue: Record<string, PermissionRequirement> = {
  view: PERMISSIONS.SETTINGS.PERIOD_CONFIG.VIEW,
  edit: PERMISSIONS.SETTINGS.PERIOD_CONFIG.UPDATE,
  activate: [PERMISSIONS.SETTINGS.PERIOD_CONFIG.ACTIVATE, PERMISSIONS.SETTINGS.PERIOD_CONFIG.UPDATE],
  deactivate: [PERMISSIONS.SETTINGS.PERIOD_CONFIG.DEACTIVATE, PERMISSIONS.SETTINGS.PERIOD_CONFIG.UPDATE],
  delete: PERMISSIONS.SETTINGS.PERIOD_CONFIG.DELETE,
};

const getActionOptions = (item: PeriodConfigListing) =>
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

const fetchPeriodConfigs = async ({ page, itemsPerPage, sortBy, search }: PeriodConfigOption) => {
  loadingList.value = true;

  try {
    const { content, meta } = await periodConfigService.getPeriodConfigs(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "createdAt",
      sortBy[0]?.order || "asc",
      search,
      searchProps
    );

    periodConfigs.value = content;
    totalItems.value = meta.totalElements ?? content.length;
    currentPage.value = (meta.page ?? page - 1) + 1;
  } catch (error) {
    periodConfigs.value = [];
    totalItems.value = 0;
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    loadingList.value = false;
  }
};

const reloadPeriodConfigs = () =>
  fetchPeriodConfigs({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
    search: searchQuery.value,
  });

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    periodConfigData.value = null;
  }
});

watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    periodConfigData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const onCreateEditClick = (data: PeriodConfigListing | null) => {
  if (!data && !canCreatePeriodConfig.value) return;
  if (data && !canUpdatePeriodConfig.value) return;

  periodConfigData.value = data ?? {
    id: "-1",
    type: "PAYMENT_ORDER",
    description: "",
    startDayOfMonth: 1,
    startMonthReference: "CURRENT",
    endDayOfMonth: null,
    endMonthReference: "CURRENT",
    endDayLastDayOfMonth: true,
  };

  dialog.value = true;
};

const onViewClick = (data: PeriodConfigListing) => {
  if (!can(PERMISSIONS.SETTINGS.PERIOD_CONFIG.VIEW)) return;

  periodConfigData.value = data;
  viewDialog.value = true;
};

const onSubmit = async (data: PeriodConfigForm, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  if ((!data.id && !canCreatePeriodConfig.value) || (data.id && !canUpdatePeriodConfig.value)) return;

  try {
    const response = !data.id
      ? await periodConfigService.createPeriodConfig(data)
      : await periodConfigService.updatePeriodConfig(data.id, data);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(!data.id ? t("t-toast-message-created") : t("t-toast-message-update"));
    await fetchPeriodConfigs({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (item: PeriodConfigListing) => {
  if (!can(PERMISSIONS.SETTINGS.PERIOD_CONFIG.DELETE) || item.removable === false) return;

  deleteId.value = item.id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!can(PERMISSIONS.SETTINGS.PERIOD_CONFIG.DELETE) || !deleteId.value) return;

  deleteLoading.value = true;

  try {
    await periodConfigService.deletePeriodConfig(deleteId.value);
    await fetchPeriodConfigs({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t("t-toast-message-deleted"));
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const onToggleActive = async (item: PeriodConfigListing, activate: boolean) => {
  const allowed = activate
    ? canAny(actionPermissionByValue.activate)
    : canAny(actionPermissionByValue.deactivate);
  if (!allowed || statusLoadingId.value) return;

  statusLoadingId.value = item.id;

  try {
    const response = activate
      ? await periodConfigService.activatePeriodConfig(item.id)
      : await periodConfigService.deactivatePeriodConfig(item.id);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(activate ? t("t-period-config-activated") : t("t-period-config-deactivated"));
    await reloadPeriodConfigs();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    statusLoadingId.value = null;
  }
};

const onActionSelect = (option: string, item: PeriodConfigListing) => {
  if (option === "view") onViewClick(item);
  if (option === "edit") onCreateEditClick(item);
  if (option === "activate") onToggleActive(item, true);
  if (option === "deactivate") onToggleActive(item, false);
  if (option === "delete") onDelete(item);
};

const getTypeLabel = (type: string) => {
  const option = periodConfigTypeOptions.find(option => option.value === type);
  return option ? t(option.label) : type;
};
</script>

<template>
  <ListingPageShell
    class="period-config-listing-page"
    :title="$t('t-period-configs')"
    subtitle="Consulte, pesquise e faça a gestão da configuração dos períodos mensais."
    :action-label="$t('t-add-period-config')"
    :show-action="canCreatePeriodConfig"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-period-config')" />
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
      :items="periodConfigs"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-select="false"
      :show-pagination="false"
      @load-items="fetchPeriodConfigs"
    >
      <template #body="{ items }">
        <tr v-for="item in items as PeriodConfigListing[]" :key="item.id" class="period-config-listing-table__row">
          <td data-label="Tipo" class="period-config-listing-table__primary-cell">
            <span class="period-config-listing-table__text" :title="getTypeLabel(item.type)">
              {{ getTypeLabel(item.type) }}
            </span>
          </td>
          <td data-label="Início">
            {{ formatPeriodBound(t, item.startDayOfMonth, item.startMonthReference) }}
          </td>
          <td data-label="Fim">
            {{ formatPeriodBound(t, item.endDayOfMonth, item.endMonthReference, Boolean(item.endDayLastDayOfMonth)) }}
          </td>
          <td data-label="Estado">
            <Status :status="item.active ? 'active' : 'INACTIVE'" />
          </td>
          <td data-label="Acção" class="period-config-listing-table__actions-cell">
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

      <template v-if="!periodConfigs.length" #body>
        <tr>
          <td :colspan="listViewHeader.length" class="period-config-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="period-config-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="period-config-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="period-config-listing-table__empty-subtitle mt-1">
              {{ $t("t-period-config-empty-subtitle") }}
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdatePeriodConfigModal
    v-if="dialog && periodConfigData"
    v-model="dialog"
    :data="periodConfigData as PeriodConfigForm"
    :error="errorMsg"
    @onSubmit="onSubmit"
  />

  <ViewPeriodConfigModal
    v-if="viewDialog && periodConfigData"
    v-model="viewDialog"
    :data="periodConfigData as PeriodConfigListing"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    :loading="deleteLoading"
    @onConfirm="onConfirmDelete"
  />
</template>

<style scoped>
.period-config-listing-page :deep(.data-table-server-wrapper) {
  --period-config-listing-surface: #ffffff;
  --period-config-listing-surface-strong: #f3f6fa;
  --period-config-listing-surface-hover: #fcfdff;
  --period-config-listing-border: #e8edf3;
  --period-config-listing-border-soft: #eef2f7;
  --period-config-listing-border-strong: #d8e1ec;
  --period-config-listing-text: #334155;
  --period-config-listing-text-strong: #0f172a;
  --period-config-listing-text-muted: #64748b;
  --period-config-listing-shadow-accent: #cbd5e1;
  background: var(--period-config-listing-surface);
  border: 1px solid var(--period-config-listing-border);
  border-radius: 14px;
  overflow: hidden;
}

.period-config-listing-page :deep(.v-table),
.period-config-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.period-config-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.period-config-listing-page :deep(.v-table__wrapper > table) {
  table-layout: fixed;
  width: 100%;
}

.period-config-listing-page :deep(.v-table__wrapper > table > thead),
.period-config-listing-page :deep(.v-data-table thead) {
  background: var(--period-config-listing-surface-strong);
}

.period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.period-config-listing-page :deep(.v-data-table-header th),
.period-config-listing-page :deep(.v-data-table__th) {
  background-color: var(--period-config-listing-surface-strong) !important;
  border-bottom: 1px solid var(--period-config-listing-border-strong);
  color: var(--period-config-listing-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.period-config-listing-page :deep(.v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  line-height: 1.2;
  white-space: normal;
}

.period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.period-config-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid var(--period-config-listing-border-soft);
  color: var(--period-config-listing-text);
  font-size: 0.78rem;
  line-height: 1.35;
  padding: 18px 8px;
  vertical-align: middle;
}

.period-config-listing-page :deep(.v-data-table__tr:hover) {
  background: var(--period-config-listing-surface-hover) !important;
}

.period-config-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--period-config-listing-shadow-accent);
}

.period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(1)),
.period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(1)) {
  width: 18%;
}

.period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(2)),
.period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(2)),
.period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(3)),
.period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(3)) {
  width: 28%;
}

.period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(4)),
.period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(4)) {
  width: 14%;
}

.period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(5)),
.period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(5)) {
  width: 72px;
}

.period-config-listing-table__primary-cell {
  color: var(--period-config-listing-text);
  font-weight: 500;
  line-height: 1.45;
}

.period-config-listing-table__text {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
}

.period-config-listing-table__actions-cell {
  text-align: center;
  white-space: nowrap;
}

.period-config-listing-page :deep(.period-config-listing-table__actions-cell .d-flex) {
  gap: 6px;
  justify-content: center !important;
  width: 100%;
}

.period-config-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.period-config-listing-table__empty-avatar {
  border: 1px solid var(--period-config-listing-border);
}

.period-config-listing-table__empty-title {
  color: var(--period-config-listing-text-strong);
  font-size: 0.98rem;
  font-weight: 700;
}

.period-config-listing-table__empty-subtitle {
  color: var(--period-config-listing-text-muted);
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .period-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .period-config-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .period-config-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: #ffffff;
    border: 1px solid var(--period-config-listing-border);
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid var(--period-config-listing-border-soft);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100% !important;
  }

  .period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .period-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: var(--period-config-listing-text-muted);
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }
}
</style>
