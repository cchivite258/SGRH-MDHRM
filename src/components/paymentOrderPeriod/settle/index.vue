<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { onBeforeRouteLeave, useRouter, type RouteLocationRaw } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { usePermissions } from "@/composables/usePermissions";
import { useApiRecordErrors } from "@/composables/useApiRecordErrors";
import Status from "@/app/common/components/Status.vue";
import ApiRecordErrorsDialog from "@/app/common/components/ApiRecordErrorsDialog.vue";
import BatchInfoCard from "@/components/paymentOrderPeriod/shared/BatchInfoCard.vue";
import TypeSummaryCards from "@/components/paymentOrderPeriod/shared/TypeSummaryCards.vue";
import GenerateLinesAction from "@/components/paymentOrderPeriod/shared/GenerateLinesAction.vue";
import BatchConfirmationDialog from "@/components/paymentOrderPeriod/shared/BatchConfirmationDialog.vue";
import LinesPagination from "@/components/paymentOrderPeriod/shared/LinesPagination.vue";
import { usePaymentOrderBatch } from "@/components/paymentOrderPeriod/shared/usePaymentOrderBatch";
import {
  canEditSettlementForStatus,
  statusLabelKey,
  type ProcessSection,
} from "@/components/paymentOrderPeriod/listView/utils";
import { orderServiceFor } from "@/components/paymentOrderPeriod/shared/sectionApi";
import { contractIntegrationService } from "@/app/http/httpServiceProvider";
import type { SettledAmountMode } from "@/components/institution/create/integration/types";
import {
  allowedWorkflowActions,
  runWorkflowAction,
  sectionPeriodPermissions,
  workflowButtons,
  workflowPermissionsFor,
  workflowSuccessKey,
  type RefundDeductionWorkflowPayload,
} from "@/components/paymentOrderPeriod/shared/workflow";
import UnprocessBatchDialog from "@/components/paymentOrderPeriod/shared/UnprocessBatchDialog.vue";
import RejectBatchDialog from "@/components/paymentOrderPeriod/shared/RejectBatchDialog.vue";
import {
  computeTotals,
  employeeName,
  employeeNumber,
  formatAmount,
  isLineSettled,
  lineBalance,
  lineTypeLabelKey,
  lineTypeStatusValue,
  settledAmount,
  matchesLineSearch,
  roundAmount,
  toAmount,
  type PaymentOrderLineFilter,
} from "@/components/paymentOrderPeriod/lines/utils";
import type {
  PaymentOrderLine,
  PaymentOrderLineType,
  PaymentOrderPeriodId,
  PaymentOrderWorkflowAction,
} from "@/components/paymentOrderPeriod/types";

type LineDraft = {
  amountSettled: string;
  notes: string;
};

const props = withDefaults(defineProps<{
  periodId: PaymentOrderPeriodId;
  backRoute: string;
  section?: ProcessSection;
}>(), {
  section: "refunds-and-deductions",
});

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const { can, canAny } = usePermissions();
const { recordErrorsDialog, recordErrors, recordErrorsMessage, showRecordErrors } = useApiRecordErrors();
const { period, lines, loading, loadError, load } = usePaymentOrderBatch(props.periodId, props.section);

const drafts = reactive<Record<string, LineDraft>>({});
const search = ref("");
const statusFilter = ref<PaymentOrderLineFilter>("all");
const typeFilter = ref<PaymentOrderLineType | "ALL">("ALL");
const selectedIds = ref<string[]>([]);
const confirmDialog = ref(false);
const saving = ref(false);
const leaveDialog = ref(false);
const pendingLeaveTarget = ref<RouteLocationRaw | null>(null);
let allowLeave = false;

const periodPermissions = computed(() => sectionPeriodPermissions(props.section));
const settledAmountMode = ref<SettledAmountMode | null>(null);

const canEdit = computed(() =>
  canEditSettlementForStatus(period.value?.status, {
    canProcess: can(periodPermissions.value.PROCESS),
  })
);

/** Automático: valor = calculatedAmountSettled, sem edição. Manual: edição permitida. */
const isAutomaticSettledAmount = computed(() => settledAmountMode.value === "AUTOMATIC");
const canEditAmounts = computed(() => canEdit.value && !isAutomaticSettledAmount.value);

