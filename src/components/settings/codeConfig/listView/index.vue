<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import { codeConfigService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import CreateUpdateCodeConfigModal from "@/components/settings/codeConfig/CreateUpdateCodeConfigModal.vue";
import ViewCodeConfigModal from "@/components/settings/codeConfig/ViewCodeConfigModal.vue";
import {
  codeConfigSeparatorOptions,
  codeConfigTypeOptions,
  listViewHeader,
} from "@/components/settings/codeConfig/listView/utils";
import type {
  CodeConfigForm,
  CodeConfigId,
  CodeConfigListing,
  CodeConfigOption,
} from "@/components/settings/codeConfig/types";
import type { OptionType } from "@/app/common/types/option.type";

const { t } = useI18n();
const toast = useToast();

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const codeConfigData = ref<CodeConfigListing | CodeConfigForm | null>(null);
const deleteId = ref<CodeConfigId | null>(null);
const deleteLoading = ref(false);
const searchQuery = ref("");
const searchProps = "type,prefix,separator,suffix,pattern";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedCodeConfigs = ref<any[]>([]);
const errorMsg = ref("");
const codeConfigs = ref<CodeConfigListing[]>([]);
const totalItems = ref(0);
const loadingList = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const actionOptions: OptionType[] = [
  { title: "Ver", value: "view", icon: "ph-eye" },
  { title: "Editar", value: "edit", icon: "ph-pencil-simple" },
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

const fetchCodeConfigs = async ({ page, itemsPerPage, sortBy, search }: CodeConfigOption) => {
  loadingList.value = true;

  try {
    const { content, meta } = await codeConfigService.getCodeConfigs(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "createdAt",
      sortBy[0]?.order || "asc",
      search,
      searchProps
    );

    codeConfigs.value = content;
    totalItems.value = meta.totalElements ?? content.length;
    currentPage.value = (meta.page ?? page - 1) + 1;
  } catch (error) {
    codeConfigs.value = [];
    totalItems.value = 0;
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    loadingList.value = false;
  }
};

const toggleSelection = (item: CodeConfigListing) => {
  const index = selectedCodeConfigs.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedCodeConfigs.value = [...selectedCodeConfigs.value, item];
  } else {
    selectedCodeConfigs.value = selectedCodeConfigs.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    codeConfigData.value = null;
  }
});

watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    codeConfigData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const onCreateEditClick = (data: CodeConfigListing | null) => {
  codeConfigData.value = data ?? {
    id: "-1",
    type: "SERVICE_PROVIDER",
    prefix: "",
    separator: "COMMA",
    suffix: "",
    sequenceLength: 1,
    pattern: "{PREFIX}{SEQ}",
    includesYear: false,
    includesMonth: false,
  };

  dialog.value = true;
};

const onViewClick = (data: CodeConfigListing) => {
  codeConfigData.value = data;
  viewDialog.value = true;
};

