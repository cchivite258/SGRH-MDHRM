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

const props = withDefaults(defineProps<{
  lines: PaymentOrderLine[];
  mode?: "summary" | "settlement";
}>(), {
  mode: "summary",
});

const summaries = computed(() =>
  (["REFUND", "DEDUCTION"] as PaymentOrderLineType[]).map(type => {
    const totals = computeTotals(props.lines.filter(line => line.type === type));
    return {
      type,
      totals,
      amount: type === "REFUND" ? totals.totalRefund : totals.totalDeduction,
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
          <div class="type-summary-card__row" :class="{ 'mb-3': mode === 'settlement' }">
            <div class="d-flex align-center ga-3 min-w-0">
              <v-avatar size="40" rounded="lg" :color="lineTypeColor(summary.type)" variant="tonal">
                <i :class="lineTypeIcon(summary.type)" style="font-size: 22px" />
              </v-avatar>
              <div class="min-w-0">
                <div class="font-weight-bold text-truncate">
                  {{ summary.type === "REFUND" ? $t("t-payment-order-refunds") : $t("t-payment-order-deductions") }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  <template v-if="mode === 'settlement'">
                    {{ $t("t-payment-order-settled-lines", { settled: summary.settled, total: summary.totals.lines }) }}
                  </template>
                  <template v-else>
                    {{ summary.totals.lines }} {{ $t("t-payment-order-lines") }}
                  </template>
                </div>
              </div>
            </div>
            <div v-if="mode === 'summary'" class="type-summary-card__amount text-no-wrap">
              {{ formatAmount(summary.amount) }}
            </div>
            <span v-else class="text-h6 font-weight-bold">{{ summary.percent }}%</span>
          </div>

          <template v-if="mode === 'settlement'">
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
                <div
                  class="type-summary-card__value"
                  :class="Math.round(summary.totals.balance * 100) !== 0 ? 'text-warning' : ''"
                >
                  {{ formatAmount(summary.totals.balance) }}
                </div>
              </div>
            </div>
          </template>
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

.type-summary-card__row {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.type-summary-card__amount {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
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
  .type-summary-card__row {
    align-items: flex-start;
    flex-direction: column;
  }

  .type-summary-card__values {
    grid-template-columns: 1fr;
  }
}
</style>
