<script lang="ts" setup>
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  actionLabel?: string
  actionTo?: string
  actionIcon?: string
  showAction?: boolean
  page?: number
  itemsPerPage?: number
  totalItems?: number
  totalPages?: number
  showPagination?: boolean
}>(), {
  subtitle: "",
  actionLabel: "",
  actionTo: "",
  actionIcon: "ph-plus-circle",
  showAction: true,
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
  totalPages: 1,
  showPagination: true
})

const emit = defineEmits<{
  (e: "update:page", value: number): void
  (e: "action"): void
}>()

const updatePage = (value: number) => {
  emit("update:page", value)
}

const handleAction = () => {
  if (!props.actionTo) {
    emit("action")
  }
}
</script>

<template>
  <div class="listing-page-shell">
    <div class="listing-page-shell__header">
      <div>
        <h1 class="listing-page-shell__title">{{ title }}</h1>
        <p v-if="subtitle" class="listing-page-shell__subtitle">{{ subtitle }}</p>
      </div>

      <v-btn
        v-if="showAction && actionLabel"
        class="listing-page-shell__action"
        color="secondary"
        :to="actionTo || undefined"
        @click="handleAction"
      >
        <i :class="[actionIcon, 'me-2']" />
        {{ actionLabel }}
      </v-btn>
    </div>

    <div v-if="$slots.afterHeader" class="listing-page-shell__after-header">
      <slot name="afterHeader" />
    </div>

    <div v-if="$slots.filters" class="listing-page-shell__filters">
      <slot name="filters" />
    </div>

    <v-card class="listing-page-shell__table-card">
      <v-card-text class="listing-page-shell__table-card-body">
        <slot />
      </v-card-text>
    </v-card>

    <div v-if="showPagination" class="listing-page-shell__pagination">
      <div class="listing-page-shell__pagination-summary">
        <slot
          name="pagination-summary"
          :page="props.page"
          :items-per-page="props.itemsPerPage"
          :total-items="props.totalItems"
        />
      </div>

      <v-pagination
        :model-value="props.page"
        :length="props.totalPages"
        color="secondary"
        density="compact"
        variant="text"
        total-visible="3"
        prev-icon="ph-arrow-left"
        next-icon="ph-arrow-right"
        class="listing-page-shell__pagination-control"
        @update:model-value="updatePage"
      />
    </div>
  </div>
</template>

<style scoped>
.listing-page-shell {
  margin-top: 12px;
}

.listing-page-shell__header {
  align-items: flex-start;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.listing-page-shell__title {
  color: #0f172a;
  font-size: 1.22rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 0 0 5px;
}

.listing-page-shell__subtitle {
  color: #526071;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0;
}

.listing-page-shell__action {
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 36px;
  padding-inline: 14px;
  text-transform: none;
}

.listing-page-shell__filters {
  margin-bottom: 18px;
}

.listing-page-shell__after-header {
  margin-bottom: 18px;
}

.listing-page-shell__table-card {
  background: #ffffff;
  border: 1px solid #e7edf5;
  border-radius: 18px !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05) !important;
  overflow: hidden;
}

.listing-page-shell__table-card-body {
  padding: 12px 16px 16px;
}

.listing-page-shell__pagination {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px 8px 0;
}

.listing-page-shell__pagination-summary {
  color: #64748b;
  font-size: 0.85rem;
}

.listing-page-shell__pagination-summary :deep(b) {
  color: #111827;
}

.listing-page-shell__pagination-control {
  gap: 4px;
}

.listing-page-shell__pagination :deep(.v-pagination__item),
.listing-page-shell__pagination :deep(.v-pagination__prev),
.listing-page-shell__pagination :deep(.v-pagination__next) {
  border-radius: 8px;
}

.listing-page-shell__pagination :deep(.v-pagination .v-btn) {
  border: 1px solid transparent;
  border-radius: 8px;
  color: #111827 !important;
}

.listing-page-shell__pagination :deep(.v-pagination__item--is-active .v-btn),
.listing-page-shell__pagination :deep(.v-pagination .v-btn--active) {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
  color: #ffffff !important;
  opacity: 1 !important;
}

.listing-page-shell__pagination :deep(.v-pagination__item--is-active .v-btn .v-btn__content),
.listing-page-shell__pagination :deep(.v-pagination .v-btn--active .v-btn__content) {
  color: #ffffff !important;
}

.listing-page-shell__pagination :deep(.v-pagination__item--is-active .v-btn.v-btn--disabled),
.listing-page-shell__pagination :deep(.v-pagination .v-btn--active.v-btn--disabled) {
  background-color: #0f172a !important;
  border-color: #0f172a !important;
  color: #ffffff !important;
  opacity: 1 !important;
}

@media (max-width: 767px) {
  .listing-page-shell {
    margin-top: 10px;
  }

  .listing-page-shell__header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 18px;
  }

  .listing-page-shell__action {
    width: 100%;
  }

  .listing-page-shell__table-card-body {
    padding: 10px 10px 12px;
  }

  .listing-page-shell__pagination {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 2px 0;
  }
}
</style>
