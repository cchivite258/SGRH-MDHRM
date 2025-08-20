<script lang="ts" setup>
import { PropType } from "vue";
import { computed, ComputedRef } from "vue";

const prop = defineProps({
  status: {
    type: String,
    default: "Villa",
  },
  variant: {
    type: String as PropType<"tonal" | "elevated">,
    default: "tonal",
  },
});

const getStatus: ComputedRef<{ [key: string]: string }> = computed(() => {
  switch (prop.status) {
    case "Residency":
      return {
        text: "Residency",
        color: "success",
        icon: "bx bx-buildings",
      };

    case "Apartment":
      return {
        text: "Apartment",
        color: "info",
        icon: "bx bx-building",
      };

    default:
      return {
        text: "Villa",
        color: "danger",
        icon: "ph-house",
      };
  }
});
</script>
<template>
  <v-chip
    density="comfortable"
    label
    :color="getStatus.color"
    :variant="variant"
    elevation="0"
    class="px-2"
  >
    <span class="d-flex align-center">
      <i :class="getStatus.icon" class="me-1" />
      <span class="status-chip">{{ getStatus.text }}</span>
    </span>
  </v-chip>
</template>
