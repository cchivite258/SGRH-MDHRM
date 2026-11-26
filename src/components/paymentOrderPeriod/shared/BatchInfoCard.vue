<script lang="ts" setup>
import { computed } from "vue";
import Status from "@/app/common/components/Status.vue";
import {
  contractLabel,
  formatIsoDate,
  formatMonthYear,
  statusChipValue,
  statusChipVariant,
  statusLabelKey,
} from "@/components/paymentOrderPeriod/listView/utils";
import {
  computeTotals,
  formatDateTime,
  settlementPercent,
} from "@/components/paymentOrderPeriod/lines/utils";
import type { PaymentOrderLine, PaymentOrderPeriodListing } from "@/components/paymentOrderPeriod/types";

const props = defineProps<{
  period: PaymentOrderPeriodListing;
  lines?: PaymentOrderLine[];
  showSettlementProgress?: boolean;
}>();

const percent = computed(() => settlementPercent(computeTotals(props.lines ?? [])));
const progressColor = computed(() => (percent.value >= 100 ? "success" : percent.value > 0 ? "primary" : "secondary"));

const infoItems = computed(() => [
  { label: "t-contract", value: contractLabel(props.period), icon: "ph-buildings" },
  { label: "t-period", value: formatMonthYear(props.period.month, props.period.year), icon: "ph-calendar-blank" },
  { label: "t-start-date", value: formatIsoDate(props.period.startDate), icon: "ph-calendar-check" },
  { label: "t-end-date", value: formatIsoDate(props.period.endDate), icon: "ph-calendar-x" },
  { label: "t-payment-order-generated-at", value: formatDateTime(props.period.generatedAt), icon: "ph-rows", hidden: !props.period.generatedAt },
  { label: "t-payment-order-processed-at", value: formatDateTime(props.period.processedAt), icon: "ph-gear-six", hidden: !props.period.processedAt },
  { label: "t-payment-order-posted-at", value: formatDateTime(props.period.postedAt), icon: "ph-check-circle", hidden: !props.period.postedAt },
  { label: "t-payment-order-external-batch-number", value: props.period.externalBatchNumber || "-", icon: "ph-hash", hidden: !props.period.externalBatchNumber },
  { label: "t-payment-order-external-payables-batch-number", value: props.period.externalPayablesBatchNumber || "-", icon: "ph-hash", hidden: !props.period.externalPayablesBatchNumber },
  { label: "t-payment-order-sent-at", value: formatDateTime(props.period.sentAt), icon: "ph-paper-plane-tilt", hidden: !props.period.sentAt },
].filter(item => !item.hidden));
</script>

<template>
  <v-card class="batch-info-card" elevation="0">
    <div class="batch-info-card__header">
      <div class="d-flex align-center ga-3 min-w-0">
        <v-avatar size="38" rounded="lg" color="primary" variant="tonal">
          <i class="ph-stack" style="font-size: 20px" />
        </v-avatar>
        <div class="min-w-0">
          <div class="batch-info-card__eyebrow text-medium-emphasis text-uppercase font-weight-bold">
            {{ $t("t-payment-order-batch-info") }}
          </div>
          <div class="d-flex align-center ga-2 min-w-0">
            <span class="text-subtitle-1 font-weight-bold text-truncate">{{ contractLabel(period) }}</span>
            <Status
              :status="statusChipValue(period.status)"
              :variant="statusChipVariant(period.status)"
              :label="$t(statusLabelKey(period.status))"
            />
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ formatMonthYear(period.month, period.year) }}
          </div>
        </div>
      </div>

      <div class="d-flex align-center flex-wrap ga-2 justify-end">
        <slot name="actions" />
      </div>
    </div>

    <v-divider />

    <v-card-text class="px-4 py-3">
      <v-row dense>
        <v-col v-for="item in infoItems" :key="item.label" cols="12" sm="6" md>
          <div class="batch-info-card__info">
            <i :class="[item.icon, 'batch-info-card__info-icon']" />
            <div class="min-w-0">
              <div class="batch-info-card__label text-medium-emphasis">{{ $t(item.label) }}</div>
              <div class="batch-info-card__value font-weight-medium text-truncate" :title="item.value">{{ item.value }}</div>
            </div>
          </div>
        </v-col>
        <v-col v-if="period.notes" cols="12">
          <div class="batch-info-card__info">
            <i class="ph-note batch-info-card__info-icon" />
            <div class="min-w-0">
              <div class="batch-info-card__label text-medium-emphasis">{{ $t("t-notes") }}</div>
              <div class="batch-info-card__value">{{ period.notes }}</div>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-alert
        v-if="period.integrationError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ period.integrationError }}
      </v-alert>

      <div v-if="showSettlementProgress && lines?.length" class="mt-3">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="batch-info-card__label font-weight-bold text-medium-emphasis">
            {{ $t("t-payment-order-settlement-progress") }}
          </span>
          <span class="batch-info-card__label font-weight-bold">{{ percent }}%</span>
        </div>
        <v-progress-linear :model-value="percent" :color="progressColor" height="6" rounded bg-color="grey-lighten-2" />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.batch-info-card {
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.batch-info-card__header {
  align-items: center;
  background: linear-gradient(to right, #f8fafc, #ffffff);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 16px;
}

.batch-info-card__eyebrow {
  font-size: 10px;
  letter-spacing: 0.04em;
  line-height: 1.4;
}

.batch-info-card__info {
  align-items: flex-start;
  display: flex;
  gap: 8px;
  padding: 2px 0;
}

.batch-info-card__info-icon {
  color: #64748b;
  font-size: 16px;
  margin-top: 1px;
}

.batch-info-card__label {
  font-size: 11px;
  line-height: 1.4;
}

.batch-info-card__value {
  font-size: 13px;
  line-height: 1.4;
}

.min-w-0 {
  min-width: 0;
}
</style>
