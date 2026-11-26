<script lang="ts" setup>
import { PropType, computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Status from "@/app/common/components/Status.vue";
import { invoiceService } from "@/app/http/httpServiceProvider";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import { formatIsoDate } from "@/components/paymentOrderPeriod/listView/utils";
import {
  employeeName,
  employeeNumber,
  formatAmount,
  lineTypeLabelKey,
  lineTypeStatusValue,
  toAmount,
} from "@/components/paymentOrderPeriod/lines/utils";
import type {
  PaymentOrderInvoiceSummary,
  PaymentOrderLine,
  PaymentOrderLineDetail,
} from "@/components/paymentOrderPeriod/types";
import type { InvoiceResponseType } from "@/components/invoice/types";

const emit = defineEmits(["update:modelValue"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<PaymentOrderLine>,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const { can } = usePermissions();

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const invoices = reactive<Record<string, PaymentOrderInvoiceSummary | InvoiceResponseType | null>>({});
const loading = ref(false);

/** ERP devolve 1 linha por factura; reembolsos mantêm details[]. */
const details = computed<PaymentOrderLineDetail[]>(() => {
  if (prop.data.details?.length) return prop.data.details;

  if (prop.data.invoiceId || prop.data.invoice) {
    return [{
      id: prop.data.id,
      invoiceId: prop.data.invoiceId ?? prop.data.invoice?.id ?? null,
      type: prop.data.type ?? null,
      amount:
        prop.data.memberPaidAmount
        ?? prop.data.amountToPay
        ?? prop.data.billedAmount
        ?? null,
      invoice: prop.data.invoice ?? null,
    }];
  }

  return [];
});

const canViewInvoice = computed(() => can(PERMISSIONS.INVOICES.VIEW));

const seedIncludedInvoices = () => {
  details.value.forEach(detail => {
    const invoiceId = detail.invoiceId ?? detail.invoice?.id;
    const included = detail.invoice
      ?? (invoiceId && invoiceId === prop.data.invoiceId ? prop.data.invoice : null);
    if (invoiceId && included && !(invoiceId in invoices)) {
      invoices[invoiceId] = included;
    }
  });
};

const loadInvoices = async () => {
  seedIncludedInvoices();

  const pendingIds = [...new Set(
    details.value
      .map(detail => detail.invoiceId ?? detail.invoice?.id)
      .filter((id): id is string => !!id)
  )].filter(id => !(id in invoices) || invoices[id] == null);

  if (!pendingIds.length) return;

  loading.value = true;
  try {
    const results = await Promise.allSettled(pendingIds.map(id => invoiceService.getInvoiceById(id)));
    results.forEach((result, index) => {
      invoices[pendingIds[index]] = result.status === "fulfilled" ? result.value.data ?? null : null;
    });
  } finally {
    loading.value = false;
  }
};

watch(
  () => [prop.modelValue, prop.data.id] as const,
  ([open]) => {
    if (open) loadInvoices();
  },
  { immediate: true }
);

const beneficiaryName = (invoice: PaymentOrderInvoiceSummary | InvoiceResponseType) => {
  const person = ("isEmployeeInvoice" in invoice && invoice.isEmployeeInvoice === false)
    ? invoice.dependent
    : invoice.employee;
  const fromPerson = [person?.firstName, person?.lastName].filter(Boolean).join(" ");
  return fromPerson || employeeName(prop.data);
};

const rows = computed(() =>
  details.value.map(detail => {
    const invoiceId = detail.invoiceId ?? detail.invoice?.id ?? null;
    const invoice = (invoiceId ? invoices[invoiceId] : null) ?? detail.invoice ?? null;
    return {
      detail: { ...detail, invoiceId },
      invoice: invoice && {
        number: invoice.invoiceNumber || prop.data.invoiceNumber || "-",
        issueDate: formatIsoDate(invoice.issueDate ? String(invoice.issueDate) : null),
        serviceProvider:
          ("serviceProvider" in invoice && invoice.serviceProvider?.name)
          || prop.data.serviceProviderName
          || "-",
        beneficiary: beneficiaryName(invoice),
        status: ("invoiceStatus" in invoice && invoice.invoiceStatus) || "",
        totalAmount: invoice.totalAmount ?? prop.data.billedAmount,
      },
    };
  })
);

const totalAmount = computed(() =>
  rows.value.reduce((total, row) => total + toAmount(row.invoice?.totalAmount), 0)
);

const openInvoice = (invoiceId?: string | null) => {
  if (!invoiceId) return;
  const href = router.resolve({
    name: "ViewInvoice",
    params: { id: invoiceId },
    query: { returnTo: route.fullPath, returnTitle: "view-payment-order-batch" },
  }).href;
  window.open(href, "_blank", "noopener");
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="960" scrollable>
    <Card :title="$t('t-payment-order-line-invoices')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <div class="line-summary">
          <div class="line-summary__employee">
            <div class="font-weight-bold text-truncate">{{ employeeName(data) }}</div>
            <div class="text-caption text-medium-emphasis">{{ employeeNumber(data) }}</div>
          </div>
          <div class="d-flex align-center flex-shrink-0 ga-4">
            <Status v-if="data.type" :status="lineTypeStatusValue(data.type)" :label="$t(lineTypeLabelKey(data.type))" />
            <div class="text-right">
              <div class="line-summary__label">{{ $t("t-payment-order-amount-to-pay") }}</div>
              <div class="font-weight-bold">{{ formatAmount(data.amountToPay) }}</div>
            </div>
          </div>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="primary" height="2" class="mt-3" />

        <div v-if="!details.length" class="text-center py-10 text-medium-emphasis">
          <v-avatar size="56" color="secondary" variant="tonal">
            <i class="ph-receipt" style="font-size: 26px" />
          </v-avatar>
          <div class="mt-3">{{ $t("t-payment-order-no-invoices") }}</div>
        </div>

        <v-table v-else density="compact" class="invoices-table mt-3">
          <thead>
            <tr>
              <th>{{ $t("t-invoice-number") }}</th>
              <th>{{ $t("t-issue-date") }}</th>
              <th>{{ $t("t-service-provider") }}</th>
              <th>{{ $t("t-payment-order-beneficiary") }}</th>
              <th>{{ $t("t-status") }}</th>
              <th class="text-right">{{ $t("t-total-amount") }}</th>
              <th v-if="canViewInvoice" class="text-center">{{ $t("t-action") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{ detail, invoice } in rows" :key="detail.id">
              <template v-if="invoice">
                <td class="font-weight-medium">{{ invoice.number }}</td>
                <td class="text-no-wrap">{{ invoice.issueDate }}</td>
                <td>{{ invoice.serviceProvider }}</td>
                <td>{{ invoice.beneficiary }}</td>
                <td><Status :status="invoice.status" /></td>
                <td class="text-right text-no-wrap">{{ formatAmount(invoice.totalAmount) }}</td>
              </template>
              <td v-else colspan="6" class="text-medium-emphasis">
                <span v-if="loading">{{ $t("t-payment-order-invoice-loading") }}</span>
                <span v-else><i class="ph-warning-circle me-1" />{{ $t("t-payment-order-invoice-load-error") }}</span>
              </td>
              <td v-if="canViewInvoice" class="invoices-table__actions">
                <v-tooltip v-if="detail.invoiceId" :text="$t('t-view-invoice')" location="top">
                  <template #activator="{ props: tipProps }">
                    <v-btn
                      v-bind="tipProps"
                      icon="ph-arrow-square-out"
                      color="primary"
                      density="compact"
                      variant="tonal"
                      rounded
                      @click="openInvoice(detail.invoiceId)"
                    />
                  </template>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="invoices-table__totals">
              <td colspan="5">
                {{ $t("t-totals") }}
                <span class="text-caption text-medium-emphasis">({{ details.length }})</span>
              </td>
              <td class="text-right text-no-wrap">{{ formatAmount(totalAmount) }}</td>
              <td v-if="canViewInvoice" />
            </tr>
          </tfoot>
        </v-table>
      </v-card-text>

      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>

<style scoped>
.line-summary {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 14px;
}

.line-summary__employee {
  flex: 1 1 auto;
  min-width: 0;
}

.line-summary__label {
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.invoices-table :deep(thead th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec !important;
  color: #334155 !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  padding: 0 8px !important;
}

.invoices-table :deep(tbody td),
.invoices-table :deep(tfoot td) {
  color: #334155;
  font-size: 0.78rem;
  padding: 0 8px !important;
}

.invoices-table__actions {
  text-align: center;
  width: 56px;
}

.invoices-table__actions :deep(.d-flex) {
  justify-content: center !important;
}

.invoices-table__totals td {
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
  font-weight: 700;
}
</style>
