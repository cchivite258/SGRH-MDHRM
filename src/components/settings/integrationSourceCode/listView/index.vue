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
import { integrationSourceCodeService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import CreateUpdateIntegrationSourceCodeModal from "@/components/settings/integrationSourceCode/CreateUpdateIntegrationSourceCodeModal.vue";
import ViewIntegrationSourceCodeModal from "@/components/settings/integrationSourceCode/ViewIntegrationSourceCodeModal.vue";
import { listViewHeader } from "@/components/settings/integrationSourceCode/listView/utils";
import type {
  IntegrationSourceCodeForm,
  IntegrationSourceCodeId,
  IntegrationSourceCodeListing,
  IntegrationSourceCodeOption,
} from "@/components/settings/integrationSourceCode/types";
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
const sourceCodeData = ref<IntegrationSourceCodeListing | IntegrationSourceCodeForm | null>(null);
const deleteId = ref<IntegrationSourceCodeId | null>(null);
const deleteLoading = ref(false);
const searchQuery = ref("");
const searchProps = "sourceLedger,sourceType,description";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const errorMsg = ref("");
const sourceCodes = ref<IntegrationSourceCodeListing[]>([]);
const totalItems = ref(0);
const loadingList = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const emptyForm = (): IntegrationSourceCodeForm => ({
  id: "-1",
  sourceLedger: "",
  sourceType: "",
  description: "",
  enabled: true,
});

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const canCreate = computed(() => can(PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.CREATE));
const canUpdate = computed(() => can(PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.UPDATE));

const actionOptions = computed<OptionType[]>(() => [
  { title: "Consultar", value: "view", icon: "ph-eye" },
  { title: "Editar", value: "edit", icon: "ph-pencil-simple" },
  { title: "Eliminar", value: "delete", icon: "ph-trash" },
]);

const actionPermissionByValue: Record<string, PermissionRequirement> = {
  view: PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.VIEW,
  edit: PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.UPDATE,
  delete: PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.DELETE,
};

const getActionOptions = (item: IntegrationSourceCodeListing) =>
  actionOptions.value.filter(option => {
    if (!canAny(actionPermissionByValue[option.value])) return false;
    if (option.value === "delete" && item.removable === false) return false;
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

const fetchSourceCodes = async ({ page, itemsPerPage, sortBy, search }: IntegrationSourceCodeOption) => {
  loadingList.value = true;

  try {
    const { content, meta } = await integrationSourceCodeService.getIntegrationSourceCodes(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "sourceLedger",
      sortBy[0]?.order || "asc",
      search,
      searchProps
    );

    sourceCodes.value = content;
    totalItems.value = meta.totalElements ?? content.length;
    currentPage.value = (meta.page ?? page - 1) + 1;
  } catch (error) {
    sourceCodes.value = [];
    totalItems.value = 0;
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    loadingList.value = false;
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) sourceCodeData.value = null;
});

watch(viewDialog, (newVal: boolean) => {
  if (!newVal) sourceCodeData.value = null;
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) deleteId.value = null;
});

const onCreateEditClick = (data: IntegrationSourceCodeListing | null) => {
  if (!data && !canCreate.value) return;
  if (data && !canUpdate.value) return;

  sourceCodeData.value = data ?? emptyForm();
  dialog.value = true;
};

const onViewClick = (data: IntegrationSourceCodeListing) => {
  if (!can(PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.VIEW)) return;

  sourceCodeData.value = data;
  viewDialog.value = true;
};

const onSubmit = async (data: IntegrationSourceCodeForm, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  if ((!data.id && !canCreate.value) || (data.id && !canUpdate.value)) return;

  try {
    const response = !data.id
      ? await integrationSourceCodeService.createIntegrationSourceCode(data)
      : await integrationSourceCodeService.updateIntegrationSourceCode(data.id, data);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(!data.id ? t("t-toast-message-created") : t("t-toast-message-update"));
    await fetchSourceCodes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (item: IntegrationSourceCodeListing) => {
  if (!can(PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.DELETE) || item.removable === false) return;

  deleteId.value = item.id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!can(PERMISSIONS.SETTINGS.INTEGRATION_SOURCE_CODE.DELETE) || !deleteId.value) return;

  deleteLoading.value = true;

  try {
    await integrationSourceCodeService.deleteIntegrationSourceCode(deleteId.value);
    await fetchSourceCodes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t("t-toast-message-deleted"));
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const onActionSelect = (option: string, item: IntegrationSourceCodeListing) => {
  if (option === "view") onViewClick(item);
  if (option === "edit") onCreateEditClick(item);
  if (option === "delete") onDelete(item);
};

const display = (value?: string | null) => value?.trim() || "-";
</script>

<template>
  <ListingPageShell
    class="source-code-listing-page"
    :title="$t('t-integration-source-codes')"
    subtitle="Consulte, pesquise e faça a gestão dos códigos de origem da aplicação contabilística."
    :action-label="$t('t-add-integration-source-code')"
    :show-action="canCreate"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-integration-source-code')" />
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
      :items="sourceCodes"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-select="false"
      :show-pagination="false"
      @load-items="fetchSourceCodes"
    >
      <template #body="{ items }">
        <tr v-for="item in items as IntegrationSourceCodeListing[]" :key="item.id" class="source-code-listing-table__row">
          <td data-label="Livro origem" class="source-code-listing-table__primary-cell">
            {{ display(item.sourceLedger) }}
          </td>
          <td data-label="Tipo origem">
            {{ display(item.sourceType) }}
          </td>
          <td data-label="Descrição">
            <span class="source-code-listing-table__text" :title="display(item.description)">
              {{ display(item.description) }}
            </span>
          </td>
          <td data-label="Estado">
            <Status :status="item.enabled ? 'enabled' : 'disabled'" />
          </td>
          <td data-label="Acção" class="source-code-listing-table__actions-cell">
            <TableActionMenu
              :menu-items="getActionOptions(item)"
              @onSelect="onActionSelect($event, item)"
            />
          </td>
        </tr>
      </template>

      <template v-if="!sourceCodes.length" #body>
        <tr>
          <td :colspan="listViewHeader.length" class="source-code-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="source-code-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="source-code-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="source-code-listing-table__empty-subtitle mt-1">
              {{ $t("t-integration-source-code-empty-subtitle") }}
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateIntegrationSourceCodeModal
    v-if="dialog && sourceCodeData"
    v-model="dialog"
    :data="sourceCodeData"
    :error="errorMsg"
    @onSubmit="onSubmit"
  />

  <ViewIntegrationSourceCodeModal
    v-if="viewDialog && sourceCodeData"
    v-model="viewDialog"
    :data="sourceCodeData as IntegrationSourceCodeListing"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    :loading="deleteLoading"
    @onConfirm="onConfirmDelete"
  />
</template>

<style scoped>
.source-code-listing-page :deep(.data-table-server-wrapper) {
  --source-code-listing-surface: #ffffff;
  --source-code-listing-surface-strong: #f3f6fa;
  --source-code-listing-surface-hover: #fcfdff;
  --source-code-listing-border: #e8edf3;
  --source-code-listing-border-soft: #eef2f7;
  --source-code-listing-border-strong: #d8e1ec;
  --source-code-listing-text: #334155;
  --source-code-listing-text-strong: #0f172a;
  --source-code-listing-text-muted: #64748b;
  --source-code-listing-shadow-accent: #cbd5e1;
  background: var(--source-code-listing-surface);
  border: 1px solid var(--source-code-listing-border);
  border-radius: 14px;
  overflow: hidden;
}

.source-code-listing-page :deep(.v-table),
.source-code-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.source-code-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.source-code-listing-page :deep(.v-table__wrapper > table) {
  table-layout: fixed;
  width: 100%;
}

.source-code-listing-page :deep(.v-table__wrapper > table > thead),
.source-code-listing-page :deep(.v-data-table thead) {
  background: var(--source-code-listing-surface-strong);
}

.source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.source-code-listing-page :deep(.v-data-table-header th),
.source-code-listing-page :deep(.v-data-table__th) {
  background-color: var(--source-code-listing-surface-strong) !important;
  border-bottom: 1px solid var(--source-code-listing-border-strong);
  color: var(--source-code-listing-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.source-code-listing-page :deep(.v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  line-height: 1.2;
  white-space: normal;
}

.source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.source-code-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid var(--source-code-listing-border-soft);
  color: var(--source-code-listing-text);
  font-size: 0.78rem;
  line-height: 1.35;
  padding: 18px 8px;
  vertical-align: middle;
}

.source-code-listing-page :deep(.v-data-table__tr:hover) {
  background: var(--source-code-listing-surface-hover) !important;
}

.source-code-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--source-code-listing-shadow-accent);
}

.source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(1)),
.source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(1)),
.source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(2)),
.source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(2)) {
  width: 16%;
}

.source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(4)),
.source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(4)) {
  width: 16%;
}

.source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(5)),
.source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(5)) {
  width: 72px;
}

.source-code-listing-table__primary-cell {
  color: var(--source-code-listing-text);
  font-weight: 500;
}

.source-code-listing-table__text {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
}

.source-code-listing-table__actions-cell {
  text-align: center;
  white-space: nowrap;
}

.source-code-listing-page :deep(.source-code-listing-table__actions-cell .d-flex) {
  gap: 6px;
  justify-content: center !important;
  width: 100%;
}

.source-code-listing-table__empty-title {
  color: var(--source-code-listing-text-strong);
  font-size: 0.98rem;
  font-weight: 700;
}

.source-code-listing-table__empty-subtitle {
  color: var(--source-code-listing-text-muted);
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .source-code-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .source-code-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .source-code-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: #ffffff;
    border: 1px solid var(--source-code-listing-border);
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid var(--source-code-listing-border-soft);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100% !important;
  }

  .source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .source-code-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: var(--source-code-listing-text-muted);
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }
}
</style>
