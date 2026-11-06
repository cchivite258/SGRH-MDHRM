<script lang="ts" setup>
import { computed } from "vue";
import {
  computeTotals,
  formatAmount,
  lineTypeColor,
  lineTypeIcon,
  settlementPercent,
} from "@/components/paymentOrderPeriod/lines/utils";
import type { PaymentOrderLine, PaymentOrderLineType } from "@/components/paymentOrderPeriod/types";

const props = defineProps<{
  lines: PaymentOrderLine[];
}>();

const summaries = computed(() =>
  (["REFUND", "DEDUCTION"] as PaymentOrderLineType[]).map(type => {
    const typeLines = props.lines.filter(line => line.type === type);
    const totals = computeTotals(typeLines);
    return {
      type,
      totals,
      settled: totals.settledLines,
      percent: settlementPercent(totals),
    };
  })
);
</script>

<template>
  <v-row>
    <v-col v-for="summary in summaries" :key="summary.type" cols="12" md="6">
      <v-card class="type-summary-card h-100" elevation="0">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="d-flex align-center ga-2">
              <v-avatar size="36" rounded="lg" :color="lineTypeColor(summary.type)" variant="tonal">
                <i :class="lineTypeIcon(summary.type)" style="font-size: 20px" />
              </v-avatar>
              <div>
                <div class="font-weight-bold">
                  {{ summary.type === "REFUND" ? $t("t-payment-order-refunds") : $t("t-payment-order-deductions") }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t("t-payment-order-settled-lines", { settled: summary.settled, total: summary.totals.lines }) }}
                </div>
              </div>
            </div>
            <span class="text-h6 font-weight-bold">{{ summary.percent }}%</span>
          </div>
          <v-progress-linear
            :model-value="summary.percent"
            :color="lineTypeColor(summary.type)"
            height="6"
            rounded
            bg-color="grey-lighten-2"
          />
          <div class="type-summary-card__values mt-3">
            <div>
              <div class="type-summary-card__label">{{ $t("t-payment-order-amount-to-pay") }}</div>
              <div class="type-summary-card__value">{{ formatAmount(summary.totals.amountToPay) }}</div>
            </div>
            <div>
              <div class="type-summary-card__label">{{ $t("t-payment-order-amount-settled") }}</div>
              <div class="type-summary-card__value text-success">{{ formatAmount(summary.totals.amountSettled) }}</div>
            </div>
            <div>
              <div class="type-summary-card__label">{{ $t("t-payment-order-balance") }}</div>
              <div class="type-summary-card__value" :class="Math.round(summary.totals.balance * 100) !== 0 ? 'text-warning' : ''">
                {{ formatAmount(summary.totals.balance) }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.type-summary-card {
  border: 1px solid #e8edf3;
  border-radius: 14px;
}

.type-summary-card__values {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.type-summary-card__label {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.type-summary-card__value {
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
}

.h-100 {
  height: 100%;
}

@media (max-width: 600px) {
  .type-summary-card__values {
    grid-template-columns: 1fr;
  }
}
</style>
