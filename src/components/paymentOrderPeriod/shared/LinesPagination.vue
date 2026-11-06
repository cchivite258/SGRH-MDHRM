<script lang="ts" setup>
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
  set: (value: number) => {
    emit("update:itemsPerPage", value);
    emit("update:page", 1);
  },
});

const pageCount = computed(() => Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage)));
const pageStart = computed(() => (props.totalItems ? (props.page - 1) * props.itemsPerPage + 1 : 0));
const pageEnd = computed(() => Math.min(props.page * props.itemsPerPage, props.totalItems));
</script>

<template>
  <div class="lines-pagination">
    <div class="text-muted">
      {{ $t("t-showing") }} <b>{{ pageStart }}-{{ pageEnd }}</b> {{ $t("t-of") }}
      <b>{{ totalItems }}</b> {{ $t("t-results") }}
    </div>

    <div class="lines-pagination__controls">
      <div class="lines-pagination__size">
        <span>{{ $t("t-items-per-page") }}</span>
        <v-select
          v-model="itemsPerPageModel"
          :items="itemsPerPageOptions"
          density="compact"
          variant="outlined"
          hide-details
          class="lines-pagination__select"
        />
      </div>

      <v-pagination
        v-model="pageModel"
        :length="pageCount"
        density="compact"
        color="primary"
        variant="text"
        total-visible="3"
        prev-icon="ph-arrow-left"
        next-icon="ph-arrow-right"
        class="table-pagination"
      />
    </div>
  </div>
</template>

<style scoped>
.lines-pagination {
  align-items: center;
  border-top: 1px solid #eef2f7;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 20px;
}

.lines-pagination .text-muted {
  color: #64748b;
}

.lines-pagination__controls {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.lines-pagination__size {
  align-items: center;
  color: #64748b;
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  gap: 8px;
}

.lines-pagination__select {
  width: 84px;
}

.lines-pagination__select :deep(.v-field) {
  font-size: 0.8rem;
}

.lines-pagination__select :deep(.v-field__input) {
  min-height: 32px;
  padding-bottom: 4px;
  padding-top: 4px;
}
</style>
