<script lang="ts" setup>
import { type PropType } from "vue";

const prop = defineProps({
  status: {
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
  { text: "pending", value: "PENDING" },
  { text: "closed", value: "CLOSED" },

];
const infoChips: { text: string; value: string }[] = [
  { text: "Open", value: "open" },
  { text: "Medium", value: "medium" },
];
const successChips: { text: string; value: string }[] = [
  { value: "delivered", text: "Delivered" },
  { value: "active", text: "active" },
  { value: "beginner", text: "Beginner" },
  { value: "advance", text: "Advance" },
  { value: "live", text: "Live" },
  { value: "paid", text: "Paid" },
  { value: "low", text: "Low" },
  { value: "Successful", text: "Successful" },
  { value: "unblock", text: "unblock" },
  { value: "POSTED", text: "posted" },
  { value: "RUNNING", text: "running" },
  { value: "enabled" , text: "enabled"},
  { value: "ACTIVE", text: "active"}
];
const dangerChips: { text: string; value: string }[] = [
  { value: "ood", text: "Out of Delivery" },
  { value: "unactive", text: "unactive" },
  { value: "block", text: "Block" },
  { value: "close", text: "Close" },
  { value: "intermediate", text: "Intermediate" },
  { value: "cancel", text: "Cancel" },
  { value: "unPaid", text: "UnPaid" },
  { value: "refund", text: "Refund" },
  { value: "high", text: "High" },
  { value: "CANCELLED", text: "cancelled" },
  { value: "INACTIVE", text: "inactive" },
  { value: "disabled", text: "disabled" },
];
const primaryChips: { text: string; value: string }[] = [
  { value: "shipping", text: "Shipping" },
  { value: "new", text: "New" },
  { value: "DRAFT", text: "draft" },

];
</script>
<template>
  <span
    v-for="(dangerChip, index) in dangerChips"
    :key="'danger-chip-' + index"
  >
    <v-chip
      v-if="status === dangerChip.value"
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
      v-if="status === primary.value"
      color="primary"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
      <span class="status-chip"> {{ $t('t-' + primary.text) }} </span>
    </v-chip>
  </span>

  <span v-for="(warning, index) in warningChips" :key="'warning-chip-' + index">
    <v-chip
      v-if="status === warning.value"
      color="warning"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
      <span class="status-chip"> {{ $t('t-' + warning.text) }} </span>
    </v-chip>
  </span>

  <span v-for="(success, index) in successChips" :key="'success-chip-' + index">
    <v-chip
      v-if="status === success.value"
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
      v-if="status === info.value"
      color="info"
      label
      :variant="variant"
      elevation="0"
      density="compact"
    >
      <span class="status-chip"> {{ $t('t-' + info.text) }} </span>
    </v-chip>
  </span>
</template>