const readonlyNoticeKey = computed(() => {
  if (!canEdit.value) {
    return period.value?.status === "SUBMITTED"
      ? "t-payment-order-process-no-permission"
      : "t-payment-order-readonly-notice";
  }
  if (isAutomaticSettledAmount.value) return "t-payment-order-settled-amount-automatic-notice";
  return "";
});

const draftAmountSettledValue = (line: PaymentOrderLine) => {
  if (isAutomaticSettledAmount.value) {
    return String(roundAmount(Math.abs(toAmount(line.calculatedAmountSettled))));
  }
  return String(settledAmount(line));
};

const loadSettledAmountMode = async (contractId?: string | number | null) => {
  if (contractId === null || contractId === undefined || contractId === "") {
    settledAmountMode.value = "MANUAL";
    return;
  }

  try {
    const response = await contractIntegrationService.getByContract(contractId);
    if (response.status === "error") {
      settledAmountMode.value = "MANUAL";
      return;
    }

    const integrations = response.data ?? [];
    const match = integrations.find(item => item.usage === "PAYMENT_ORDERS") ?? integrations[0];
    settledAmountMode.value = match?.settledAmountMode === "AUTOMATIC" ? "AUTOMATIC" : "MANUAL";
  } catch {
    settledAmountMode.value = "MANUAL";
  }
};

type StatusAction = Exclude<PaymentOrderWorkflowAction, "generate">;

const workflowDialog = ref(false);
const pendingWorkflowAction = ref<StatusAction | null>(null);
const runningWorkflow = ref(false);

const statusActions = computed(() => {
  const permissions = workflowPermissionsFor(props.section);
  return allowedWorkflowActions(period.value?.status, props.section)
    .filter((action): action is StatusAction => {
      if (action === "generate") return false;
      // Rejeitar lote: só Submetido + reopen.refund.deduction.periods
      if (action === "reopen") {
        return period.value?.status === "SUBMITTED" && canAny(permissions.reopen);
      }
      return canAny(permissions[action]);
    })
    .map(action => ({ action, ...workflowButtons[action] }));
});

const unprocessDialog = ref(false);
const reopenDialog = ref(false);

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
    await load();
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

const resetDrafts = (source: PaymentOrderLine[]) => {
  Object.keys(drafts).forEach(id => delete drafts[id]);
  source.forEach(line => {
    drafts[line.id] = {
      amountSettled: draftAmountSettledValue(line),
      notes: line.notes ?? "",
    };
  });
  selectedIds.value = [];
};

watch(lines, resetDrafts);
watch(settledAmountMode, () => resetDrafts(lines.value));
watch(
  () => period.value?.contractId,
  (contractId) => {
    void loadSettledAmountMode(contractId);
  },
  { immediate: true }
);

