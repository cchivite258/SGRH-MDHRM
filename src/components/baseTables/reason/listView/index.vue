<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import Status from "@/app/common/components/Status.vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import CreateUpdateReasonModal from "@/components/baseTables/reason/CreateUpdateReasonModal.vue";
import ViewReasonModal from "@/components/baseTables/reason/ViewReasonModal.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { reasonService } from "@/app/http/httpServiceProvider";
import { useReasonStore } from "@/store/baseTables/reasonStore";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import type { ReasonListing, ReasonOption, ReasonType } from "@/components/baseTables/reason/types";
import { listViewHeader, reasonTypeOptions } from "@/components/baseTables/reason/listView/utils";

const { t } = useI18n();
const toast = useToast();
const reasonStore = useReasonStore();

const dialog = ref(false);
const viewDialog = ref(false);
const reasonData = ref<ReasonListing | null>(null);
const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const searchQuery = ref("");
const searchProps = "name,type,description";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedReasons = ref<ReasonListing[]>([]);
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const loadingList = computed(() => reasonStore.loading);
const totalItems = computed(() => reasonStore.pagination.totalElements);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const defaultReason = (): ReasonListing => ({
  id: "-1",
  name: "",
  type: "INVOICE_POSTING_FLAGGED",
  description: "",
  enabled: true,
});

const getReasonTypeLabel = (type: ReasonType) => {
  const option = reasonTypeOptions.find(item => item.value === type);
  return option ? t(option.label) : type;
};

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
  if (alertTimeout) clearTimeout(alertTimeout);
});

watch(selectedReasons, newSelection => {
  console.log("Razoes selecionadas:", newSelection);
}, { deep: true });

const fetchReasons = async ({ page, itemsPerPage, sortBy, search }: ReasonOption) => {
  await reasonStore.fetchReasons(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
};

const toggleSelection = (item: ReasonListing) => {
  const index = selectedReasons.value.findIndex(selected => selected.id === item.id);
  if (index === -1) selectedReasons.value = [...selectedReasons.value, item];
  else selectedReasons.value = selectedReasons.value.filter(selected => selected.id !== item.id);
};

watch(dialog, newVal => {
  if (!newVal) reasonData.value = null;
});

const onCreateEditClick = (data: ReasonListing | null) => {
  reasonData.value = data || defaultReason();
  dialog.value = true;
};

const onSubmit = async (data: ReasonListing, callbacks?: { onSuccess?: () => void; onFinally?: () => void }) => {
  try {
    if (!data.id) {
      await reasonService.createReason(data);
      toast.success(t("t-toast-message-created"));
    } else {
      await reasonService.updateReason(data.id, data);
      toast.success(t("t-toast-message-update"));
    }
    await fetchReasons({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

watch(viewDialog, newVal => {
  if (!newVal) reasonData.value = null;
});

const onViewClick = (data: ReasonListing | null) => {
  reasonData.value = data || defaultReason();
  viewDialog.value = true;
};

watch(deleteDialog, newVal => {
  if (!newVal) deleteId.value = null;
});

const onDelete = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  deleteLoading.value = true;
  try {
    await reasonService.deleteReason(deleteId.value!);
    await fetchReasons({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
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
    class="base-table-listing-page"
    :title="$t('t-reasons-list')"
    subtitle="Consulte, pesquise e faça a gestão das razões registadas."
    :action-label="$t('t-add-reason')"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-reason')" />
    </template>
    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>
    <DataTableServer
      v-model="selectedReasons"
      v-model:page="currentPage"
      :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="reasonStore.reasons"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      @load-items="fetchReasons"
    >
      <template #body="{ items }">
        <tr v-for="item in items as ReasonListing[]" :key="item.id" class="base-table-listing-page__row">
          <td data-label="">
            <v-checkbox
              :model-value="selectedReasons.some(selected => selected.id === item.id)"
              @update:model-value="toggleSelection(item)"
              hide-details
              density="compact"
            />
          </td>
          <td data-label="Nome" class="base-table-listing-page__primary-cell">{{ item.name }}</td>
          <td data-label="Tipo">{{ getReasonTypeLabel(item.type) }}</td>
          <td data-label="Descrição">{{ item.description }}</td>
          <td data-label="Disponibilidade"><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
          <td data-label="Acção" class="base-table-listing-page__actions-cell">
            <TableActionMenu @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)" @onDelete="onDelete(item.id)" />
          </td>
        </tr>
      </template>
      <template v-if="!reasonStore.reasons.length" #body>
        <tr>
          <td :colspan="listViewHeader.length + 1" class="base-table-listing-page__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="base-table-listing-page__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="base-table-listing-page__empty-title mt-3">{{ $t("t-search-not-found-message") }}</div>
            <div class="base-table-listing-page__empty-subtitle mt-1">Ajuste a pesquisa e tente novamente.</div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateReasonModal v-if="reasonData" v-model="dialog" :data="reasonData" :error="errorMsg" @onSubmit="onSubmit" />
  <ViewReasonModal v-if="reasonData" v-model="viewDialog" :data="reasonData" />
  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete" :loading="deleteLoading" />
</template>

<style scoped>
.base-table-listing-page :deep(.data-table-server-wrapper) { background:#fff; border:1px solid #e8edf3; border-radius:14px; overflow:hidden; }
.base-table-listing-page :deep(.v-table), .base-table-listing-page :deep(.v-data-table) { border-radius:14px; }
.base-table-listing-page :deep(.v-table__wrapper) { overflow-x:hidden !important; }
.base-table-listing-page :deep(.v-table__wrapper > table > thead), .base-table-listing-page :deep(.v-data-table thead) { background:#f3f6fa; }
.base-table-listing-page :deep(.v-table__wrapper > table > thead > tr > th), .base-table-listing-page :deep(.v-data-table-header th), .base-table-listing-page :deep(.v-data-table__th) { background-color:#f3f6fa !important; border-bottom:1px solid #d8e1ec; color:#334155; font-size:.7rem; font-weight:700; padding-top:10px; padding-bottom:10px; text-transform:none; }
.base-table-listing-page :deep(.v-data-table__tr td) { border-bottom:1px solid #eef2f7; color:#334155; font-size:.8rem; padding-top:18px; padding-bottom:18px; vertical-align:middle; }
.base-table-listing-page__primary-cell { color:#334155; font-weight:500; }
.base-table-listing-page__actions-cell { text-align:center; white-space:nowrap; }
.base-table-listing-page :deep(.base-table-listing-page__actions-cell .d-flex) { gap:6px; justify-content:center !important; width:100%; }
.base-table-listing-page :deep(.base-table-listing-page__actions-cell .v-btn) { border:1px solid rgba(148,163,184,.15); box-shadow:none; }
.base-table-listing-page__empty-avatar { border:1px solid #e2e8f0; }
.base-table-listing-page__empty-title { color:#0f172a; font-size:.98rem; font-weight:700; }
.base-table-listing-page__empty-subtitle { color:#64748b; font-size:.82rem; }
</style>
