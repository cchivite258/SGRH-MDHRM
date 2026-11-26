<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/store/authStore";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import BatchInfoCard from "@/components/paymentOrderPeriod/shared/BatchInfoCard.vue";
import TypeSummaryCards from "@/components/paymentOrderPeriod/shared/TypeSummaryCards.vue";
import GenerateLinesAction from "@/components/paymentOrderPeriod/shared/GenerateLinesAction.vue";
import Status from "@/app/common/components/Status.vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import ReportPreviewFooter from "@/components/ammReports/list/ReportPreviewFooter.vue";
import ViewPaymentOrderLineModal from "@/components/paymentOrderPeriod/view/ViewPaymentOrderLineModal.vue";
import PaymentOrderLineInvoicesModal from "@/components/paymentOrderPeriod/view/PaymentOrderLineInvoicesModal.vue";
import LinesPagination from "@/components/paymentOrderPeriod/shared/LinesPagination.vue";
import BatchEntriesTable from "@/components/paymentOrderPeriod/view/BatchEntriesTable.vue";
import BatchHistoryTable from "@/components/paymentOrderPeriod/view/BatchHistoryTable.vue";
import BatchIntegrationAttemptsTable from "@/components/paymentOrderPeriod/view/BatchIntegrationAttemptsTable.vue";
import BatchPeriodInvoicesTable from "@/components/paymentOrderPeriod/view/BatchPeriodInvoicesTable.vue";
import BatchConfirmationDialog from "@/components/paymentOrderPeriod/shared/BatchConfirmationDialog.vue";
import UnprocessBatchDialog from "@/components/paymentOrderPeriod/shared/UnprocessBatchDialog.vue";
import RejectBatchDialog from "@/components/paymentOrderPeriod/shared/RejectBatchDialog.vue";
import { usePaymentOrderBatch } from "@/components/paymentOrderPeriod/shared/usePaymentOrderBatch";
import {
  allowedWorkflowActions,
  confirmationActionFor,
  runWorkflowAction,
  workflowButtons,
  workflowPermissionsFor,
  workflowSuccessKey,
  type RefundDeductionWorkflowPayload,
} from "@/components/paymentOrderPeriod/shared/workflow";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import ApiRecordErrorsDialog from "@/app/common/components/ApiRecordErrorsDialog.vue";
import { useApiRecordErrors } from "@/composables/useApiRecordErrors";
import {
  computeTotals,
  employeeName,
  employeeNumber,
  employeeErpCode,
  formatAmount,
  lineTypeLabelKey,
  lineTypeStatusValue,
  matchesLineSearch,
  settledAmount,
} from "@/components/paymentOrderPeriod/lines/utils";
import { PaymentOrderBatchExporter } from "@/components/paymentOrderPeriod/view/exportUtils";
import type {
  PaymentOrderLine,
  PaymentOrderLineType,
  PaymentOrderPeriodId,
  PaymentOrderWorkflowAction,
} from "@/components/paymentOrderPeriod/types";

import type { ProcessSection } from "@/components/paymentOrderPeriod/listView/utils";

const props = withDefaults(defineProps<{
  periodId: PaymentOrderPeriodId;
  backRoute: string;
  section?: ProcessSection;
}>(), {
  section: "erp-integration",
});

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();
const { can, canAny } = usePermissions();
const { recordErrorsDialog, recordErrors, recordErrorsMessage, showRecordErrors } = useApiRecordErrors();
const { period, lines, loading, loadError, load } = usePaymentOrderBatch(props.periodId, props.section);
const isRefundsSection = computed(() => props.section === "refunds-and-deductions");

const search = ref("");
const typeFilter = ref<PaymentOrderLineType | "ALL">("ALL");
const exporting = ref(false);
const exportMenu = ref(false);

const exportOptions = [
  { type: "pdf" as const, title: "PDF", icon: "mdi-file-pdf-box", color: "red" },
  { type: "excel" as const, title: "Excel", icon: "mdi-file-excel", color: "green" },
];

const userName = computed(() => {
  const user = authStore.user as any;
  if (!user) return "";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "";
});

type StatusAction = Exclude<PaymentOrderWorkflowAction, "generate">;

const workflowDialog = ref(false);
const unprocessDialog = ref(false);
const reopenDialog = ref(false);
const pendingWorkflowAction = ref<StatusAction | null>(null);
const runningWorkflow = ref(false);

