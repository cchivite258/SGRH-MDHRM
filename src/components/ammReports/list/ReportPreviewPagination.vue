<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  page: number;
  itemsPerPage: number;
  totalItems: number;
  itemsPerPageOptions?: number[];
}>(), {
  itemsPerPageOptions: () => [10, 25, 50, 100],
});

const emit = defineEmits<{
  (event: "update:page", value: number): void;
  (event: "update:itemsPerPage", value: number): void;
}>();

const pageModel = computed({
  get: () => props.page,
  set: (value: number) => emit("update:page", value),
});

const itemsPerPageModel = computed({
  get: () => props.itemsPerPage,
  set: (value: number) => emit("update:itemsPerPage", value),
});

const pageCount = computed(() => {
  return Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage));
});
</script>

<template>
  <div v-if="totalItems > 0" class="report-preview-pagination">
    <div class="report-preview-pagination-size">
      <span>{{ $t("t-items-per-page") }}</span>
      <v-select
        v-model="itemsPerPageModel"
        :items="itemsPerPageOptions"
        density="compact"
        variant="outlined"
        hide-details
        class="report-preview-pagination-select"
      />
    </div>

    <v-pagination
      v-model="pageModel"
      :length="pageCount"
      density="comfortable"
      rounded="circle"
      total-visible="5"
    />
  </div>
</template>

<style scoped>
.report-preview-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 16px;
}

.report-preview-pagination-size {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 12px;
  font-weight: 600;
}

.report-preview-pagination-select {
  width: 94px;
}

@media (max-width: 700px) {
  .report-preview-pagination {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
