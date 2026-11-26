<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import Status from "@/app/common/components/Status.vue";
import { formatDateTime } from "@/components/paymentOrderPeriod/lines/utils";
import {
  statusChipValue,
  statusChipVariant,
  statusLabelKey,
  type ProcessSection,
} from "@/components/paymentOrderPeriod/listView/utils";
import { periodServiceFor } from "@/components/paymentOrderPeriod/shared/sectionApi";
import type { PaymentOrderPeriodHistory, PaymentOrderPeriodId } from "@/components/paymentOrderPeriod/types";

const props = withDefaults(defineProps<{
  periodId: PaymentOrderPeriodId;
  section?: ProcessSection;
}>(), {
  section: "erp-integration",
});

const history = ref<PaymentOrderPeriodHistory[]>([]);
const loading = ref(false);
const loadError = ref(false);

const sortedHistory = computed(() =>
  [...history.value].sort((a, b) => (b.performedAt ?? "").localeCompare(a.performedAt ?? ""))
);

const actionLabelKey = (action: PaymentOrderPeriodHistory["action"]) =>
  `t-payment-order-history-action-${action.toLowerCase()}`;

const load = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    history.value = await periodServiceFor(props.section).getPaymentOrderPeriodHistory(props.periodId);
  } catch (error) {
    console.error("Erro ao carregar histórico do lote:", error);
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
      <i class="ph-warning-circle me-1" /> {{ $t("t-payment-order-history-load-error") }}
      <div class="mt-3">
        <v-btn color="primary" variant="tonal" size="small" @click="load">
          <i class="ph-arrow-clockwise me-1" /> {{ $t("t-retry") }}
        </v-btn>
      </div>
    </div>

    <div v-else-if="!loading && !history.length" class="text-center py-10">
      <v-avatar size="56" color="secondary" variant="tonal">
        <i class="ph-clock-counter-clockwise" style="font-size: 26px" />
      </v-avatar>
      <div class="mt-3 text-medium-emphasis">{{ $t("t-payment-order-history-empty") }}</div>
    </div>

    <div v-else-if="history.length" class="history-table-wrapper">
      <v-table density="compact" class="history-table">
        <thead>
          <tr>
            <th>{{ $t("t-payment-order-history-performed-at") }}</th>
            <th>{{ $t("t-payment-order-history-action") }}</th>
            <th>{{ $t("t-payment-order-history-transition") }}</th>
            <th>{{ $t("t-payment-order-history-performed-by") }}</th>
            <th>{{ $t("t-payment-order-history-result") }}</th>
            <th>{{ $t("t-payment-order-history-message") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedHistory" :key="item.id">
            <td class="text-no-wrap">{{ formatDateTime(item.performedAt) }}</td>
            <td class="font-weight-medium">{{ $t(actionLabelKey(item.action)) }}</td>
            <td>
              <div class="history-transition">
                <template v-if="item.previousStatus">
                  <span class="history-transition__chip">
                    <Status
                      :status="statusChipValue(item.previousStatus)"
                      :variant="statusChipVariant(item.previousStatus)"
                      :label="$t(statusLabelKey(item.previousStatus))"
                    />
                  </span>
                  <i class="ph-arrow-right history-transition__arrow" />
                </template>
                <span v-if="item.newStatus" class="history-transition__chip">
                  <Status
                    :status="statusChipValue(item.newStatus)"
                    :variant="statusChipVariant(item.newStatus)"
                    :label="$t(statusLabelKey(item.newStatus))"
                  />
                </span>
                <span v-else-if="!item.previousStatus">-</span>
              </div>
            </td>
            <td>{{ item.performedBy || "-" }}</td>
            <td>
              <Status
                :status="item.successful === false ? 'INACTIVE' : 'active'"
                :label="$t(item.successful === false ? 't-payment-order-history-failed' : 't-payment-order-history-successful')"
              />
            </td>
            <td class="history-table__message">{{ item.message || "-" }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<style scoped>
.history-table-wrapper {
  overflow-x: auto;
}

.history-table :deep(thead th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec !important;
  color: #334155 !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  padding: 0 8px !important;
}

.history-table :deep(tbody td) {
  border-bottom: 1px solid #eef2f7 !important;
  color: #334155;
  font-size: 0.78rem;
  padding: 6px 8px !important;
}

.history-table :deep(th:first-child),
.history-table :deep(td:first-child) {
  padding-left: 20px !important;
}

.history-table__message {
  max-width: 360px;
  white-space: pre-wrap;
}

.history-transition {
  align-items: center;
  display: inline-flex;
  gap: 6px;
  white-space: nowrap;
}

.history-transition__chip {
  display: inline-flex;
  flex: 0 0 auto;
  line-height: 1;
}

.history-transition__arrow {
  color: #94a3b8;
  flex: 0 0 auto;
  font-size: 0.85rem;
}
</style>
