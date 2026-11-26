<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { paymentOrderPeriodService } from "@/app/http/httpServiceProvider";
import { formatDateTime } from "@/components/paymentOrderPeriod/lines/utils";
import type { PaymentOrderIntegrationAttempt, PaymentOrderPeriodId } from "@/components/paymentOrderPeriod/types";

const props = defineProps<{
  periodId: PaymentOrderPeriodId;
}>();

const attempts = ref<PaymentOrderIntegrationAttempt[]>([]);
const loading = ref(false);
const loadError = ref(false);

const sortedAttempts = computed(() =>
  [...attempts.value].sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""))
);

const enumLabel = (group: string, value?: string | null) =>
  value ? `t-payment-order-${group}-${value.toLowerCase().replace(/_/g, "-")}` : "";

const load = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    attempts.value = await paymentOrderPeriodService.getPaymentOrderPeriodIntegrationAttempts(props.periodId);
  } catch (error) {
    console.error("Erro ao carregar tentativas de integração:", error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

defineExpose({ load });

onMounted(load);
</script>

<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" height="2" />

    <div v-if="loadError" class="text-center py-10 text-medium-emphasis">
      <i class="ph-warning-circle me-1" /> {{ $t("t-payment-order-integration-attempts-load-error") }}
      <div class="mt-3">
        <v-btn color="primary" variant="tonal" size="small" @click="load">
          <i class="ph-arrow-clockwise me-1" /> {{ $t("t-retry") }}
        </v-btn>
      </div>
    </div>

    <div v-else-if="!loading && !attempts.length" class="text-center py-10 text-medium-emphasis">
      {{ $t("t-payment-order-integration-attempts-empty") }}
    </div>

    <div v-else-if="attempts.length" class="view-table-wrapper">
      <v-table density="compact" class="view-table">
        <thead>
          <tr>
            <th>{{ $t("t-payment-order-integration-attempt") }}</th>
            <th>{{ $t("t-payment-order-integration-ledger") }}</th>
            <th>{{ $t("t-payment-order-integration-operation") }}</th>
            <th>{{ $t("t-payment-order-integration-outcome") }}</th>
            <th>{{ $t("t-payment-order-external-batch-number") }}</th>
            <th>{{ $t("t-payment-order-history-message") }}</th>
            <th>{{ $t("t-payment-order-history-performed-by") }}</th>
            <th>{{ $t("t-payment-order-integration-started-at") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedAttempts" :key="item.id">
            <td>{{ item.attempt ?? "-" }}</td>
            <td>{{ item.ledger ? $t(enumLabel("ledger", item.ledger)) : "-" }}</td>
            <td>{{ item.operation ? $t(enumLabel("operation", item.operation)) : "-" }}</td>
            <td>{{ item.outcome ? $t(enumLabel("outcome", item.outcome)) : "-" }}</td>
            <td>{{ item.externalBatchNumber || item.reference || "-" }}</td>
            <td>{{ item.message || "-" }}</td>
            <td>{{ item.triggeredBy || "-" }}</td>
            <td class="text-no-wrap">{{ formatDateTime(item.startedAt) }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>
