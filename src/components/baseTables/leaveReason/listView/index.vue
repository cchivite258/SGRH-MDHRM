<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateLeaveReasonModal from "@/components/baseTables/leaveReason/CreateUpdateLeaveReasonModal.vue";
import ViewLeaveReasonModal from "@/components/baseTables/leaveReason/ViewLeaveReasonModal.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { leaveReasonService } from "@/app/http/httpServiceProvider";
import { useLeaveReasonStore } from "@/store/baseTables/LeaveReasonStore";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { LeaveReasonListing, LeaveReasonOption } from "@/components/baseTables/leaveReason/types";
import { listViewHeader } from "@/components/baseTables/leaveReason/listView/utils";

const { t } = useI18n();
const toast = useToast();
const leaveReasonStore = useLeaveReasonStore();

const dialog = ref(false);
const viewDialog = ref(false);
const leaveReasonData = ref<LeaveReasonListing | null>(null);
const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const searchQuery = ref("");
const searchProps = "name,description";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedLeaveReasons = ref<any[]>([]);
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const loadingList = computed(() => leaveReasonStore.loading);
const totalItems = computed(() => leaveReasonStore.pagination.totalElements);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const handleApiError = (error: any) => {
  if (alertTimeout) { clearTimeout(alertTimeout); alertTimeout = null; }
  const message = getApiErrorMessages(error, t("t-message-save-error"))[0] || t("t-message-save-error");
  errorMsg.value = message;
  alertTimeout = setTimeout(() => { errorMsg.value = ""; alertTimeout = null; }, 5000);
};

onBeforeUnmount(() => { if (alertTimeout) clearTimeout(alertTimeout); });

watch(selectedLeaveReasons, newSelection => { console.log("Motivos de saída selecionados:", newSelection); }, { deep: true });

const fetchLeaveReasons = async ({ page, itemsPerPage, sortBy, search }: LeaveReasonOption) => {
  await leaveReasonStore.fetchLeaveReasons(page - 1, itemsPerPage, sortBy[0]?.key || "name", sortBy[0]?.order || "asc", search, searchProps);
};

const toggleSelection = (item: LeaveReasonListing) => {
  const index = selectedLeaveReasons.value.findIndex(selected => selected.id === item.id);
  if (index === -1) selectedLeaveReasons.value = [...selectedLeaveReasons.value, item];
  else selectedLeaveReasons.value = selectedLeaveReasons.value.filter(selected => selected.id !== item.id);
};

watch(dialog, newVal => { if (!newVal) leaveReasonData.value = null; });

const onCreateEditClick = (data: LeaveReasonListing | null) => {
  leaveReasonData.value = data || { id: "-1", name: "", description: "", enabled: true };
  dialog.value = true;
};

const onSubmit = async (data: LeaveReasonListing, callbacks?: { onSuccess?: () => void, onFinally?: () => void }) => {
  try {
    if (!data.id) { await leaveReasonService.createLeaveReason(data); toast.success(t('t-toast-message-created')); }
    else { await leaveReasonService.updateLeaveReason(data.id, data); toast.success(t('t-toast-message-update')); }
    await fetchLeaveReasons({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t('t-message-save-error')).forEach(message => toast.error(message));
    handleApiError(error);
  } finally { callbacks?.onFinally?.(); }
};

watch(viewDialog, newVal => { if (!newVal) leaveReasonData.value = null; });

const onViewClick = (data: LeaveReasonListing | null) => {
  leaveReasonData.value = data || { id: "-1", name: "", description: "", enabled: true };
  viewDialog.value = true;
};

watch(deleteDialog, newVal => { if (!newVal) deleteId.value = null; });
const onDelete = (id: string) => { deleteId.value = id; deleteDialog.value = true; };

const onConfirmDelete = async () => {
  deleteLoading.value = true;
  try {
    await leaveReasonService.deleteLeaveReason(deleteId.value!);
    await fetchLeaveReasons({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    getApiErrorMessages(error, t('t-toast-message-deleted-erros')).forEach(message => toast.error(message));
    handleApiError(error);
  } finally { deleteLoading.value = false; deleteDialog.value = false; }
};
</script>

<template>
  <ListingPageShell class="base-table-listing-page" :title="$t('t-leave-reason-list')"
    subtitle="Consulte, pesquise e faça a gestão dos motivos de saída registados."
    :action-label="$t('t-add-leave-reason')" :page="currentPage" :items-per-page="itemsPerPage"
    :total-items="totalItems" :total-pages="totalPages" @update:page="currentPage = $event"
    @action="onCreateEditClick(null)">
    <template #filters><ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-leave-reason')" /></template>
    <template #pagination-summary>{{ $t("t-showing") }} <b>{{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b> {{ $t("t-of") }} <b>{{ totalItems }}</b> {{ $t("t-results") }}</template>
    <DataTableServer v-model="selectedLeaveReasons" v-model:page="currentPage"
      :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="leaveReasonStore.leave_reason" :items-per-page="itemsPerPage" :total-items="totalItems"
      :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" item-value="id"
      :show-pagination="false" @load-items="fetchLeaveReasons">
      <template #body="{ items }">
        <tr v-for="item in items as LeaveReasonListing[]" :key="item.id" class="base-table-listing-page__row">
          <td data-label=""><v-checkbox :model-value="selectedLeaveReasons.some(selected => selected.id === item.id)" @update:model-value="toggleSelection(item)" hide-details density="compact" /></td>
          <td data-label="Motivo" class="base-table-listing-page__primary-cell">{{ item.name }}</td>
          <td data-label="Descrição">{{ item.description }}</td>
          <td data-label="Disponibilidade"><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
          <td data-label="Acção" class="base-table-listing-page__actions-cell"><TableAction @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)" @onDelete="onDelete(item.id)" /></td>
        </tr>
      </template>
      <template v-if="!leaveReasonStore.leave_reason.length" #body>
        <tr><td :colspan="listViewHeader.length + 1" class="base-table-listing-page__empty-state text-center py-10">
          <v-avatar size="72" color="secondary" variant="tonal" class="base-table-listing-page__empty-avatar"><i class="ph-magnifying-glass" style="font-size: 30px" /></v-avatar>
          <div class="base-table-listing-page__empty-title mt-3">{{ $t('t-search-not-found-message') }}</div>
          <div class="base-table-listing-page__empty-subtitle mt-1">Ajuste a pesquisa e tente novamente.</div>
        </td></tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateLeaveReasonModal v-if="leaveReasonData" v-model="dialog" :data="leaveReasonData" :error="errorMsg" @onSubmit="onSubmit" />
  <ViewLeaveReasonModal v-if="leaveReasonData" v-model="viewDialog" :data="leaveReasonData" />
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
.base-table-listing-page__actions-cell { white-space:nowrap; }
.base-table-listing-page :deep(.base-table-listing-page__actions-cell .d-flex) { gap:6px; }
.base-table-listing-page :deep(.base-table-listing-page__actions-cell .v-btn) { border:1px solid rgba(148,163,184,.15); box-shadow:none; }
.base-table-listing-page__empty-avatar { border:1px solid #e2e8f0; }
.base-table-listing-page__empty-title { color:#0f172a; font-size:.98rem; font-weight:700; }
.base-table-listing-page__empty-subtitle { color:#64748b; font-size:.82rem; }
</style>
