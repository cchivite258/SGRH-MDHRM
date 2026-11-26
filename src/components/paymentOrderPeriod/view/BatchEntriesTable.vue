<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import Status from "@/app/common/components/Status.vue";
import { paymentOrderPeriodService } from "@/app/http/httpServiceProvider";
import LinesPagination from "@/components/paymentOrderPeriod/shared/LinesPagination.vue";
import { formatAmount, toAmount } from "@/components/paymentOrderPeriod/lines/utils";
import type {
  PaymentOrderEntry,
  PaymentOrderEntryDirection,
  PaymentOrderPeriodId,
} from "@/components/paymentOrderPeriod/types";

const props = defineProps<{
  periodId: PaymentOrderPeriodId;
}>();

const grouped = ref(false);
const entries = ref<PaymentOrderEntry[]>([]);
const loading = ref(false);
const loadError = ref(false);
const page = ref(1);
const itemsPerPage = ref(10);

const directionChip: Record<PaymentOrderEntryDirection, string> = {
  DEBIT: "DRAFT",
  CREDIT: "open",
};

const totals = computed(() =>
  entries.value.reduce(
    (sum, entry) => {
      if (entry.direction === "DEBIT") sum.debit += toAmount(entry.amount);
      if (entry.direction === "CREDIT") sum.credit += toAmount(entry.amount);
      return sum;
    },
    { debit: 0, credit: 0 }
  )
);

const paginatedEntries = computed(() =>
  entries.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const load = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    entries.value = await paymentOrderPeriodService.getPaymentOrderPeriodEntries(props.periodId, grouped.value);
    page.value = 1;
  } catch (error) {
    console.error("Erro ao carregar lançamentos contabilísticos do lote:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

watch(grouped, load);

defineExpose({ load });

onMounted(load);
</script>

<template>
  <div>
    <div class="entries-toolbar">
      <v-btn-toggle v-model="grouped" mandatory density="compact" variant="outlined" divided color="primary">
        <v-btn :value="false" size="small">{{ $t("t-payment-order-entries-detailed") }}</v-btn>
        <v-btn :value="true" size="small">{{ $t("t-payment-order-entries-grouped") }}</v-btn>
      </v-btn-toggle>

      <div v-if="entries.length" class="d-flex ga-4 text-caption">
        <span>
          {{ $t("t-payment-order-entries-total-debit") }}:
          <b>{{ formatAmount(totals.debit) }}</b>
        </span>
        <span>
          {{ $t("t-payment-order-entries-total-credit") }}:
          <b>{{ formatAmount(totals.credit) }}</b>
        </span>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" height="2" />

    <div v-if="loadError" class="text-center py-10 text-medium-emphasis">
      <i class="ph-warning-circle me-1" /> {{ $t("t-payment-order-entries-load-error") }}
      <div class="mt-3">
        <v-btn color="primary" variant="tonal" size="small" @click="load">
          <i class="ph-arrow-clockwise me-1" /> {{ $t("t-retry") }}
        </v-btn>
      </div>
    </div>

    <div v-else-if="!loading && !entries.length" class="text-center py-10">
      <v-avatar size="56" color="secondary" variant="tonal">
        <i class="ph-book-open" style="font-size: 26px" />
      </v-avatar>
      <div class="mt-3 text-medium-emphasis">{{ $t("t-payment-order-entries-empty") }}</div>
    </div>

    <template v-else-if="entries.length">
      <div class="entries-table-wrapper">
        <v-table density="compact" class="entries-table">
          <thead>
            <tr>
              <th>{{ $t("t-invoice-number") }}</th>
              <th>{{ $t("t-employee-number") }}</th>
              <th>{{ $t("t-payment-order-entry-role") }}</th>
              <th>{{ $t("t-payment-order-entry-account") }}</th>
              <th>{{ $t("t-payment-order-entry-source-ledger") }}</th>
              <th>{{ $t("t-payment-order-entry-source-type") }}</th>
              <th>{{ $t("t-payment-order-entry-direction") }}</th>
              <th class="text-right">{{ $t("t-amount") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in paginatedEntries" :key="entry.id || `${page}-${index}`">
              <td class="font-weight-medium">{{ entry.invoiceNumber || "-" }}</td>
              <td>{{ entry.employeeNumber || "-" }}</td>
              <td>{{ entry.role ? $t(`t-payment-order-entry-role-${entry.role.toLowerCase()}`) : "-" }}</td>
              <td class="entries-table__account">{{ entry.accountNumber || "-" }}</td>
              <td>{{ entry.sourceLedger || "-" }}</td>
              <td>{{ entry.sourceType || "-" }}</td>
              <td>
                <Status
                  v-if="entry.direction"
                  :status="directionChip[entry.direction]"
                  :label="$t(`t-payment-order-entry-direction-${entry.direction.toLowerCase()}`)"
                />
                <span v-else>-</span>
              </td>
              <td class="text-right text-no-wrap font-weight-bold">{{ formatAmount(entry.amount) }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <LinesPagination
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :total-items="entries.length"
      />
    </template>
  </div>
</template>

<style scoped>
.entries-toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 8px 20px;
}

.entries-table-wrapper {
  overflow-x: auto;
}

.entries-table :deep(thead th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec !important;
  color: #334155 !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  padding: 0 8px !important;
}

.entries-table :deep(tbody td) {
  border-bottom: 1px solid #eef2f7 !important;
  color: #334155;
  font-size: 0.78rem;
  padding: 0 8px !important;
}

.entries-table :deep(th:first-child),
.entries-table :deep(td:first-child) {
  padding-left: 20px !important;
}

.entries-table :deep(th:last-child),
.entries-table :deep(td:last-child) {
  padding-right: 20px !important;
}

.entries-table__account {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
</style>
