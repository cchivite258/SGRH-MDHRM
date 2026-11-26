<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue";
import BatchHistoryTable from "@/components/paymentOrderPeriod/view/BatchHistoryTable.vue";
import type { ProcessSection } from "@/components/paymentOrderPeriod/listView/utils";
import type { PaymentOrderPeriodId } from "@/components/paymentOrderPeriod/types";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  periodId: PaymentOrderPeriodId | null;
  section?: ProcessSection;
}>(), {
  section: "refunds-and-deductions",
});

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

const historyTable = ref<InstanceType<typeof BatchHistoryTable> | null>(null);

const dialogValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

watch(
  () => [props.modelValue, props.periodId] as const,
  async ([open, periodId]) => {
    if (!open || !periodId) return;
    await nextTick();
    historyTable.value?.load();
  }
);
</script>

<template>
  <v-dialog v-model="dialogValue" width="960" scrollable>
    <Card :title="$t('t-payment-order-history')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto pa-0" style="max-height: 70vh">
        <BatchHistoryTable
          v-if="periodId"
          :key="periodId"
          ref="historyTable"
          :period-id="periodId"
          :section="section"
        />
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
