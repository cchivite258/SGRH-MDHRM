<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import Status from "@/app/common/components/Status.vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import CreatePaymentOrderPeriodModal from "@/components/paymentOrderPeriod/CreatePaymentOrderPeriodModal.vue";
import BatchHistoryDialog from "@/components/paymentOrderPeriod/shared/BatchHistoryDialog.vue";
import BatchConfirmationDialog from "@/components/paymentOrderPeriod/shared/BatchConfirmationDialog.vue";
import RejectBatchDialog from "@/components/paymentOrderPeriod/shared/RejectBatchDialog.vue";
import UnprocessBatchDialog from "@/components/paymentOrderPeriod/shared/UnprocessBatchDialog.vue";
import { useApiRecordErrors } from "@/composables/useApiRecordErrors";
import ApiRecordErrorsDialog from "@/app/common/components/ApiRecordErrorsDialog.vue";
import {
  contractLabel,
  formatIsoDate,
  formatMonthYear,
  listActionsByStatusFor,
  listViewHeader,
  sectionSubtitleKey,
  sectionTitleKey,
  statusChipValue,
  statusChipVariant,
  statusLabelKey,
  type ProcessSection,
} from "@/components/paymentOrderPeriod/listView/utils";
import { periodServiceFor } from "@/components/paymentOrderPeriod/shared/sectionApi";
import {
  confirmationActionFor,
  runWorkflowAction,
  sectionPeriodPermissions,
  workflowPermissionsFor,
  workflowSuccessKey,
} from "@/components/paymentOrderPeriod/shared/workflow";
import type {
  RefundDeductionReopenPayload,
  RefundDeductionUnprocessPayload,
} from "@/app/http/services/amm/refundDeductionPeriodService";
import type {
  BatchConfirmationAction,
  PaymentOrderPeriodForm,
  PaymentOrderPeriodId,
  PaymentOrderPeriodListing,
  PaymentOrderPeriodOption,
  PaymentOrderPeriodStatus,
  PaymentOrderWorkflowAction,
} from "@/components/paymentOrderPeriod/types";
import type { OptionType } from "@/app/common/types/option.type";
import { usePermissions } from "@/composables/usePermissions";
import type { PermissionRequirement } from "@/app/permissions/constants";

const props = withDefaults(defineProps<{
  section?: ProcessSection;
}>(), {
  section: "refunds-and-deductions",
});

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const { can, canAny } = usePermissions();

const dialog = ref(false);
const deleteDialog = ref(false);
const deleteId = ref<PaymentOrderPeriodId | null>(null);
const deleteLoading = ref(false);
const searchQuery = ref("");
const searchProps = "notes,status,contract.name";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const errorMsg = ref("");
const periods = ref<PaymentOrderPeriodListing[]>([]);
const totalItems = ref(0);
const loadingList = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const periodPermissions = computed(() => sectionPeriodPermissions(props.section));
const canCreate = computed(() => can(periodPermissions.value.CREATE));
const isErpSection = computed(() => props.section === "erp-integration");
const pageTitle = computed(() => t(`t-${sectionTitleKey(props.section)}`));
const pageSubtitle = computed(() => t(sectionSubtitleKey(props.section)));
const tableHeaders = computed(() => {
  const headers = [...listViewHeader];
  if (!isErpSection.value) return headers;

  headers.splice(headers.length - 1, 0, {
    title: "payment-order-external-batch-number",
    key: "externalBatchNumber",
    sortable: false,
  });
  return headers;
});

const actionOptions = computed<OptionType[]>(() => [
  { title: t("t-view"), value: "view", icon: "ph-eye" },
  { title: t("t-payment-order-history"), value: "history", icon: "ph-clock-counter-clockwise" },
  { title: t("t-payment-order-generate-lines"), value: "generate", icon: "ph-rows" },
  { title: t("t-payment-order-submit-batch"), value: "submit", icon: "ph-paper-plane-tilt" },
  { title: t("t-settle-payment-order-batch"), value: "settle", icon: "ph-coins" },
  { title: t("t-payment-order-reopen-batch"), value: "reopen", icon: "ph-x-circle" },
  { title: t("t-payment-order-unprocess-batch"), value: "unprocess", icon: "ph-arrow-u-up-left" },
  { title: t("t-delete"), value: "delete", icon: "ph-trash" },
]);

const settleAccessPermissions = computed<PermissionRequirement>(() => [
  periodPermissions.value.SETTLE,
  periodPermissions.value.PROCESS,
  periodPermissions.value.VIEW,
]);

