<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { paymentOrderPeriodService } from "@/app/http/httpServiceProvider";
import { formatAmount } from "@/components/paymentOrderPeriod/lines/utils";
import { formatIsoDate } from "@/components/paymentOrderPeriod/listView/utils";
import type { PaymentOrderPeriodId, PaymentOrderPeriodInvoice } from "@/components/paymentOrderPeriod/types";

const props = defineProps<{
  periodId: PaymentOrderPeriodId;
}>();

const route = useRoute();
const router = useRouter();
const invoices = ref<PaymentOrderPeriodInvoice[]>([]);
const loading = ref(false);
const loadError = ref(false);

const destinationLabel = (value?: string | null) =>
  value ? `t-payment-order-ledger-${value.toLowerCase().replace(/_/g, "-")}` : "";

const openInvoice = (invoiceId?: string | null) => {
  if (!invoiceId) return;
  const href = router.resolve({
    name: "ViewInvoice",
    params: { id: invoiceId },
    query: {
      returnTo: route.fullPath,
      returnTitle: "view-payment-order-batch",
    },
  }).href;
  window.open(href, "_blank", "noopener");
};

const load = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    invoices.value = await paymentOrderPeriodService.getPaymentOrderPeriodInvoices(props.periodId);
  } catch (error) {
    console.error("Erro ao carregar facturas do período:", error);
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
      <i class="ph-warning-circle me-1" /> {{ $t("t-payment-order-period-invoices-load-error") }}
      <div class="mt-3">
        <v-btn color="primary" variant="tonal" size="small" @click="load">
          <i class="ph-arrow-clockwise me-1" /> {{ $t("t-retry") }}
        </v-btn>
      </div>
    </div>

    <div v-else-if="!loading && !invoices.length" class="text-center py-10 text-medium-emphasis">
      {{ $t("t-payment-order-period-invoices-empty") }}
    </div>

    <div v-else-if="invoices.length" class="view-table-wrapper">
      <v-table density="compact" class="view-table">
        <thead>
          <tr>
            <th>{{ $t("t-invoice-number") }}</th>
            <th>{{ $t("t-date") }}</th>
            <th>{{ $t("t-employee") }}</th>
            <th>{{ $t("t-service-provider") }}</th>
            <th>{{ $t("t-payment-order-integration-ledger") }}</th>
            <th class="text-right">{{ $t("t-billed-amount") }}</th>
            <th class="text-right">{{ $t("t-amount-covered") }}</th>
            <th>{{ $t("t-payment-order-external-batch-number") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoices" :key="item.id">
            <td>
              <button
                v-if="item.invoiceId"
                type="button"
                class="invoice-link"
                @click="openInvoice(item.invoiceId)"
              >
                {{ item.invoiceNumber || "-" }}
              </button>
              <span v-else>{{ item.invoiceNumber || "-" }}</span>
            </td>
            <td class="text-no-wrap">{{ formatIsoDate(item.serviceProvisionDate) }}</td>
            <td>{{ item.employeeName || item.employeeNumber || "-" }}</td>
            <td>{{ item.serviceProviderName || "-" }}</td>
            <td>{{ item.destination ? $t(destinationLabel(item.destination)) : "-" }}</td>
            <td class="text-right text-no-wrap">{{ formatAmount(item.billedAmount) }}</td>
            <td class="text-right text-no-wrap">{{ formatAmount(item.amountCovered) }}</td>
            <td>{{ item.externalBatchNumber || "-" }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<style scoped>
.invoice-link {
  background: none;
  border: 0;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
}
</style>
