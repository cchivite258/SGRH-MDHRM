<script lang="ts" setup>
import { PropType, computed } from "vue";
import Status from "@/app/common/components/Status.vue";
import { formatIsoDate } from "@/components/paymentOrderPeriod/listView/utils";
import {
  employeeName,
  employeeNumber,
  formatAmount,
  isLineSettled,
  lineBalance,
  lineTypeLabelKey,
  lineTypeStatusValue,
  settledAmount,
} from "@/components/paymentOrderPeriod/lines/utils";
import type { PaymentOrderLine } from "@/components/paymentOrderPeriod/types";

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

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const amounts = computed(() => [
  { label: "t-payment-order-total-refund", value: prop.data.totalRefund },
  { label: "t-payment-order-total-deduction", value: prop.data.totalDeduction },
  { label: "t-payment-order-previous-balance", value: prop.data.previousBalance },
  { label: "t-payment-order-amount-to-pay", value: prop.data.amountToPay, strong: true },
  { label: "t-payment-order-amount-settled", value: settledAmount(prop.data), color: "text-success" },
]);
</script>

<template>
  <v-dialog v-model="dialogValue" width="640" scrollable>
    <Card :title="$t('t-view-payment-order-line')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-employee") }}</div>
            <div>{{ employeeName(data) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-employee-number") }}</div>
            <div>{{ employeeNumber(data) }}</div>
          </v-col>

          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-notes") }}</div>
            <div class="line-notes" :class="{ 'line-notes--empty': !data.notes }">
              <i class="ph-note line-notes__icon" />
              <span class="text-pre-wrap">{{ data.notes || $t("t-payment-order-no-notes") }}</span>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-type") }}</div>
            <Status v-if="data.type" :status="lineTypeStatusValue(data.type)" :label="$t(lineTypeLabelKey(data.type))" />
            <div v-else>-</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-period") }}</div>
            <div>{{ formatIsoDate(data.startDate) }} - {{ formatIsoDate(data.endDate) }}</div>
          </v-col>

          <v-col v-for="amount in amounts" :key="amount.label" cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t(amount.label) }}</div>
            <div :class="[amount.color, { 'font-weight-bold': amount.strong }]">{{ formatAmount(amount.value) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-payment-order-balance") }}</div>
            <div class="font-weight-bold" :class="isLineSettled(data) ? 'text-success' : 'text-warning'">
              {{ formatAmount(lineBalance(data)) }}
            </div>
          </v-col>
        </v-row>
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
.line-notes {
  align-items: flex-start;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  min-height: 44px;
  padding: 10px 12px;
}

.line-notes--empty {
  color: #94a3b8;
  font-style: italic;
}

.line-notes__icon {
  color: #64748b;
  font-size: 18px;
  margin-top: 1px;
}
</style>
