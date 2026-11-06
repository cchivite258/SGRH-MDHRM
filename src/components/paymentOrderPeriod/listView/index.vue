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
import { paymentOrderPeriodService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import CreatePaymentOrderPeriodModal from "@/components/paymentOrderPeriod/CreatePaymentOrderPeriodModal.vue";
import BatchConfirmationDialog from "@/components/paymentOrderPeriod/shared/BatchConfirmationDialog.vue";
import {
  actionsByStatus,
  contractLabel,
  formatIsoDate,
  formatMonthYear,
  listViewHeader,
  statusChipValue,
  statusLabelKey,
} from "@/components/paymentOrderPeriod/listView/utils";
import type {
  BatchConfirmationAction,
  PaymentOrderPeriodForm,
  PaymentOrderPeriodId,
  PaymentOrderPeriodListing,
  PaymentOrderPeriodOption,
  PaymentOrderPeriodStatus,
} from "@/components/paymentOrderPeriod/types";
import type { OptionType } from "@/app/common/types/option.type";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import type { PermissionRequirement } from "@/app/permissions/constants";

type WorkflowAction = "generate" | "close" | "reopen" | "post";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const { can, canAny } = usePermissions();

const dialog = ref(false);
const deleteDialog = ref(false);
const actionDialog = ref(false);
const deleteId = ref<PaymentOrderPeriodId | null>(null);
const pendingAction = ref<WorkflowAction | null>(null);
const pendingActionId = ref<PaymentOrderPeriodId | null>(null);
const pendingActionStatus = ref<PaymentOrderPeriodStatus | null>(null);
const actionLoading = ref(false);
const deleteLoading = ref(false);
const rowLoadingId = ref<PaymentOrderPeriodId | null>(null);
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
const canCreate = computed(() => can(PERMISSIONS.PAYMENT_ORDER_PERIODS.CREATE));

const actionOptions: OptionType[] = [
  { title: "Consultar", value: "view", icon: "ph-eye" },
  { title: "Regularizar", value: "settle", icon: "ph-coins" },
  { title: "Gerar Lançamentos", value: "generate", icon: "ph-rows" },
  { title: "Fechar", value: "close", icon: "ph-lock" },
  { title: "Reabrir", value: "reopen", icon: "ph-lock-open" },
  { title: "Lançar", value: "post", icon: "ph-check-circle" },
  { title: "Eliminar", value: "delete", icon: "ph-trash" },
];

const actionPermissionByValue: Record<string, PermissionRequirement> = {
  view: PERMISSIONS.PAYMENT_ORDER_PERIODS.VIEW,
  settle: PERMISSIONS.PAYMENT_ORDER_PERIODS.SETTLE,
  generate: PERMISSIONS.PAYMENT_ORDER_PERIODS.GENERATE,
  close: PERMISSIONS.PAYMENT_ORDER_PERIODS.CLOSE,
  reopen: PERMISSIONS.PAYMENT_ORDER_PERIODS.REOPEN,
  post: PERMISSIONS.PAYMENT_ORDER_PERIODS.POST,
  delete: PERMISSIONS.PAYMENT_ORDER_PERIODS.DELETE,
};

const getActionOptions = (item: PaymentOrderPeriodListing) => {
  const allowed = actionsByStatus[item.status] ?? ["view"];

  return actionOptions
    .filter(option => {
      if (!allowed.includes(option.value)) return false;
      if (!canAny(actionPermissionByValue[option.value])) return false;
      if (option.value === "delete" && item.removable === false) return false;
      return true;
    })
    .map(option =>
      option.value === "generate" && item.status === "GENERATED"
        ? { ...option, title: t("t-payment-order-refresh-batch"), icon: "ph-arrows-clockwise" }
        : option
    );
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
    const { content, meta } = await paymentOrderPeriodService.getPaymentOrderPeriods(
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

const reloadPeriods = () =>
  fetchPeriods({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
    search: searchQuery.value,
  });

watch(dialog, (open) => {
  if (!open) errorMsg.value = "";
});

watch(deleteDialog, (open) => {
  if (!open) deleteId.value = null;
});

watch(actionDialog, (open) => {
  if (!open) {
    pendingAction.value = null;
    pendingActionId.value = null;
    pendingActionStatus.value = null;
  }
});

const onCreateClick = () => {
  if (!canCreate.value) return;
  dialog.value = true;
};

const onViewClick = (item: PaymentOrderPeriodListing) => {
  if (!can(PERMISSIONS.PAYMENT_ORDER_PERIODS.VIEW)) return;
  router.push({ name: "PaymentOrderPeriodView", params: { id: item.id } });
};

const onSettleClick = (item: PaymentOrderPeriodListing) => {
  if (!can(PERMISSIONS.PAYMENT_ORDER_PERIODS.SETTLE)) return;
  router.push({ name: "PaymentOrderPeriodSettle", params: { id: item.id } });
};

const onSubmit = async (data: PaymentOrderPeriodForm, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  if (!canCreate.value) return;

  try {
    const response = await paymentOrderPeriodService.createPaymentOrderPeriod(data);
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
  if (!can(PERMISSIONS.PAYMENT_ORDER_PERIODS.DELETE) || item.removable === false) return;
  deleteId.value = item.id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;

  try {
    await paymentOrderPeriodService.deletePaymentOrderPeriod(deleteId.value);
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

const onAskAction = (action: WorkflowAction, item: PaymentOrderPeriodListing) => {
  if (!canAny(actionPermissionByValue[action])) return;
  pendingAction.value = action;
  pendingActionId.value = item.id;
  pendingActionStatus.value = item.status;
  actionDialog.value = true;
};

const pendingActionDialog = computed<BatchConfirmationAction>(() =>
  pendingAction.value === "generate" && pendingActionStatus.value === "GENERATED"
    ? "regenerate"
    : pendingAction.value ?? "generate"
);

const runPendingAction = async () => {
  if (!pendingAction.value || !pendingActionId.value) return;

  const action = pendingAction.value;
  const id = pendingActionId.value;
  actionLoading.value = true;
  rowLoadingId.value = id;

  try {
    const response = action === "generate"
      ? await paymentOrderPeriodService.generatePaymentOrderPeriod(id)
      : action === "close"
        ? await paymentOrderPeriodService.closePaymentOrderPeriod(id)
        : action === "reopen"
          ? await paymentOrderPeriodService.reopenPaymentOrderPeriod(id)
          : await paymentOrderPeriodService.postPaymentOrderPeriod(id);

    if (response.status === "error") throw response.error;

    const successKey = {
      generate: "t-payment-order-batch-generated",
      close: "t-payment-order-batch-closed",
      reopen: "t-payment-order-batch-reopened",
      post: "t-payment-order-batch-posted",
    }[action];

    toast.success(t(successKey));
    await reloadPeriods();
    actionDialog.value = false;
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    actionLoading.value = false;
    rowLoadingId.value = null;
  }
};

const onActionSelect = (option: string, item: PaymentOrderPeriodListing) => {
  if (option === "view") onViewClick(item);
  if (option === "settle") onSettleClick(item);
  if (option === "delete") onDelete(item);
  if (option === "generate" || option === "close" || option === "reopen" || option === "post") {
    onAskAction(option, item);
  }
};
</script>

<template>
  <ListingPageShell
    class="payment-order-period-listing-page"
    :title="$t('t-payment-order-batches')"
    :subtitle="$t('t-payment-order-batches-subtitle')"
    :action-label="$t('t-add-payment-order-batch')"
    :show-action="canCreate"
    :action-permission="PERMISSIONS.PAYMENT_ORDER_PERIODS.CREATE"
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
      :headers="listViewHeader.map(item => ({ ...item, title: item.title ? $t(`t-${item.title}`) : '' }))"
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
            <Status :status="statusChipValue(item.status)" :label="statusLabel(item.status)" />
          </td>
          <td data-label="Acção" class="payment-order-period-listing-table__actions-cell">
            <v-progress-circular
              v-if="rowLoadingId === item.id"
              indeterminate
              size="20"
              width="2"
              color="primary"
            />
            <TableActionMenu
              v-else
              :menu-items="getActionOptions(item)"
              :permission-by-value="actionPermissionByValue"
              @onSelect="onActionSelect($event, item)"
            />
          </td>
        </tr>
      </template>

      <template v-if="!periods.length" #body>
        <tr>
          <td :colspan="listViewHeader.length" class="text-center py-10">
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

  <BatchConfirmationDialog
    v-if="pendingAction"
    v-model="actionDialog"
    :action="pendingActionDialog"
    :loading="actionLoading"
    @onConfirm="runPendingAction"
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
