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
import { alertConfigurationService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { formateDate } from "@/app/common/dateFormate";
import CreateUpdateAlertConfigurationModal from "@/components/settings/alerts/CreateUpdateAlertConfigurationModal.vue";
import ViewAlertConfigurationModal from "@/components/settings/alerts/ViewAlertConfigurationModal.vue";
import ManageAlertParametersModal from "@/components/settings/alerts/ManageAlertParametersModal.vue";
import { alertTypeOptions, listViewHeader } from "@/components/settings/alerts/listView/utils";
import type {
  AlertConfigurationForm,
  AlertConfigurationId,
  AlertConfigurationListing,
  AlertConfigurationOption,
} from "@/components/settings/alerts/types";
import type { OptionType } from "@/app/common/types/option.type";

const { t } = useI18n();
const toast = useToast();

const dialog = ref(false);
const viewDialog = ref(false);
const parametersDialog = ref(false);
const deleteDialog = ref(false);
const alertData = ref<AlertConfigurationListing | AlertConfigurationForm | null>(null);
const parameterAlert = ref<AlertConfigurationListing | null>(null);
const deleteId = ref<AlertConfigurationId | null>(null);
const deleteLoading = ref(false);
const executeLoadingId = ref<AlertConfigurationId | null>(null);
const searchQuery = ref("");
const searchProps = "name,description,type,lastStatus";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedAlerts = ref<any[]>([]);
const errorMsg = ref("");
const alerts = ref<AlertConfigurationListing[]>([]);
const totalItems = ref(0);
const loadingList = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const actionOptions: OptionType[] = [
  { title: "Ver", value: "view", icon: "ph-eye" },
  { title: "Editar", value: "edit", icon: "ph-pencil-simple" },
  { title: "Definir parâmetros", value: "parameters", icon: "ph-sliders-horizontal" },
  { title: "Executar", value: "execute", icon: "ph-play" },
  { title: "Eliminar", value: "delete", icon: "ph-trash" },
];

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

const fetchAlerts = async ({ page, itemsPerPage, sortBy, search }: AlertConfigurationOption) => {
  loadingList.value = true;

  try {
    const { content, meta } = await alertConfigurationService.getAlertConfigurations(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "createdAt",
      sortBy[0]?.order || "asc",
      search,
      searchProps
    );

    alerts.value = content;
    totalItems.value = meta.totalElements ?? content.length;
    currentPage.value = (meta.page ?? page - 1) + 1;
  } catch (error) {
    alerts.value = [];
    totalItems.value = 0;
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    loadingList.value = false;
  }
};

const toggleSelection = (item: AlertConfigurationListing) => {
  const index = selectedAlerts.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedAlerts.value = [...selectedAlerts.value, item];
  } else {
    selectedAlerts.value = selectedAlerts.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    alertData.value = null;
  }
});

watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    alertData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

watch(parametersDialog, (newVal: boolean) => {
  if (!newVal) {
    parameterAlert.value = null;
  }
});

const onCreateEditClick = (data: AlertConfigurationListing | null) => {
  alertData.value = data ?? {
    id: "-1",
    name: "",
    description: "",
    type: "SERVICE_PROVIDER_EXPIRING",
    maxRetryCount: null,
    enabled: true,
    repeatUnit: "DAYS",
    repeatValue: null,
  };

  dialog.value = true;
};

const onViewClick = (data: AlertConfigurationListing) => {
  alertData.value = data;
  viewDialog.value = true;
};

const onManageParameters = (data: AlertConfigurationListing) => {
  parameterAlert.value = data;
  parametersDialog.value = true;
};