const onSubmit = async (data: CodeConfigForm, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    const response = !data.id
      ? await codeConfigService.createCodeConfig(data)
      : await codeConfigService.updateCodeConfig(data.id, data);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(!data.id ? t("t-toast-message-created") : t("t-toast-message-update"));
    await fetchCodeConfigs({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (item: CodeConfigListing) => {
  deleteId.value = item.id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  deleteLoading.value = true;

  try {
    await codeConfigService.deleteCodeConfig(deleteId.value!);
    await fetchCodeConfigs({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t("t-toast-message-deleted"));
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const onActionSelect = (option: string, item: CodeConfigListing) => {
  if (option === "view") onViewClick(item);
  if (option === "edit") onCreateEditClick(item);
  if (option === "delete") onDelete(item);
};

const getTypeLabel = (type: string) => {
  const option = codeConfigTypeOptions.find(option => option.value === type);
  return option ? t(option.label) : type;
};

const getSeparatorLabel = (separator: string) => {
  const option = codeConfigSeparatorOptions.find(option => option.value === separator);
  return option ? t(option.label) : separator;
};

const booleanLabel = (value: boolean) => value ? t("t-yes") : t("t-no");
</script>

<template>
  <ListingPageShell
    class="code-config-listing-page"
    :title="$t('t-contract-code-configs')"
    subtitle="Consulte, pesquise e faca a gestao das configuracoes dos codigos contratuais."
    :action-label="$t('t-add-contract-code-config')"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-contract-code-config')" />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer
      v-model="selectedCodeConfigs"
      v-model:page="currentPage"
      :headers="listViewHeader.map(item => ({ ...item, title: item.title ? $t(`t-${item.title}`) : '' }))"
      :items="codeConfigs"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      show-select
      :show-pagination="false"
      @load-items="fetchCodeConfigs"
    >
      <template #body="{ items }">
        <tr v-for="item in items as CodeConfigListing[]" :key="item.id" class="code-config-listing-table__row">
          <td data-label="" class="code-config-listing-page__select-cell">
            <v-checkbox
              :model-value="selectedCodeConfigs.some(selected => selected.id === item.id)"
              hide-details
              density="compact"
              @update:model-value="toggleSelection(item)"
            />
          </td>
          <td data-label="Tipo" class="code-config-listing-table__primary-cell">
            <span class="code-config-listing-table__text" :title="getTypeLabel(item.type)">
              {{ getTypeLabel(item.type) }}
            </span>
          </td>
          <td data-label="Prefixo">{{ item.prefix || "-" }}</td>
          <td data-label="Separador">{{ item.separator ? getSeparatorLabel(item.separator) : "-" }}</td>
          <td data-label="Sufixo">{{ item.suffix || "-" }}</td>
          <td data-label="Sequencia">{{ item.sequenceLength ?? "-" }}</td>
          <td data-label="Padrao" class="code-config-listing-table__pattern-cell">
            <span class="code-config-listing-table__text" :title="item.pattern">{{ item.pattern || "-" }}</span>
          </td>
          <td data-label="Ano">{{ booleanLabel(item.includesYear) }}</td>
          <td data-label="Mes">{{ booleanLabel(item.includesMonth) }}</td>
          <td data-label="Accao" class="code-config-listing-table__actions-cell">
            <TableActionMenu :menu-items="actionOptions" @onSelect="onActionSelect($event, item)" />
          </td>
        </tr>
      </template>

      <template v-if="!codeConfigs.length" #body>
        <tr>
          <td :colspan="listViewHeader.length + 1" class="code-config-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="code-config-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="code-config-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="code-config-listing-table__empty-subtitle mt-1">
              Ajuste a pesquisa e tente novamente.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateCodeConfigModal
    v-if="codeConfigData"
    v-model="dialog"
    :data="codeConfigData as CodeConfigForm"
    :error="errorMsg"
    @onSubmit="onSubmit"
  />

  <ViewCodeConfigModal
    v-if="codeConfigData"
    v-model="viewDialog"
    :data="codeConfigData as CodeConfigListing"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    :loading="deleteLoading"
    @onConfirm="onConfirmDelete"
  />
</template>

<style scoped>
.code-config-listing-page :deep(.data-table-server-wrapper) {
  --code-config-listing-surface: #ffffff;
  --code-config-listing-surface-strong: #f3f6fa;
  --code-config-listing-surface-hover: #fcfdff;
  --code-config-listing-surface-mobile: #ffffff;
  --code-config-listing-border: #e8edf3;
  --code-config-listing-border-soft: #eef2f7;
  --code-config-listing-border-strong: #d8e1ec;
  --code-config-listing-text: #334155;
  --code-config-listing-text-strong: #0f172a;
  --code-config-listing-text-muted: #64748b;
  --code-config-listing-shadow-accent: #cbd5e1;
  --code-config-listing-mobile-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  background: var(--code-config-listing-surface);
  border: 1px solid var(--code-config-listing-border);
  border-radius: 14px;
  overflow: hidden;
}

.code-config-listing-page :deep(.v-table),
.code-config-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.code-config-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead),
.code-config-listing-page :deep(.v-data-table thead) {
  background: var(--code-config-listing-surface-strong);
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.code-config-listing-page :deep(.v-data-table-header th),
.code-config-listing-page :deep(.v-data-table__th) {
  background-color: var(--code-config-listing-surface-strong) !important;
  border-bottom: 1px solid var(--code-config-listing-border-strong);
  color: var(--code-config-listing-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.code-config-listing-page :deep(.v-table__wrapper > table) {
  table-layout: fixed;
  width: 100%;
}

.code-config-listing-page :deep(.v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  line-height: 1.2;
  white-space: normal;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.code-config-listing-page :deep(.v-data-table-header th:last-child),
.code-config-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.code-config-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.code-config-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.code-config-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid var(--code-config-listing-border-soft);
  color: var(--code-config-listing-text);
  font-size: 0.78rem;
  line-height: 1.35;
  padding: 18px 8px;
  vertical-align: middle;
}

.code-config-listing-page :deep(.v-data-table__tr:hover) {
  background: var(--code-config-listing-surface-hover) !important;
}

.code-config-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--code-config-listing-shadow-accent);
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(1)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(1)) {
  width: 48px;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(2)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(2)) {
  width: 15%;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(3)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(3)),
.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(4)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(4)),
.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(5)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(5)) {
  width: 9%;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(6)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(6)) {
  width: 10%;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(7)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(7)) {
  width: 18%;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(8)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(8)),
.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(9)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(9)) {
  width: 7%;
}

.code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(10)),
.code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(10)) {
  width: 72px;
}

.code-config-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.code-config-listing-table__primary-cell,
.code-config-listing-table__pattern-cell {
  color: var(--code-config-listing-text);
  font-weight: 500;
  line-height: 1.45;
}

.code-config-listing-table__text {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
}

.code-config-listing-table__actions-cell {
  text-align: center;
  white-space: nowrap;
}

.code-config-listing-page :deep(.code-config-listing-table__actions-cell .d-flex) {
  gap: 6px;
  justify-content: center !important;
  width: 100%;
}

.code-config-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.code-config-listing-table__empty-avatar {
  border: 1px solid var(--code-config-listing-border);
}

.code-config-listing-table__empty-title {
  color: var(--code-config-listing-text-strong);
  font-size: 0.98rem;
  font-weight: 700;
}

.code-config-listing-table__empty-subtitle {
  color: var(--code-config-listing-text-muted);
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .code-config-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .code-config-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: var(--code-config-listing-surface-mobile);
    border: 1px solid var(--code-config-listing-border);
    border-radius: 14px;
    box-shadow: var(--code-config-listing-mobile-shadow);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid var(--code-config-listing-border-soft);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: var(--code-config-listing-text-muted);
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .code-config-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .code-config-listing-table__actions-cell {
    display: block !important;
  }
}
</style>
