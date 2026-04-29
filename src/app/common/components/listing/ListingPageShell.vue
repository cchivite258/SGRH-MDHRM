<script lang="ts" setup>
import { computed } from "vue"
import { useLayoutStore } from "@/store/app"

const layoutStore = useLayoutStore()
const isDarkMode = computed(() => layoutStore.mode === "dark")

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
  <div
    class="listing-page-shell"
    :class="{ 'listing-page-shell--dark': isDarkMode }"
  >
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
  --listing-shell-title-color: #0f172a;
  --listing-shell-subtitle-color: #526071;
  --listing-shell-card-bg: #ffffff;
  --listing-shell-card-border: #e7edf5;
  --listing-shell-card-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  --listing-shell-pagination-text: #64748b;
  --listing-shell-pagination-strong: #111827;
  --listing-shell-pagination-btn: #111827;
  --listing-shell-pagination-active-bg: #0f172a;
  --listing-shell-pagination-active-text: #ffffff;
}

.listing-page-shell__header {
  align-items: flex-start;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.listing-page-shell__title {
  color: var(--listing-shell-title-color);
  font-size: 1.22rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 0 0 5px;
}

.listing-page-shell__subtitle {
  color: var(--listing-shell-subtitle-color);
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
  background: var(--listing-shell-card-bg);
  border: 1px solid var(--listing-shell-card-border);
  border-radius: 18px !important;
  box-shadow: var(--listing-shell-card-shadow) !important;
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
  color: var(--listing-shell-pagination-text);
  font-size: 0.85rem;
}

.listing-page-shell__pagination-summary :deep(b) {
  color: var(--listing-shell-pagination-strong);
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
  color: var(--listing-shell-pagination-btn) !important;
}

.listing-page-shell__pagination :deep(.v-pagination__item--is-active .v-btn),
.listing-page-shell__pagination :deep(.v-pagination .v-btn--active) {
  background-color: var(--listing-shell-pagination-active-bg) !important;
  border-color: var(--listing-shell-pagination-active-bg) !important;
  color: var(--listing-shell-pagination-active-text) !important;
  opacity: 1 !important;
}

.listing-page-shell__pagination :deep(.v-pagination__item--is-active .v-btn .v-btn__content),
.listing-page-shell__pagination :deep(.v-pagination .v-btn--active .v-btn__content) {
  color: var(--listing-shell-pagination-active-text) !important;
}

.listing-page-shell__pagination :deep(.v-pagination__item--is-active .v-btn.v-btn--disabled),
.listing-page-shell__pagination :deep(.v-pagination .v-btn--active.v-btn--disabled) {
  background-color: var(--listing-shell-pagination-active-bg) !important;
  border-color: var(--listing-shell-pagination-active-bg) !important;
  color: var(--listing-shell-pagination-active-text) !important;
  opacity: 1 !important;
}

.listing-page-shell--dark {
  --listing-shell-title-color: #e2e8f0;
  --listing-shell-subtitle-color: #94a3b8;
  --listing-shell-card-bg: #1a202c;
  --listing-shell-card-border: #2b3442;
  --listing-shell-card-shadow: 0 12px 30px rgba(2, 6, 23, 0.28);
  --listing-shell-pagination-text: #94a3b8;
  --listing-shell-pagination-strong: #e2e8f0;
  --listing-shell-pagination-btn: #cbd5e1;
  --listing-shell-pagination-active-bg: #334155;
  --listing-shell-pagination-active-text: #f8fafc;
}

.listing-page-shell--dark.base-table-listing-page :deep(.data-table-server-wrapper) {
  background: #151b26 !important;
  border-color: #2a3442 !important;
}

.listing-page-shell--dark.base-table-listing-page :deep(.v-table__wrapper > table > thead),
.listing-page-shell--dark.base-table-listing-page :deep(.v-data-table thead),
.listing-page-shell--dark.base-table-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.listing-page-shell--dark.base-table-listing-page :deep(.v-data-table-header th),
.listing-page-shell--dark.base-table-listing-page :deep(.v-data-table__th) {
  background: #232a36 !important;
  border-bottom-color: #334155 !important;
  color: #cbd5e1 !important;
}

.listing-page-shell--dark.base-table-listing-page :deep(.v-data-table__tr td),
.listing-page-shell--dark.base-table-listing-page :deep(.base-table-listing-page__primary-cell) {
  border-bottom-color: #273243 !important;
  color: #cbd5e1 !important;
}

.listing-page-shell--dark.base-table-listing-page :deep(.v-data-table__tr:hover) {
  background: #1d2633 !important;
}

.listing-page-shell--dark.base-table-listing-page :deep(.base-table-listing-page__empty-avatar) {
  border-color: #2a3442 !important;
}

.listing-page-shell--dark.base-table-listing-page :deep(.base-table-listing-page__empty-title) {
  color: #f8fafc !important;
}

.listing-page-shell--dark.base-table-listing-page :deep(.base-table-listing-page__empty-subtitle) {
  color: #94a3b8 !important;
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
