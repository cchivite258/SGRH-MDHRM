<script lang="ts" setup>
import { type PropType } from "vue";

const prop = defineProps({
  rtl: {
    type: String,
    default: "pending",
  },
  variant: {
    type: String as PropType<"tonal" | "elevated">,
    default: "tonal",
  },
});

const warningChips: { text: string; value: string }[] = [
  { text: "Pending", value: "pending" },
];
const infoChips: { text: string; value: string }[] = [
  { text: "Open", value: "open" },
  { text: "Medium", value: "medium" },
];
const successChips: { text: string; value: string }[] = [
  { value: "delivered", text: "Delivered" },
  { value: "true", text: "yes" },
  { value: "beginner", text: "Beginner" },
  { value: "advance", text: "Advance" },
  { value: "live", text: "Live" },
  { value: "paid", text: "Paid" },
  { value: "low", text: "Low" },
  { value: "Successful", text: "Successful" },
  { value: "unblock", text: "unblock" },
];
const dangerChips: { text: string; value: string }[] = [
  { value: "ood", text: "Out of Delivery" },
  { value: "false", text: "no" },
  { value: "block", text: "Block" },
  { value: "close", text: "Close" },
  { value: "intermediate", text: "Intermediate" },
  { value: "cancel", text: "Cancel" },
  { value: "unPaid", text: "UnPaid" },
  { value: "refund", text: "Refund" },
  { value: "high", text: "High" },
];
const primaryChips: { text: string; value: string }[] = [
  { value: "shipping", text: "Shipping" },
  { value: "new", text: "New" },
];
</script>
<template>
  <span
    v-for="(dangerChip, index) in dangerChips"
    :key="'danger-chip-' + index"
  >
    <v-chip
      v-if="rtl === dangerChip.value"
      color="danger"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
      <span class="status-chip">
        {{ $t('t-' + dangerChip.text) }}
      </span>
    </v-chip>
  </span>

  <span v-for="(primary, index) in primaryChips" :key="'primary-chip-' + index">
    <v-chip
      v-if="rtl === primary.value"
      color="primary"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
      <span class="status-chip"> {{ primary.text }} </span>
    </v-chip>
  </span>

  <span v-for="(warning, index) in warningChips" :key="'warning-chip-' + index">
    <v-chip
      v-if="rtl === warning.value"
      color="warning"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
      <span class="status-chip"> {{ warning.text }} </span>
    </v-chip>
  </span>

  <span v-for="(success, index) in successChips" :key="'success-chip-' + index">
    <v-chip
      v-if="rtl === success.value"
      color="success"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
    <span class="status-chip">{{ $t('t-' + success.text) }}</span>

    </v-chip>
  </span>

  <span v-for="(info, index) in infoChips" :key="'info-chip-' + index">
    <v-chip
      v-if="rtl === info.value"
      color="info"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
      <span class="status-chip"> {{ info.text }} </span>
    </v-chip>
  </span>
</template>