const draftAmount = (line: PaymentOrderLine) => {
  const raw = drafts[line.id]?.amountSettled;
  if (raw === undefined || raw === null || String(raw).trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? roundAmount(parsed) : null;
};

const isDirty = (line: PaymentOrderLine) => {
  const draft = drafts[line.id];
  if (!draft) return false;
  const amountChanged = draftAmount(line) !== settledAmount(line);
  const notesChanged = draft.notes.trim() !== (line.notes ?? "").trim();
  return amountChanged || notesChanged;
};

const amountError = (line: PaymentOrderLine) => {
  const amount = draftAmount(line);
  if (amount === null) return t("t-payment-order-amount-required");
  if (amount < 0) return t("t-payment-order-amount-negative");
  return "";
};

const amountWarning = (line: PaymentOrderLine) => {
  const amount = draftAmount(line);
  if (amount === null || amount < 0) return "";
  return Math.abs(amount) > Math.abs(roundAmount(toAmount(line.amountToPay))) ? t("t-payment-order-amount-exceeds") : "";
};

const effectiveLine = (line: PaymentOrderLine): PaymentOrderLine => {
  if (!isDirty(line)) return line;
  const amount = draftAmount(line) ?? 0;
  return {
    ...line,
    amountSettled: amount,
    balance: lineBalance({ ...line, amountSettled: amount }),
  };
};

const effectiveLines = computed(() => lines.value.map(effectiveLine));
const liveSettledLines = computed(() => effectiveLines.value.filter(isLineSettled).length);
const dirtyLines = computed(() => lines.value.filter(isDirty));
const invalidLines = computed(() => dirtyLines.value.filter(line => !!amountError(line)));
const dirtySettledTotal = computed(() =>
  dirtyLines.value.reduce((sum, line) => sum + (draftAmount(line) ?? 0), 0)
);

const filterCounts = computed(() => ({
  all: lines.value.length,
  pending: effectiveLines.value.filter(line => !isLineSettled(line)).length,
  settled: liveSettledLines.value,
  changed: dirtyLines.value.length,
}));

const statusFilters = computed(() => [
  { value: "all" as const, label: t("t-payment-order-filter-all"), count: filterCounts.value.all },
  { value: "pending" as const, label: t("t-payment-order-filter-pending"), count: filterCounts.value.pending },
  { value: "settled" as const, label: t("t-payment-order-filter-settled"), count: filterCounts.value.settled },
  { value: "changed" as const, label: t("t-payment-order-filter-changed"), count: filterCounts.value.changed },
]);

const filteredLines = computed(() =>
  lines.value.filter(line => {
    if (typeFilter.value !== "ALL" && line.type !== typeFilter.value) return false;
    if (!matchesLineSearch(line, search.value)) return false;
    if (statusFilter.value === "changed") return isDirty(line);
    if (statusFilter.value === "pending") return !isLineSettled(effectiveLine(line));
    if (statusFilter.value === "settled") return isLineSettled(effectiveLine(line));
    return true;
  })
);

const filteredTotals = computed(() => computeTotals(filteredLines.value.map(effectiveLine)));

const page = ref(1);
const itemsPerPage = ref(10);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredLines.value.length / itemsPerPage.value)));
const paginatedRows = computed(() =>
  filteredLines.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

watch([search, statusFilter, typeFilter], () => {
  page.value = 1;
});

watch(totalPages, (total) => {
  if (page.value > total) page.value = total;
});

const allFilteredSelected = computed(() =>
  filteredLines.value.length > 0 && filteredLines.value.every(line => selectedIds.value.includes(line.id))
);
const someFilteredSelected = computed(() =>
  !allFilteredSelected.value && filteredLines.value.some(line => selectedIds.value.includes(line.id))
);

const toggleAllFiltered = (value: boolean | null) => {
  const filteredIds = filteredLines.value.map(line => line.id);
  selectedIds.value = value
    ? Array.from(new Set([...selectedIds.value, ...filteredIds]))
    : selectedIds.value.filter(id => !filteredIds.includes(id));
};

const settleFullAmount = (ids: string[]) => {
  ids.forEach(id => {
    const line = lines.value.find(item => item.id === id);
    if (line && drafts[id]) drafts[id].amountSettled = String(Math.abs(roundAmount(toAmount(line.amountToPay))));
  });
};

const clearAmounts = (ids: string[]) => {
  ids.forEach(id => {
    if (drafts[id]) drafts[id].amountSettled = "0";
  });
};

const revertLine = (line: PaymentOrderLine) => {
  drafts[line.id] = {
    amountSettled: draftAmountSettledValue(line),
    notes: line.notes ?? "",
  };
};

const discardChanges = () => resetDrafts(lines.value);

const onSaveClick = () => {
  if (!dirtyLines.value.length) return;
  if (invalidLines.value.length) {
    toast.error(t("t-payment-order-fix-errors"));
    statusFilter.value = "changed";
    return;
  }
  confirmDialog.value = true;
};

const saveSettlement = async () => {
  if (!dirtyLines.value.length || invalidLines.value.length) return;

  saving.value = true;
  try {
    const items = dirtyLines.value.map(line => {
      const amount = draftAmount(line) ?? 0;
      const item: { id: string; amountSettled: number; notes?: string } = {
        id: line.id,
        amountSettled: amount,
      };
      const notes = drafts[line.id]?.notes?.trim();
      if (notes) item.notes = notes;
      else if ((line.notes ?? "").trim()) item.notes = "";
      return item;
    });

    type BulkUpdateItem = { id: string; amountSettled: number; notes?: string };
    const orderService = orderServiceFor(props.section) as {
      bulkUpdateByPeriod?: (periodId: PaymentOrderPeriodId, items: BulkUpdateItem[]) => Promise<PaymentOrderLine[]>;
    };
    if (!orderService.bulkUpdateByPeriod) {
      toast.error(t("t-payment-order-orders-readonly"));
      return;
    }

    await orderService.bulkUpdateByPeriod(props.periodId, items);
    toast.success(t("t-payment-order-settle-saved", { count: items.length }));
    confirmDialog.value = false;
    await load();
  } catch (error) {
    if (showRecordErrors(error)) {
      confirmDialog.value = false;
    } else {
      getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    }
  } finally {
    saving.value = false;
  }
};

const goBack = () => router.push(props.backRoute);

onBeforeRouteLeave((to) => {
  if (allowLeave || !dirtyLines.value.length) return true;
  pendingLeaveTarget.value = to.fullPath;
  leaveDialog.value = true;
  return false;
});

const confirmLeave = () => {
  allowLeave = true;
  leaveDialog.value = false;
  if (pendingLeaveTarget.value) router.push(pendingLeaveTarget.value);
};

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!dirtyLines.value.length) return;
  event.preventDefault();
  event.returnValue = "";
};