const onSubmit = async (data: AlertConfigurationForm, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    const response = !data.id
      ? await alertConfigurationService.createAlertConfiguration(data)
      : await alertConfigurationService.updateAlertConfiguration(data.id, data);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(!data.id ? t("t-toast-message-created") : t("t-toast-message-update"));
    await fetchAlerts({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (item: AlertConfigurationListing) => {
  if (!item.removable) {
    toast.error(t("t-alert-not-removable"));
    return;
  }

  deleteId.value = item.id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  deleteLoading.value = true;

  try {
    await alertConfigurationService.deleteAlertConfiguration(deleteId.value!);
    await fetchAlerts({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t("t-toast-message-deleted"));
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const onExecute = async (item: AlertConfigurationListing) => {
  executeLoadingId.value = item.id;

  try {
    await alertConfigurationService.executeAlertConfiguration(item.id);
    toast.success(t("t-alert-executed-successfully"));
    await fetchAlerts({ page: currentPage.value, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
  } catch (error) {
    getApiErrorMessages(error, t("t-alert-execute-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    executeLoadingId.value = null;
  }
};

const onActionSelect = (option: string, item: AlertConfigurationListing) => {
  if (option === "view") onViewClick(item);
  if (option === "edit") onCreateEditClick(item);
  if (option === "delete") onDelete(item);
  if (option === "execute") onExecute(item);
  if (option === "parameters") onManageParameters(item);
};

const formatDate = (value?: string | null) => {
  return formateDate(value || undefined) || "-";
};

const executionStatusColor = (status?: string | null) => {
  if (status === "SCHEDULED") return "warning";
  if (status === "SUCCESS") return "success";
  if (status === "FAILURE") return "danger";
  if (status === "RUNNING") return "info";
  return "secondary";
};

const getExecutionStatusLabel = (status?: string | null) => {
  if (!status) return "-";

  const statusLabels: Record<string, string> = {
    SCHEDULED: t("t-scheduled-job-status-scheduled"),
    SUCCESS: t("t-cron-execution-status-success"),
    FAILURE: t("t-cron-execution-status-failure"),
    RUNNING: t("t-scheduled-job-status-running"),
  };

  return statusLabels[status] ?? status;
};

const getScheduleLabel = (item: AlertConfigurationListing) => {
  if (item.repeatValue && item.repeatUnit) {
    return `${item.repeatValue} ${getRepeatUnitLabel(item.repeatUnit)}`;
  }

  return item.cronExpression || "-";
};

const getRepeatUnitLabel = (unit: string) => {
  const unitLabels: Record<string, string> = {
    MINUTES: t("t-repeat-unit-minutes"),
    HOURS: t("t-repeat-unit-hours"),
    DAYS: t("t-repeat-unit-days"),
    WEEKS: t("t-repeat-unit-weeks"),
    MONTHS: t("t-repeat-unit-months"),
  };

  return unitLabels[unit] ?? unit;
};

const getAlertTypeLabel = (type: string) => {
  const option = alertTypeOptions.find(option => option.value === type);
  return option ? t(option.label) : type;
};
</script>

<template>
  <ListingPageShell
    class="alert-listing-page"
    :title="$t('t-alerts')"
    subtitle="Consulte, pesquise e faça a gestão das configurações de alertas."
    :action-label="$t('t-add-alert')"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-alert')" />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer
      v-model="selectedAlerts"
      v-model:page="currentPage"
      :headers="listViewHeader.map(item => ({ ...item, title: item.title ? $t(`t-${item.title}`) : '' }))"
      :items="alerts"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      show-select
      :show-pagination="false"
      @load-items="fetchAlerts"
    >
      <template #body="{ items }">
        <tr v-for="item in items as AlertConfigurationListing[]" :key="item.id" class="alert-listing-table__row">
          <td data-label="" class="alert-listing-page__select-cell">
            <v-checkbox
              :model-value="selectedAlerts.some(selected => selected.id === item.id)"
              hide-details
              density="compact"
              @update:model-value="toggleSelection(item)"
            />
          </td>
          <td data-label="Nome" class="alert-listing-table__primary-cell">
            <span class="alert-listing-table__text" :title="item.name">{{ item.name }}</span>
          </td>
          <td data-label="Tipo" class="alert-listing-table__type-cell">
            <span class="alert-listing-table__text" :title="getAlertTypeLabel(item.type)">
              {{ getAlertTypeLabel(item.type) }}
            </span>
          </td>
          <td data-label="Estado">
            <v-chip
              v-if="item.lastStatus"
              density="compact"
              label
              variant="tonal"
              :color="executionStatusColor(item.lastStatus)"
            >
              <span class="status-chip">{{ getExecutionStatusLabel(item.lastStatus) }}</span>
            </v-chip>
            <span v-else>-</span>
          </td>
          <td data-label="Última execução">{{ formatDate(item.lastExecution) }}</td>
          <td data-label="Próxima execução">{{ formatDate(item.nextExecution) }}</td>
          <td data-label="Disponibilidade">
            <Status :status="item.enabled ? 'enabled' : 'disabled'" />
          </td>
          <td data-label="Acção" class="alert-listing-table__actions-cell">
            <v-progress-circular v-if="executeLoadingId === item.id" indeterminate size="20" width="2" color="primary" />
            <TableActionMenu v-else :menu-items="actionOptions" @onSelect="onActionSelect($event, item)" />
          </td>
        </tr>
      </template>

      <template v-if="!alerts.length" #body>
        <tr>
          <td :colspan="listViewHeader.length + 1" class="alert-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="alert-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="alert-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="alert-listing-table__empty-subtitle mt-1">
              Ajuste a pesquisa e tente novamente.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateAlertConfigurationModal
    v-if="alertData"
    v-model="dialog"
    :data="alertData as AlertConfigurationForm"
    :error="errorMsg"
    @onSubmit="onSubmit"
  />

  <ViewAlertConfigurationModal
    v-if="alertData"
    v-model="viewDialog"
    :data="alertData as AlertConfigurationListing"
  />

  <ManageAlertParametersModal
    v-if="parameterAlert"
    v-model="parametersDialog"
    :alert="parameterAlert"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    :loading="deleteLoading"
    @onConfirm="onConfirmDelete"
  />
</template>

<style scoped>
.alert-listing-page :deep(.data-table-server-wrapper) {
  --alert-listing-surface: #ffffff;
  --alert-listing-surface-strong: #f3f6fa;
  --alert-listing-surface-hover: #fcfdff;
  --alert-listing-surface-mobile: #ffffff;
  --alert-listing-border: #e8edf3;
  --alert-listing-border-soft: #eef2f7;
  --alert-listing-border-strong: #d8e1ec;
  --alert-listing-text: #334155;
  --alert-listing-text-strong: #0f172a;
  --alert-listing-text-muted: #64748b;
  --alert-listing-shadow-accent: #cbd5e1;
  --alert-listing-mobile-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  background: var(--alert-listing-surface);
  border: 1px solid var(--alert-listing-border);
  border-radius: 14px;
  overflow: hidden;
}

.alert-listing-page :deep(.v-table),
.alert-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.alert-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead),
.alert-listing-page :deep(.v-data-table thead) {
  background: var(--alert-listing-surface-strong);
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.alert-listing-page :deep(.v-data-table-header th),
.alert-listing-page :deep(.v-data-table__th) {
  background-color: var(--alert-listing-surface-strong) !important;
  border-bottom: 1px solid var(--alert-listing-border-strong);
  color: var(--alert-listing-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.alert-listing-page :deep(.v-table__wrapper > table) {
  table-layout: fixed;
  width: 100%;
}

.alert-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  line-height: 1.2;
  white-space: normal;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.alert-listing-page :deep(.v-data-table-header th:last-child),
.alert-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.alert-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.alert-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.alert-listing-page :deep(.v-data-table-header__sort-icon) {
  color: var(--alert-listing-text-muted);
  font-size: 0.82rem;
  opacity: 1;
}

.alert-listing-page :deep(.v-data-table__td) {
  background: var(--alert-listing-surface);
}

.alert-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid var(--alert-listing-border-soft);
  color: var(--alert-listing-text);
  font-size: 0.8rem;
  line-height: 1.35;
  padding: 18px 10px;
  vertical-align: middle;
}

.alert-listing-page :deep(.v-data-table__tr:hover) {
  background: var(--alert-listing-surface-hover) !important;
}

.alert-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--alert-listing-shadow-accent);
}

.alert-listing-page :deep(.v-data-table__td--select),
.alert-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(1)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(1)) {
  width: 48px;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(2)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(2)) {
  width: 20%;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(3)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(3)) {
  width: 24%;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(4)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(4)) {
  width: 16%;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(5)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(5)),
.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(6)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(6)) {
  width: 14%;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(7)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(7)) {
  width: 12%;
}

.alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(8)),
.alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(8)) {
  width: 72px;
}

.alert-listing-page :deep(.v-selection-control) {
  min-height: auto;
}

.alert-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.alert-listing-page :deep(.v-checkbox .v-selection-control__wrapper) {
  color: var(--alert-listing-text-muted);
}

.alert-listing-table__row {
  position: relative;
}

.alert-listing-table__primary-cell,
.alert-listing-table__type-cell {
  color: var(--alert-listing-text);
  font-weight: 500;
  line-height: 1.45;
}

.alert-listing-table__text {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
}

.alert-listing-page :deep(.v-chip) {
  font-size: 0.8rem !important;
  font-weight: 500 !important;
}

.alert-listing-page :deep(.v-chip .status-chip),
.alert-listing-page :deep(.v-chip .v-chip__content) {
  font-size: inherit;
  font-weight: inherit;
}

.alert-listing-table__actions-cell {
  text-align: center;
  white-space: nowrap;
}

.alert-listing-page :deep(.alert-listing-table__actions-cell .d-flex) {
  gap: 6px;
  justify-content: center !important;
  width: 100%;
}

.alert-listing-page :deep(.alert-listing-table__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.alert-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.alert-listing-table__empty-avatar {
  border: 1px solid var(--alert-listing-border);
}

.alert-listing-table__empty-title {
  color: var(--alert-listing-text-strong);
  font-size: 0.98rem;
  font-weight: 700;
}

.alert-listing-table__empty-subtitle {
  color: var(--alert-listing-text-muted);
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .alert-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .alert-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: var(--alert-listing-surface-mobile);
    border: 1px solid var(--alert-listing-border);
    border-radius: 14px;
    box-shadow: var(--alert-listing-mobile-shadow);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid var(--alert-listing-border-soft);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: var(--alert-listing-text-muted);
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .alert-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .alert-listing-table__actions-cell {
    display: block !important;
  }
}
</style>