const actionPermissionByValue = computed<Record<string, PermissionRequirement>>(() => ({
  view: periodPermissions.value.VIEW,
  history: periodPermissions.value.VIEW,
  generate: periodPermissions.value.GENERATE,
  submit: periodPermissions.value.SUBMIT,
  settle: settleAccessPermissions.value,
  reopen: periodPermissions.value.REOPEN,
  unprocess: workflowPermissionsFor(props.section).unprocess,
  delete: periodPermissions.value.DELETE,
}));

const getActionOptions = (item: PaymentOrderPeriodListing) => {
  const allowed = listActionsByStatusFor(props.section)[item.status] ?? ["view"];

  return actionOptions.value
    .filter(option => {
      if (!allowed.includes(option.value)) return false;
      if (!canAny(actionPermissionByValue.value[option.value])) return false;
      if (option.value === "delete" && item.removable === false) return false;
      return true;
    })
    .map(option => {
      if (option.value === "generate" && item.status === "GENERATED") {
        return {
          ...option,
          title: t("t-payment-order-regenerate-lines"),
          icon: "ph-arrows-clockwise",
        };
      }
      return option;
    });
};

const statusLabel = (status?: PaymentOrderPeriodStatus | null) => (status ? t(statusLabelKey(status)) : "-");

const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  errorMsg.value = getApiErrorMessages(error, t("t-message-save-error"))[0] || t("t-message-save-error");
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

onBeforeUnmount(() => {
  if (alertTimeout) clearTimeout(alertTimeout);
});

const fetchPeriods = async ({ page, itemsPerPage, sortBy, search }: PaymentOrderPeriodOption) => {
  loadingList.value = true;

  try {
    const { content, meta } = await periodServiceFor(props.section).getPaymentOrderPeriods(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "createdAt",
      sortBy[0]?.order || "desc",
      search,
      searchProps
    );

    periods.value = content;
    totalItems.value = meta.totalElements ?? content.length;
    currentPage.value = (meta.page ?? page - 1) + 1;
  } catch (error) {
    periods.value = [];
    totalItems.value = 0;
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    loadingList.value = false;
  }
};

watch(dialog, (open) => {
  if (!open) errorMsg.value = "";
});

watch(deleteDialog, (open) => {
  if (!open) deleteId.value = null;
});

const onCreateClick = () => {
  if (!canCreate.value) return;
  dialog.value = true;
};

const periodRoute = (name: string, item: PaymentOrderPeriodListing) => ({
  name,
  params: { id: item.id },
  query: { section: props.section },
});

const onViewClick = (item: PaymentOrderPeriodListing) => {
  if (!can(periodPermissions.value.VIEW)) return;
  router.push(periodRoute("PaymentOrderPeriodView", item));
};

const onSettleClick = (item: PaymentOrderPeriodListing) => {
  if (!canAny(settleAccessPermissions.value)) return;
  router.push(periodRoute("PaymentOrderPeriodSettle", item));
};