onMounted(() => {
  window.addEventListener("beforeunload", onBeforeUnload);
  load();
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
});
</script>

<template>
  <div class="payment-order-settle-page" :class="{ 'payment-order-settle-page--with-bar': dirtyLines.length }">
    <v-card v-if="loading && !period" class="settle-card" elevation="0">
      <v-skeleton-loader type="article, table-heading, table-tbody" />
    </v-card>

    <v-card v-else-if="loadError || !period" class="settle-card text-center py-12" elevation="0">
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
      <BatchInfoCard :period="period" :lines="effectiveLines" show-settlement-progress>
        <template #actions>
          <GenerateLinesAction
            :period="period"
            :has-lines="lines.length > 0"
            :section="section"
            :disabled="dirtyLines.length > 0"
            @generated="load"
          />
          <v-btn
            v-for="item in statusActions"
            :key="item.action"
            :color="item.color"
            variant="elevated"
            size="small"
            :loading="runningWorkflow && pendingWorkflowAction === item.action"
            :disabled="runningWorkflow || dirtyLines.length > 0"
            @click="askWorkflowAction(item.action)"
          >
            <i :class="[item.icon, 'me-1']" /> {{ $t(item.label) }}
          </v-btn>
          <v-btn variant="outlined" color="secondary" size="small" @click="goBack">
            <i class="ph-arrow-left me-1" /> {{ $t("t-back") }}
          </v-btn>
        </template>
      </BatchInfoCard>

      <TypeSummaryCards v-if="lines.length" :lines="effectiveLines" mode="settlement" class="mt-1" />

      <v-alert
        v-if="readonlyNoticeKey && lines.length"
        type="info"
        variant="tonal"
        density="compact"
        class="mt-4"
      >
        {{ $t(readonlyNoticeKey, { status: $t(statusLabelKey(period.status)) }) }}
      </v-alert>

      <v-card class="settle-card mt-4" elevation="0">
        <div class="settle-card__header">
          <div class="d-flex align-center ga-2">
            <i class="ph-rows settle-card__header-icon" />
            <span class="text-body-1 font-weight-bold">{{ $t("t-payment-order-batch-lines") }}</span>
            <v-chip size="small" variant="tonal" color="primary">{{ lines.length }}</v-chip>
          </div>
          <v-text-field
            v-model="search"
            :placeholder="$t('t-search-payment-order-line')"
            prepend-inner-icon="ph-magnifying-glass"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="settle-card__search"
          />
        </div>

        <v-divider />

        <div class="settle-card__toolbar">
          <v-chip-group v-model="statusFilter" mandatory selected-class="text-primary" class="flex-wrap">
            <v-chip
              v-for="filter in statusFilters"
              :key="filter.value"
              :value="filter.value"
              size="small"
              variant="outlined"
              filter
            >
              {{ filter.label }}
              <span class="settle-card__filter-count">{{ filter.count }}</span>
            </v-chip>
          </v-chip-group>

          <v-btn-toggle v-model="typeFilter" mandatory density="compact" variant="outlined" divided color="primary">
            <v-btn value="ALL" size="small">{{ $t("t-payment-order-filter-all") }}</v-btn>
            <v-btn value="REFUND" size="small">{{ $t("t-payment-order-refunds") }}</v-btn>
            <v-btn value="DEDUCTION" size="small">{{ $t("t-payment-order-deductions") }}</v-btn>
          </v-btn-toggle>
        </div>

        <v-expand-transition>
          <div v-if="canEditAmounts && selectedIds.length" class="settle-card__bulk">
            <span class="text-body-2 font-weight-medium">
              <i class="ph-check-square me-1" />{{ selectedIds.length }}
            </span>
            <v-btn size="small" color="success" variant="tonal" @click="settleFullAmount(selectedIds)">
              <i class="ph-coins me-1" />
              {{ $t("t-payment-order-fill-selected", { count: selectedIds.length }) }}
            </v-btn>
            <v-btn size="small" color="secondary" variant="tonal" @click="clearAmounts(selectedIds)">
              <i class="ph-eraser me-1" />
              {{ $t("t-payment-order-clear-selected", { count: selectedIds.length }) }}
            </v-btn>
            <v-btn size="small" variant="text" @click="selectedIds = []">{{ $t("t-clear") }}</v-btn>
          </div>
        </v-expand-transition>

        <div v-if="!lines.length" class="text-center py-12">
          <v-avatar size="72" color="secondary" variant="tonal">
            <i class="ph-rows" style="font-size: 30px" />
          </v-avatar>
          <div class="mt-3 font-weight-bold">{{ $t("t-payment-order-no-lines") }}</div>
          <div class="mt-1 text-medium-emphasis">{{ $t("t-payment-order-no-lines-hint") }}</div>
          <div class="mt-4">
            <GenerateLinesAction :period="period" :has-lines="false" :section="section" size="default" variant="elevated" @generated="load" />
          </div>
        </div>

        <template v-else>
          <div class="settle-table-wrapper">
            <v-table density="compact" class="settle-table">
              <thead>
                <tr>
                  <th v-if="canEditAmounts" class="settle-table__select">
                    <v-checkbox-btn
                      :model-value="allFilteredSelected"
                      :indeterminate="someFilteredSelected"
                      density="compact"
                      @update:model-value="toggleAllFiltered"
                    />
                  </th>
                  <th>{{ $t("t-employee") }}</th>
                  <th>{{ $t("t-type") }}</th>
                  <th class="text-right">{{ $t("t-payment-order-previous-balance") }}</th>
                  <th class="text-right">{{ $t("t-payment-order-amount-to-pay") }}</th>
                  <th class="settle-table__amount">{{ $t("t-payment-order-amount-settled") }}</th>
                  <th class="text-right">{{ $t("t-payment-order-balance") }}</th>
                  <th class="settle-table__notes">{{ $t("t-notes") }}</th>
                  <th v-if="canEditAmounts" class="settle-table__row-actions" />
                </tr>
              </thead>
              <tbody>
                <tr v-if="!filteredLines.length">
                  <td :colspan="canEditAmounts ? 9 : 7" class="text-center py-8 text-medium-emphasis">
                    <i class="ph-funnel-simple me-1" /> {{ $t("t-payment-order-no-results") }}
                  </td>
                </tr>
                <tr
                  v-for="line in paginatedRows"
                  :key="line.id"
                  :class="{ 'settle-table__row--dirty': isDirty(line) }"
                >
                  <td v-if="canEditAmounts" class="settle-table__select">
                    <v-checkbox-btn v-model="selectedIds" :value="line.id" density="compact" />
                  </td>
                  <td class="settle-table__employee">
                    <div class="font-weight-medium" :title="employeeName(line)">{{ employeeName(line) }}</div>
                    <div class="settle-table__sub text-medium-emphasis">
                      {{ employeeNumber(line) }}
                      <span v-if="isDirty(line)" class="ms-1">
                        <Status status="PENDING" :label="$t('t-payment-order-edited')" />
                      </span>
                    </div>
                  </td>
                  <td>
                    <Status v-if="line.type" :status="lineTypeStatusValue(line.type)" :label="$t(lineTypeLabelKey(line.type))" />
                    <span v-else>-</span>
                  </td>
                  <td class="text-right text-no-wrap">{{ formatAmount(line.previousBalance) }}</td>
                  <td class="text-right text-no-wrap font-weight-bold">{{ formatAmount(line.amountToPay) }}</td>
                  <td class="settle-table__amount">
                    <v-text-field
                      v-if="canEditAmounts"
                      v-model="drafts[line.id].amountSettled"
                      type="number"
                      min="0"
                      step="0.01"
                      suffix="MT"
                      density="compact"
                      variant="outlined"
                      class="settle-table__input"
                      hide-details="auto"
                      :error-messages="amountError(line)"
                      :messages="amountWarning(line)"
                      :class="{ 'settle-table__input--warning': !!amountWarning(line) }"
                    />
                    <span v-else class="text-no-wrap">
                      {{ formatAmount(isAutomaticSettledAmount ? line.calculatedAmountSettled : settledAmount(line)) }}
                    </span>
                  </td>
                  <td class="text-right text-no-wrap">
                    <div :class="isLineSettled(effectiveLine(line)) ? 'text-success' : 'text-warning'" class="font-weight-bold">
                      {{ formatAmount(lineBalance(effectiveLine(line))) }}
                    </div>
                    <div v-if="isDirty(line)" class="text-caption text-medium-emphasis">
                      {{ $t("t-payment-order-projected-balance") }}
                    </div>
                  </td>
                  <td class="settle-table__notes">
                    <v-text-field
                      v-if="canEdit"
                      v-model="drafts[line.id].notes"
                      :placeholder="$t('t-enter-notes')"
                      density="compact"
                      variant="outlined"
                      class="settle-table__input"
                      hide-details
                    />
                    <span v-else>{{ line.notes || "-" }}</span>
                  </td>
                  <td v-if="canEditAmounts" class="settle-table__row-actions">
                    <v-tooltip :text="$t('t-payment-order-fill-full-amount')" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-bind="tooltipProps"
                          icon
                          size="x-small"
                          variant="text"
                          color="success"
                          @click="settleFullAmount([line.id])"
                        >
                          <i class="ph-coins" style="font-size: 16px" />
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip v-if="isDirty(line)" :text="$t('t-payment-order-discard-changes')" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn v-bind="tooltipProps" icon size="x-small" variant="text" color="secondary" @click="revertLine(line)">
                          <i class="ph-arrow-counter-clockwise" style="font-size: 16px" />
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="filteredLines.length">
                <tr class="settle-table__totals">
                  <td v-if="canEditAmounts" />
                  <td colspan="2" class="font-weight-bold">
                    {{ $t("t-totals") }}
                    <span class="text-caption text-medium-emphasis">({{ filteredTotals.lines }})</span>
                  </td>
                  <td class="text-right text-no-wrap">{{ formatAmount(filteredTotals.previousBalance) }}</td>
                  <td class="text-right text-no-wrap">{{ formatAmount(filteredTotals.amountToPay) }}</td>
                  <td class="text-no-wrap text-success">{{ formatAmount(filteredTotals.amountSettled) }}</td>
                  <td class="text-right text-no-wrap">{{ formatAmount(filteredTotals.balance) }}</td>
                  <td :colspan="canEditAmounts ? 2 : 1" />
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
      </v-card>
    </template>

    <v-slide-y-reverse-transition>
      <div v-if="dirtyLines.length" class="settle-action-bar">
        <div class="d-flex align-center ga-2">
          <v-avatar size="32" color="warning" variant="tonal">
            <i class="ph-pencil-simple-line" />
          </v-avatar>
          <div>
            <div class="font-weight-bold text-body-2">
              {{ $t("t-payment-order-changes-pending", { count: dirtyLines.length }) }}
            </div>
            <div v-if="invalidLines.length" class="text-caption text-danger">
              {{ $t("t-payment-order-fix-errors") }}
            </div>
          </div>
        </div>
        <div class="d-flex ga-2">
          <v-btn variant="outlined" color="secondary" :disabled="saving" @click="discardChanges">
            <i class="ph-arrow-counter-clockwise me-1" /> {{ $t("t-payment-order-discard-changes") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" :loading="saving" :disabled="saving" @click="onSaveClick">
            <i class="ph-floppy-disk me-1" /> {{ $t("t-payment-order-save-settlement") }}
          </v-btn>
        </div>
      </div>
    </v-slide-y-reverse-transition>

    <BatchConfirmationDialog
      v-model="confirmDialog"
      action="settle"
      :text-params="{ count: dirtyLines.length, amount: formatAmount(dirtySettledTotal).replace(' MT', '') }"
      :loading="saving"
      @onConfirm="saveSettlement"
    />

    <BatchConfirmationDialog v-model="leaveDialog" action="leave" @onConfirm="confirmLeave" />

    <BatchConfirmationDialog
      v-if="pendingWorkflowAction && pendingWorkflowAction !== 'unprocess' && pendingWorkflowAction !== 'reopen'"
      v-model="workflowDialog"
      :action="pendingWorkflowAction"
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
  </div>
</template>

<style scoped>
.payment-order-settle-page--with-bar {
  padding-bottom: 88px;
}

.settle-card {
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.settle-card__header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 16px 20px;
}

.settle-card__header-icon {
  color: #475569;
  font-size: 20px;
}

.settle-card__search {
  max-width: 340px;
  min-width: 220px;
}

.settle-card__toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 8px 20px;
}

.settle-card__filter-count {
  background: rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 6px;
  padding: 0 6px;
}

.settle-card__bulk {
  align-items: center;
  background: #f1f7ff;
  border-bottom: 1px solid #dbeafe;
  border-top: 1px solid #dbeafe;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 20px;
}

.settle-table-wrapper {
  overflow-x: auto;
}

.settle-table :deep(table) {
  width: 100%;
}

.settle-table :deep(thead th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec !important;
  color: #334155 !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  height: 40px !important;
  line-height: 1.25;
  padding: 0 8px !important;
}

.settle-table :deep(tbody td),
.settle-table :deep(tfoot td) {
  color: #334155;
  font-size: 0.78rem;
  padding: 6px 8px !important;
  vertical-align: middle;
}

.settle-table :deep(tbody td) {
  border-bottom: 1px solid #eef2f7 !important;
}

.settle-table :deep(th:first-child),
.settle-table :deep(td:first-child) {
  padding-left: 16px !important;
}

.settle-table :deep(th:last-child),
.settle-table :deep(td:last-child) {
  padding-right: 12px !important;
}

.settle-table__select {
  width: 40px;
}

.settle-table__employee {
  line-height: 1.3;
}

.settle-table__sub {
  font-size: 0.7rem;
}

.settle-table__amount {
  width: 140px;
}

.settle-table__notes {
  min-width: 140px;
}

.settle-table__input :deep(.v-field) {
  font-size: 0.78rem;
}

.settle-table__input :deep(.v-field__input) {
  min-height: 32px;
  padding-bottom: 4px;
  padding-top: 4px;
}

.settle-table__input :deep(.v-text-field__suffix) {
  font-size: 0.72rem;
  min-height: 32px;
  padding-bottom: 4px;
  padding-top: 4px;
}

.settle-table__input :deep(.v-messages__message) {
  font-size: 0.68rem;
  line-height: 1.2;
}

.settle-table__row-actions {
  white-space: nowrap;
  width: 64px;
}

.settle-table__row--dirty td {
  background: #fffbeb;
}

.settle-table__row--dirty td:first-child {
  box-shadow: inset 3px 0 0 #f59e0b;
}

.settle-table__input--warning :deep(.v-messages__message) {
  color: #ef6c00;
}

.settle-table__totals td {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  font-weight: 700;
}

.settle-action-bar {
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  bottom: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  left: 50%;
  max-width: calc(100% - 32px);
  padding: 12px 16px;
  position: fixed;
  transform: translateX(-50%);
  width: 920px;
  z-index: 1005;
}

.min-w-0 {
  min-width: 0;
}
</style>
