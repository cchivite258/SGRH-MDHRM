<script lang="ts">
export default {
  props: {
    isSuccess: {
      type: Boolean,
      default: false,
    },
    percent: {
      type: String,
      default: "",
    },
  },
};
</script>
<template>
  <v-chip
    label
    size="x-small"
    :color="isSuccess ? 'success' : 'danger'"
    class="font-weight-bold"
  >
    <i v-if="isSuccess" class="ph-arrow-up"></i>
    <i v-else class="ph-arrow-down"></i>
    <span class="ms-1 chip-text">{{ percent }}</span>
  </v-chip>
</template>