const statusActions = computed(() => {
  const permissions = workflowPermissionsFor(props.section);
  // Em consulta: processar lote fica só no formulário de processar.
  // Rejeitar lote (SUBMITTED + REOPEN) e reverter processamento (PROCESSED + UNPROCESS) ficam aqui.
  return allowedWorkflowActions(period.value?.status, props.section)
    .filter((action): action is StatusAction => {
      if (action === "generate" || action === "process") return false;
      if (action === "reopen") {
        return period.value?.status === "SUBMITTED" && canAny(permissions.reopen);
      }
      return canAny(permissions[action]);
    })
    .map(action => ({ action, ...workflowButtons[action] }));
});

const pendingWorkflowDialog = computed(() => confirmationActionFor(pendingWorkflowAction.value ?? "submit"));

const filteredLines = computed(() =>
  lines.value.filter(line => {
    if (typeFilter.value !== "ALL" && line.type !== typeFilter.value) return false;
    return matchesLineSearch(line, search.value);
  })
);

const filteredTotals = computed(() => computeTotals(filteredLines.value));
const isFiltered = computed(() => filteredLines.value.length !== lines.value.length);
const linesTableColspan = computed(() => (isRefundsSection.value ? 8 : 7));

const page = ref(1);
const itemsPerPage = ref(10);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredLines.value.length / itemsPerPage.value)));
const paginatedRows = computed(() =>
  filteredLines.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

watch([search, typeFilter], () => {
  page.value = 1;
});

watch(totalPages, (total) => {
  if (page.value > total) page.value = total;
});

const viewDialog = ref(false);
const invoicesDialog = ref(false);
const selectedLine = ref<PaymentOrderLine | null>(null);

const lineActionOptions = computed(() => [
  { title: t("t-view"), value: "view", icon: "ph-eye" },
  { title: t("t-payment-order-view-invoices"), value: "invoices", icon: "ph-receipt" },
]);

const lineActionPermissionByValue = {
  view: PERMISSIONS.PAYMENT_ORDER_PERIODS.VIEW,
  invoices: PERMISSIONS.INVOICES.VIEW,
};

const onLineAction = (line: PaymentOrderLine, action: string) => {
  selectedLine.value = line;
  if (action === "view") viewDialog.value = true;
  if (action === "invoices") invoicesDialog.value = true;
};

const handleExport = async (type: "pdf" | "excel") => {
  if (!period.value || !filteredLines.value.length) return;

  exporting.value = true;
  try {
    if (type === "pdf") {
      await PaymentOrderBatchExporter.exportToPDF(period.value, filteredLines.value, userName.value);
    } else {
      await PaymentOrderBatchExporter.exportToExcel(period.value, filteredLines.value, userName.value);
    }
  } catch (error) {
    console.error("Erro ao exportar lote:", error);
    toast.error(t("t-error-exporting-report"));
  } finally {
    exporting.value = false;
  }
};

const activeTab = ref<"lines" | "entries" | "invoices" | "attempts" | "history">("lines");
const entriesTable = ref<InstanceType<typeof BatchEntriesTable> | null>(null);
const invoicesTable = ref<InstanceType<typeof BatchPeriodInvoicesTable> | null>(null);
const attemptsTable = ref<InstanceType<typeof BatchIntegrationAttemptsTable> | null>(null);
const historyTable = ref<InstanceType<typeof BatchHistoryTable> | null>(null);

const onBatchChanged = async () => {
  await load();
  entriesTable.value?.load();
  invoicesTable.value?.load();
  attemptsTable.value?.load();
  historyTable.value?.load();
};

const askWorkflowAction = (action: StatusAction) => {
  if (action === "reopen" && (period.value?.status !== "SUBMITTED" || !canAny(workflowPermissionsFor(props.section).reopen))) {
    return;
  }
  pendingWorkflowAction.value = action;
  if (action === "unprocess") {
    unprocessDialog.value = true;
    return;
  }
  if (action === "reopen") {
    reopenDialog.value = true;
    return;
  }
  workflowDialog.value = true;
};

const runPendingWorkflowAction = async (payload?: RefundDeductionWorkflowPayload) => {
  const action = pendingWorkflowAction.value;
  if (!action) return;
  if (action === "reopen" && (period.value?.status !== "SUBMITTED" || !canAny(workflowPermissionsFor(props.section).reopen))) {
    return;
  }

  runningWorkflow.value = true;
  try {
    const response = await runWorkflowAction(props.periodId, action, props.section, payload);
    if (response.status === "error") throw response.error;
    toast.success(t(workflowSuccessKey(action, props.section)));
    workflowDialog.value = false;
    unprocessDialog.value = false;
    reopenDialog.value = false;
    await onBatchChanged();
  } catch (error) {
    if (showRecordErrors(error)) {
      workflowDialog.value = false;
      unprocessDialog.value = false;
      reopenDialog.value = false;
    } else {
      getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    }
  } finally {
    runningWorkflow.value = false;
  }
};

const goBack = () => router.push(props.backRoute);

onMounted(load);
</script>

<template>
  <div class="payment-order-view-page">
    <v-card v-if="loading && !period" class="view-card" elevation="0">
      <v-skeleton-loader type="article, table-heading, table-tbody" />
    </v-card>

    <v-card v-else-if="loadError || !period" class="view-card text-center py-12" elevation="0">
      <v-avatar size="72" color="danger" variant="tonal">
        <i class="ph-warning-circle" style="font-size: 32px" />
      </v-avatar>
      <div class="mt-3 font-weight-bold">{{ $t("t-payment-order-load-error") }}</div>
      <div class="d-flex justify-center ga-2 mt-4">
        <v-btn variant="outlined" color="secondary" @click="goBack">
          <i class="ph-arrow-left me-1" /> {{ $t("t-back") }}
        </v-btn>
        <v-btn color="primary" variant="elevated" :loading="loading" @click="load">
          <i class="ph-arrow-clockwise me-1" /> {{ $t("t-retry") }}
        </v-btn>
      </div>
    </v-card>

    <template v-else>
      <BatchInfoCard :period="period">
        <template #actions>
          <GenerateLinesAction :period="period" :has-lines="lines.length > 0" :section="section" @generated="onBatchChanged" />
          <v-btn
            v-for="item in statusActions"
            :key="item.action"
            :color="item.color"
            variant="elevated"
            size="small"
            :loading="runningWorkflow && pendingWorkflowAction === item.action"
            :disabled="runningWorkflow"
            @click="askWorkflowAction(item.action)"
          >
            <i :class="[item.icon, 'me-1']" /> {{ $t(item.label) }}
          </v-btn>
          <v-btn-group variant="outlined" density="comfortable">
            <v-btn
              color="primary"
              prepend-icon="mdi-printer"
              :disabled="exporting || !filteredLines.length"
              @click="handleExport('pdf')"
            >
              {{ $t("t-print") }}
            </v-btn>

            <v-menu v-model="exportMenu" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  color="grey-darken-2"
                  prepend-icon="mdi-download"
                  :disabled="exporting || !filteredLines.length"
                  :loading="exporting"
                >
                  {{ $t("t-export") }}
                  <v-icon end>mdi-chevron-down</v-icon>
                </v-btn>
              </template>

              <v-list density="compact" class="export-menu-list">
                <v-list-item
                  v-for="option in exportOptions"
                  :key="option.type"
                  @click="handleExport(option.type); exportMenu = false"
                >
                  <template #prepend>
                    <v-icon :color="option.color" size="18">{{ option.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="export-menu-title">{{ option.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn-group>
        </template>
      </BatchInfoCard>

      <TypeSummaryCards
        v-if="lines.length"
        :lines="lines"
        :mode="isRefundsSection ? 'settlement' : 'summary'"
        class="mt-1"
      />

      <v-card class="view-card mt-4" elevation="0">
        <v-tabs v-model="activeTab" color="primary" density="comfortable" class="view-tabs">
          <v-tab value="lines" class="text-none">
            <i class="ph-table me-2" /> {{ $t("t-payment-order-batch-lines") }}
            <v-chip size="x-small" variant="tonal" color="primary" class="ms-2">
              {{ isFiltered ? `${filteredLines.length} / ${lines.length}` : lines.length }}
            </v-chip>
          </v-tab>
          <v-tab v-if="!isRefundsSection" value="entries" class="text-none">
            <i class="ph-book-open me-2" /> {{ $t("t-payment-order-entries") }}
          </v-tab>
          <v-tab v-if="!isRefundsSection" value="invoices" class="text-none">
            <i class="ph-receipt me-2" /> {{ $t("t-payment-order-period-invoices") }}
          </v-tab>
          <v-tab v-if="!isRefundsSection" value="attempts" class="text-none">
            <i class="ph-plugs-connected me-2" /> {{ $t("t-payment-order-integration-attempts") }}
          </v-tab>
          <v-tab value="history" class="text-none">
            <i class="ph-clock-counter-clockwise me-2" /> {{ $t("t-payment-order-history") }}
          </v-tab>
        </v-tabs>
        <v-divider />

        <v-window v-model="activeTab">
          <v-window-item value="lines">
            <div class="view-card__header justify-end">
              <v-text-field
                v-model="search"
                :placeholder="$t('t-search-payment-order-line')"
                prepend-inner-icon="ph-magnifying-glass"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                class="view-card__search"
              />
            </div>

            <v-divider />

            <div v-if="lines.length" class="view-card__toolbar">
              <v-btn-toggle v-model="typeFilter" mandatory density="compact" variant="outlined" divided color="primary">
                <v-btn value="ALL" size="small">{{ $t("t-payment-order-filter-all") }}</v-btn>
                <v-btn value="REFUND" size="small">{{ $t("t-payment-order-refunds") }}</v-btn>
                <v-btn value="DEDUCTION" size="small">{{ $t("t-payment-order-deductions") }}</v-btn>
              </v-btn-toggle>
            </div>

            <div v-if="!lines.length" class="text-center py-12">
              <v-avatar size="72" color="secondary" variant="tonal">
                <i class="ph-rows" style="font-size: 30px" />
              </v-avatar>
              <div class="mt-3 font-weight-bold">{{ $t("t-payment-order-no-lines") }}</div>
              <div class="mt-1 text-medium-emphasis">{{ $t("t-payment-order-no-lines-hint") }}</div>
              <div class="mt-4">
                <GenerateLinesAction :period="period" :has-lines="false" :section="section" size="default" variant="elevated" @generated="onBatchChanged" />
              </div>
            </div>

            <template v-else>
              <div class="view-table-wrapper">
                <v-table density="comfortable" hover class="view-table">
                  <thead>
                    <tr>
                      <th>{{ $t("t-employee") }}</th>
                      <th>{{ $t("t-payment-order-integration-account") }}</th>
                      <th>{{ $t("t-type") }}</th>
                      <th class="text-right">{{ $t("t-payment-order-total-refund") }}</th>
                      <th class="text-right">{{ $t("t-payment-order-total-deduction") }}</th>
                      <th class="text-right">{{ $t("t-payment-order-amount-to-pay") }}</th>
                      <th v-if="isRefundsSection" class="text-right">{{ $t("t-payment-order-amount-settled") }}</th>
                      <th class="text-center">{{ $t("t-action") }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!filteredLines.length">
                      <td :colspan="linesTableColspan" class="text-center py-8 text-medium-emphasis">
                        <i class="ph-funnel-simple me-1" /> {{ $t("t-payment-order-no-results") }}
                      </td>
                    </tr>
                    <tr v-for="line in paginatedRows" :key="line.id">
                      <td class="view-table__employee">
                        <div class="font-weight-medium" :title="employeeName(line)">{{ employeeName(line) }}</div>
                        <div class="view-table__sub text-medium-emphasis">{{ employeeNumber(line) }}</div>
                      </td>
                      <td class="text-no-wrap">{{ employeeErpCode(line) }}</td>
                      <td>
                        <Status v-if="line.type" :status="lineTypeStatusValue(line.type)" :label="$t(lineTypeLabelKey(line.type))" />
                        <span v-else>-</span>
                      </td>
                      <td class="text-right text-no-wrap">{{ formatAmount(line.totalRefund) }}</td>
                      <td class="text-right text-no-wrap">{{ formatAmount(line.totalDeduction) }}</td>
                      <td class="text-right text-no-wrap font-weight-bold">{{ formatAmount(line.amountToPay) }}</td>
                      <td v-if="isRefundsSection" class="text-right text-no-wrap">{{ formatAmount(settledAmount(line)) }}</td>
                      <td class="view-table__actions">
                        <TableActionMenu
                          :menu-items="lineActionOptions"
                          :permission-by-value="lineActionPermissionByValue"
                          @onSelect="onLineAction(line, $event)"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot v-if="filteredLines.length">
                    <tr class="view-table__totals">
                      <td colspan="3">
                        {{ $t("t-totals") }}
                        <span class="text-caption text-medium-emphasis">({{ filteredTotals.lines }})</span>
                      </td>
                      <td class="text-right text-no-wrap">{{ formatAmount(filteredTotals.totalRefund) }}</td>
                      <td class="text-right text-no-wrap">{{ formatAmount(filteredTotals.totalDeduction) }}</td>
                      <td class="text-right text-no-wrap">{{ formatAmount(filteredTotals.amountToPay) }}</td>
                      <td v-if="isRefundsSection" class="text-right text-no-wrap">{{ formatAmount(filteredTotals.amountSettled) }}</td>
                      <td />
                    </tr>
                  </tfoot>
                </v-table>
              </div>

              <LinesPagination
                v-model:page="page"
                v-model:items-per-page="itemsPerPage"
                :total-items="filteredLines.length"
              />
            </template>
          </v-window-item>

          <v-window-item v-if="!isRefundsSection" value="entries">
            <BatchEntriesTable ref="entriesTable" :period-id="periodId" />
          </v-window-item>

          <v-window-item v-if="!isRefundsSection" value="invoices">
            <BatchPeriodInvoicesTable ref="invoicesTable" :period-id="periodId" />
          </v-window-item>

          <v-window-item v-if="!isRefundsSection" value="attempts">
            <BatchIntegrationAttemptsTable ref="attemptsTable" :period-id="periodId" />
          </v-window-item>

          <v-window-item value="history">
            <BatchHistoryTable ref="historyTable" :period-id="periodId" :section="section" />
          </v-window-item>
        </v-window>
      </v-card>

      <ViewPaymentOrderLineModal v-if="selectedLine" v-model="viewDialog" :data="selectedLine" />
      <PaymentOrderLineInvoicesModal v-if="selectedLine" v-model="invoicesDialog" :data="selectedLine" />

      <ReportPreviewFooter system-footer-key="t-spr-system-footer" :generated-by="userName" />

      <BatchConfirmationDialog
        v-if="pendingWorkflowAction && pendingWorkflowAction !== 'unprocess' && pendingWorkflowAction !== 'reopen'"
        v-model="workflowDialog"
        :action="pendingWorkflowDialog"
        :loading="runningWorkflow"
        @onConfirm="runPendingWorkflowAction()"
      />
      <UnprocessBatchDialog
        v-model="unprocessDialog"
        :loading="runningWorkflow"
        @onConfirm="runPendingWorkflowAction"
      />
      <RejectBatchDialog
        v-model="reopenDialog"
        :loading="runningWorkflow"
        @onConfirm="runPendingWorkflowAction"
      />
      <ApiRecordErrorsDialog
        v-model="recordErrorsDialog"
        :records="recordErrors"
        :message="recordErrorsMessage"
      />

      <div class="d-flex justify-start mt-3">
        <v-btn color="secondary" variant="outlined" @click="goBack">
          <i class="ph-arrow-left me-2" /> {{ $t("t-back") }}
        </v-btn>
      </div>
    </template>
  </div>
</template>

<style scoped>
.view-card {
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.view-card__header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 16px 20px;
}

.view-tabs {
  padding: 0 8px;
}

.view-card__search {
  max-width: 340px;
  min-width: 220px;
}

.view-card__toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 8px 20px;
}

.view-card__filter-count {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 6px;
  padding: 0 6px;
}

.view-table-wrapper {
  overflow-x: auto;
}

.view-table :deep(table) {
  width: 100%;
}

.view-table :deep(thead th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec !important;
  color: #334155 !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  line-height: 1.25;
  padding: 0 8px !important;
}

.view-table :deep(tbody td),
.view-table :deep(tfoot td) {
  color: #334155;
  font-size: 0.78rem;
  padding: 0 8px !important;
  vertical-align: middle;
}

.view-table :deep(tbody td) {
  border-bottom: 1px solid #eef2f7 !important;
}

.view-table :deep(th:first-child),
.view-table :deep(td:first-child) {
  padding-left: 16px !important;
}

.view-table :deep(th:last-child),
.view-table :deep(td:last-child) {
  padding-right: 16px !important;
}

.view-table__employee {
  line-height: 1.3;
  padding-bottom: 6px !important;
  padding-top: 6px !important;
}

.view-table__sub {
  font-size: 0.7rem;
}

.view-table__actions {
  text-align: center;
  width: 56px;
}

.view-table__actions :deep(.d-flex) {
  justify-content: center !important;
}


.view-table__totals td {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  font-weight: 700;
}

.export-menu-list :deep(.v-list-item) {
  min-height: 34px;
  padding-inline: 10px;
}

.export-menu-title {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.min-w-0 {
  min-width: 0;
}
</style>