const onSubmit = async (data: PaymentOrderPeriodForm, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  if (!canCreate.value) return;

  try {
    const response = await periodServiceFor(props.section).createPaymentOrderPeriod(data);
    if (response.status === "error") throw response.error;

    toast.success(t("t-toast-message-created"));
    await fetchPeriods({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (item: PaymentOrderPeriodListing) => {
  if (!can(periodPermissions.value.DELETE) || item.removable === false) return;
  deleteId.value = item.id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;

  try {
    await periodServiceFor(props.section).deletePaymentOrderPeriod(deleteId.value);
    await fetchPeriods({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });
    toast.success(t("t-toast-message-deleted"));
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const historyDialog = ref(false);
const historyPeriodId = ref<PaymentOrderPeriodId | null>(null);
const reopenDialog = ref(false);
const reopenPeriodId = ref<PaymentOrderPeriodId | null>(null);
const reopenLoading = ref(false);
const unprocessDialog = ref(false);
const unprocessPeriodId = ref<PaymentOrderPeriodId | null>(null);
const unprocessLoading = ref(false);
const workflowDialog = ref(false);
const workflowLoading = ref(false);
const pendingWorkflowAction = ref<"generate" | "submit" | null>(null);
const pendingWorkflowPeriod = ref<PaymentOrderPeriodListing | null>(null);
const { recordErrorsDialog, recordErrors, recordErrorsMessage, showRecordErrors } = useApiRecordErrors();

const refreshList = () =>
  fetchPeriods({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
    search: searchQuery.value,
  });

const pendingWorkflowDialogAction = computed<BatchConfirmationAction>(() => {
  if (pendingWorkflowAction.value === "generate" && pendingWorkflowPeriod.value?.status === "GENERATED") {
    return "regenerate";
  }
  return confirmationActionFor((pendingWorkflowAction.value ?? "submit") as PaymentOrderWorkflowAction);
});

const onHistoryClick = (item: PaymentOrderPeriodListing) => {
  if (!can(periodPermissions.value.VIEW)) return;
  historyPeriodId.value = item.id;
  historyDialog.value = true;
};

const onReopenClick = (item: PaymentOrderPeriodListing) => {
  if (item.status !== "SUBMITTED" || !can(periodPermissions.value.REOPEN)) return;
  reopenPeriodId.value = item.id;
  reopenDialog.value = true;
};

const onConfirmReopen = async (payload: RefundDeductionReopenPayload) => {
  if (!reopenPeriodId.value) return;

  reopenLoading.value = true;
  try {
    const response = await runWorkflowAction(reopenPeriodId.value, "reopen", props.section, payload);
    if (response.status === "error") throw response.error;
    toast.success(t(workflowSuccessKey("reopen", props.section)));
    reopenDialog.value = false;
    reopenPeriodId.value = null;
    await refreshList();
  } catch (error) {
    if (showRecordErrors(error)) {
      reopenDialog.value = false;
    } else {
      getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    }
  } finally {
    reopenLoading.value = false;
  }
};

const onUnprocessClick = (item: PaymentOrderPeriodListing) => {
  if (item.status !== "PROCESSED" || !canAny(workflowPermissionsFor(props.section).unprocess)) return;
  unprocessPeriodId.value = item.id;
  unprocessDialog.value = true;
};

const onConfirmUnprocess = async (payload: RefundDeductionUnprocessPayload) => {
  if (!unprocessPeriodId.value) return;

  unprocessLoading.value = true;
  try {
    const response = await runWorkflowAction(unprocessPeriodId.value, "unprocess", props.section, payload);
    if (response.status === "error") throw response.error;
    toast.success(t(workflowSuccessKey("unprocess", props.section)));
    unprocessDialog.value = false;
    unprocessPeriodId.value = null;
    await refreshList();
  } catch (error) {
    if (showRecordErrors(error)) {
      unprocessDialog.value = false;
    } else {
      getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    }
  } finally {
    unprocessLoading.value = false;
  }
};

const askListWorkflowAction = (action: "generate" | "submit", item: PaymentOrderPeriodListing) => {
  if (action === "generate" && !can(periodPermissions.value.GENERATE)) return;
  if (action === "submit" && !can(periodPermissions.value.SUBMIT)) return;
  if (action === "generate" && item.status !== "OPEN" && item.status !== "GENERATED") return;
  if (action === "submit" && item.status !== "GENERATED") return;

  pendingWorkflowAction.value = action;
  pendingWorkflowPeriod.value = item;
  workflowDialog.value = true;
};

const onConfirmListWorkflow = async () => {
  const action = pendingWorkflowAction.value;
  const item = pendingWorkflowPeriod.value;
  if (!action || !item) return;

  workflowLoading.value = true;
  try {
    const response = await runWorkflowAction(item.id, action, props.section);
    if (response.status === "error") throw response.error;
    toast.success(t(workflowSuccessKey(action, props.section)));
    workflowDialog.value = false;
    pendingWorkflowAction.value = null;
    pendingWorkflowPeriod.value = null;
    await refreshList();
  } catch (error) {
    if (showRecordErrors(error)) {
      workflowDialog.value = false;
    } else {
      getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    }
  } finally {
    workflowLoading.value = false;
  }
};

const onActionSelect = (option: string, item: PaymentOrderPeriodListing) => {
  if (option === "view") onViewClick(item);
  if (option === "history") onHistoryClick(item);
  if (option === "generate") askListWorkflowAction("generate", item);
  if (option === "submit") askListWorkflowAction("submit", item);
  if (option === "settle") onSettleClick(item);
  if (option === "reopen") onReopenClick(item);
  if (option === "unprocess") onUnprocessClick(item);
  if (option === "delete") onDelete(item);
};
</script>

<template>
  <ListingPageShell
    class="payment-order-period-listing-page"
    :class="{ 'payment-order-period-listing-page--erp': isErpSection }"
    :title="pageTitle"
    :subtitle="pageSubtitle"
    :action-label="$t('t-add-payment-order-batch')"
    :show-action="canCreate"
    :action-permission="periodPermissions.CREATE"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateClick"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-payment-order-batch')" />
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
      :headers="tableHeaders.map(item => ({ ...item, title: item.title ? $t(`t-${item.title}`) : '' }))"
      :items="periods"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-select="false"
      :show-pagination="false"
      @load-items="fetchPeriods"
    >
      <template #body="{ items }">
        <tr v-for="item in items as PaymentOrderPeriodListing[]" :key="item.id">
          <td data-label="Contrato" class="payment-order-period-listing-table__primary-cell">
            <span class="payment-order-period-listing-table__text" :title="contractLabel(item)">
              {{ contractLabel(item) }}
            </span>
          </td>
          <td data-label="Período">{{ formatMonthYear(item.month, item.year) }}</td>
          <td data-label="Início">{{ formatIsoDate(item.startDate) }}</td>
          <td data-label="Fim">{{ formatIsoDate(item.endDate) }}</td>
          <td data-label="Estado">
            <Status
              :status="statusChipValue(item.status)"
              :variant="statusChipVariant(item.status)"
              :label="statusLabel(item.status)"
            />
          </td>
          <td v-if="isErpSection" data-label="Lote externo">
            {{ item.externalBatchNumber || "-" }}
          </td>
          <td data-label="Acção" class="payment-order-period-listing-table__actions-cell">
            <TableActionMenu
              :menu-items="getActionOptions(item)"
              :permission-by-value="actionPermissionByValue"
              @onSelect="onActionSelect($event, item)"
            />
          </td>
        </tr>
      </template>

      <template v-if="!periods.length" #body>
        <tr>
          <td :colspan="tableHeaders.length" class="text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="mt-3 font-weight-bold">{{ $t("t-search-not-found-message") }}</div>
            <div class="mt-1 text-medium-emphasis">{{ $t("t-payment-order-batch-empty-subtitle") }}</div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreatePaymentOrderPeriodModal
    v-if="dialog"
    v-model="dialog"
    :error="errorMsg"
    @onSubmit="onSubmit"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    :loading="deleteLoading"
    @onConfirm="onConfirmDelete"
  />

  <BatchHistoryDialog
    v-model="historyDialog"
    :period-id="historyPeriodId"
    :section="section"
  />

  <RejectBatchDialog
    v-model="reopenDialog"
    :loading="reopenLoading"
    @onConfirm="onConfirmReopen"
  />

  <UnprocessBatchDialog
    v-model="unprocessDialog"
    :loading="unprocessLoading"
    @onConfirm="onConfirmUnprocess"
  />

  <BatchConfirmationDialog
    v-if="pendingWorkflowAction"
    v-model="workflowDialog"
    :action="pendingWorkflowDialogAction"
    :loading="workflowLoading"
    @onConfirm="onConfirmListWorkflow"
  />

  <ApiRecordErrorsDialog
    v-model="recordErrorsDialog"
    :records="recordErrors"
    :message="recordErrorsMessage"
  />
</template>

<style scoped>
.payment-order-period-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.payment-order-period-listing-page :deep(.v-table__wrapper > table) {
  table-layout: fixed;
  width: 100%;
}

.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead) {
  background: #f3f6fa;
}

.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead > tr > th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: none;
}

.payment-order-period-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 0.78rem;
  padding: 18px 8px;
  vertical-align: middle;
}

.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(1)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(1)) {
  width: 24%;
}

.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(2)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(2)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(3)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(3)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(4)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(4)) {
  width: 16%;
}

.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(5)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(5)) {
  width: 14%;
}

.payment-order-period-listing-page :deep(.v-table__wrapper > table > thead > tr > th:nth-child(6)),
.payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(6)) {
  width: 72px;
}

.payment-order-period-listing-page--erp :deep(.v-table__wrapper > table > thead > tr > th:nth-child(6)),
.payment-order-period-listing-page--erp :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(6)) {
  width: 18%;
}

.payment-order-period-listing-page--erp :deep(.v-table__wrapper > table > thead > tr > th:nth-child(7)),
.payment-order-period-listing-page--erp :deep(.v-table__wrapper > table > tbody > tr > td:nth-child(7)) {
  width: 72px;
}

.payment-order-period-listing-table__text {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
}

.payment-order-period-listing-table__actions-cell {
  text-align: center;
}

.payment-order-period-listing-page :deep(.payment-order-period-listing-table__actions-cell .d-flex) {
  justify-content: center !important;
  width: 100%;
}

@media (max-width: 767px) {
  .payment-order-period-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    border: 1px solid #e8edf3;
    border-radius: 14px;
    display: block;
    margin-bottom: 12px;
    padding: 12px;
  }

  .payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    width: 100% !important;
  }

  .payment-order-period-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: #64748b;
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
  }
}
</style>
