<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"
import { useLayoutStore } from "@/store/app"
import { serviceProviderService } from "@/app/http/httpServiceProvider"
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import Status from "@/app/common/components/Status.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import AdvancedFilter from "@/components/serviceProvider/list/AdvancedFilter.vue"
import { serviceProviderHeader } from "@/components/serviceProvider/list/utils"
import type { ServiceProviderListingType } from "@/components/serviceProvider/types"
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore"

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const layoutStore = useLayoutStore()
const serviceProviderStore = useServiceProviderStore()
const isDarkMode = computed(() => layoutStore.mode === "dark")

const searchQuery = ref("")
const searchProps = "name,description,address,phone,email,website"
const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const selectedServiceProvider = ref<any[]>([])

const resetListingFilters = () => {
  serviceProviderStore.clearFilters()
  searchQuery.value = ""
  selectedServiceProvider.value = []
}

const loading = computed(() => serviceProviderStore.loading)
const totalItems = computed(() => serviceProviderStore.pagination.totalElements)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

watch(selectedServiceProvider, newSelection => {
  console.log("serviceProvider selecionados:", newSelection)
}, { deep: true })

interface FetchParams {
  page: number
  itemsPerPage: number
  sortBy: Array<{ key: string; order: "asc" | "desc" }>
}

const fetchServiceProviders = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await serviceProviderStore.fetchServiceProviders(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "createdAt",
    sortBy[0]?.order || "asc"
  )
}

const onView = (id: string) => {
  router.push(`/service-provider/view/${id}`)
}

const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteServiceProvider = async () => {
  if (!deleteId.value) return

  deleteLoading.value = true
  try {
    await serviceProviderService.deleteServiceProvider(deleteId.value)
    toast.success(t("t-toast-message-deleted"))
    await serviceProviderStore.fetchServiceProviders(0, itemsPerPage.value)
  } catch {
    toast.error(t("t-toast-message-deleted-error"))
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
  }
}

const toggleSelection = (item: ServiceProviderListingType) => {
  const index = selectedServiceProvider.value.findIndex(selected => selected.id === item.id)
  if (index === -1) {
    selectedServiceProvider.value = [...selectedServiceProvider.value, item]
  } else {
    selectedServiceProvider.value = selectedServiceProvider.value.filter(selected => selected.id !== item.id)
  }
}

const truncate = (text: string, maxLength = 30) => {
  if (!text) return ""
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

onBeforeMount(() => {
  resetListingFilters()
})

onBeforeRouteLeave(() => {
  resetListingFilters()
})
</script>

<template>
  <ListingPageShell
    class="service-provider-listing-page"
    :class="{ 'service-provider-listing-page--dark': isDarkMode }"
    :title="$t('t-service-provider-list')"
    subtitle="Consulte, pesquise e faça a gestão dos provedores de serviço registados."
    :action-label="$t('t-add-service-provider')"
    action-to="/service-provider/create"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
  >
    <template #filters>
      <AdvancedFilter />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer
      v-model="selectedServiceProvider"
      v-model:page="currentPage"
      :headers="serviceProviderHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="serviceProviderStore.service_providers"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loading"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      show-select
      @load-items="fetchServiceProviders"
    >
      <template #body="{ items }: { items: readonly unknown[] }">
        <tr v-for="item in items as ServiceProviderListingType[]" :key="item.id" class="service-provider-listing-table__row">
          <td data-label="">
            <v-checkbox
              :model-value="selectedServiceProvider.some(selected => selected.id === item.id)"
              hide-details
              density="compact"
              @update:model-value="toggleSelection(item)"
            />
          </td>
          <td
            data-label="Nome"
            class="service-provider-listing-table__primary-cell cursor-pointer"
            @click="onView(item.id)"
          >
            {{ truncate(item.name) }}
          </td>
          <td data-label="Tipo">
            {{ item.providerTypes?.name || "N/A" }}
          </td>
          <td data-label="Endereço">
            {{ truncate(item.address) || "N/A" }}
          </td>
          <td data-label="Telemóvel">
            {{ truncate(item.phone) || "N/A" }}
          </td>
          <td data-label="Email">
            {{ truncate(item.email) || "N/A" }}
          </td>
          <td data-label="Disponibilidade">
            <Status :status="item.enabled ? 'enabled' : 'disabled'" />
          </td>
          <td data-label="Acção" class="service-provider-listing-table__actions-cell">
            <TableAction
              @on-view="() => router.push(`/service-provider/view/${item.id}`)"
              @onEdit="() => router.push(`/service-provider/edit/${item.id}`)"
              @onDelete="() => openDeleteDialog(item.id)"
            />
          </td>
        </tr>
      </template>

      <template v-if="serviceProviderStore.service_providers.length === 0" #body>
        <tr>
          <td :colspan="serviceProviderHeader.length" class="service-provider-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="service-provider-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="service-provider-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="service-provider-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faça uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="deleteServiceProvider" />
</template>

<style scoped>
.service-provider-listing-page :deep(.data-table-server-wrapper) {
  --service-provider-listing-surface: #ffffff;
  --service-provider-listing-surface-strong: #f3f6fa;
  --service-provider-listing-surface-hover: #fcfdff;
  --service-provider-listing-surface-mobile: #ffffff;
  --service-provider-listing-border: #e8edf3;
  --service-provider-listing-border-soft: #eef2f7;
  --service-provider-listing-border-strong: #d8e1ec;
  --service-provider-listing-text: #334155;
  --service-provider-listing-text-strong: #0f172a;
  --service-provider-listing-text-muted: #64748b;
  --service-provider-listing-shadow-accent: #cbd5e1;
  --service-provider-listing-mobile-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  background: var(--service-provider-listing-surface);
  border: 1px solid var(--service-provider-listing-border);
  border-radius: 14px;
  overflow: hidden;
}

.service-provider-listing-page :deep(.v-table),
.service-provider-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.service-provider-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.service-provider-listing-page :deep(.v-table__wrapper > table > thead),
.service-provider-listing-page :deep(.v-data-table thead) {
  background: var(--service-provider-listing-surface-strong);
}

.service-provider-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.service-provider-listing-page :deep(.v-data-table-header th),
.service-provider-listing-page :deep(.v-data-table__th) {
  background-color: var(--service-provider-listing-surface-strong) !important;
  border-bottom: 1px solid var(--service-provider-listing-border-strong);
  color: var(--service-provider-listing-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.service-provider-listing-page :deep(.v-table__wrapper > table) {
  table-layout: auto;
  width: 100%;
}

.service-provider-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.service-provider-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.service-provider-listing-page :deep(.v-data-table-header th:last-child),
.service-provider-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.service-provider-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.service-provider-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.service-provider-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.service-provider-listing-page :deep(.v-data-table-header__sort-icon) {
  color: var(--service-provider-listing-text-muted);
  font-size: 0.82rem;
  opacity: 1;
}

.service-provider-listing-page :deep(.v-data-table__td) {
  background: var(--service-provider-listing-surface);
}

.service-provider-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid var(--service-provider-listing-border-soft);
  color: var(--service-provider-listing-text);
  font-size: 0.8rem;
  padding-top: 20px;
  padding-bottom: 20px;
  vertical-align: middle;
}

.service-provider-listing-page :deep(.v-data-table__tr:hover) {
  background: var(--service-provider-listing-surface-hover) !important;
}

.service-provider-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--service-provider-listing-shadow-accent);
}

.service-provider-listing-page :deep(.v-data-table__td--select),
.service-provider-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.service-provider-listing-page :deep(.v-selection-control) {
  min-height: auto;
}

.service-provider-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.service-provider-listing-page :deep(.v-checkbox .v-selection-control__wrapper) {
  color: var(--service-provider-listing-text-muted);
}

.service-provider-listing-table__primary-cell {
  color: var(--service-provider-listing-text);
  font-weight: 500;
  line-height: 1.45;
  transition: color 0.18s ease;
}

.service-provider-listing-table__primary-cell:hover {
  color: var(--service-provider-listing-text-strong);
}

.service-provider-listing-page :deep(.v-chip) {
  font-size: 0.8rem !important;
  font-weight: 500 !important;
}

.service-provider-listing-page :deep(.v-chip .status-chip),
.service-provider-listing-page :deep(.v-chip .v-chip__content) {
  font-size: inherit;
  font-weight: inherit;
}

.service-provider-listing-table__actions-cell {
  white-space: nowrap;
}

.service-provider-listing-page :deep(.service-provider-listing-table__actions-cell .d-flex) {
  gap: 6px;
}

.service-provider-listing-page :deep(.service-provider-listing-table__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.service-provider-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.service-provider-listing-table__empty-avatar {
  border: 1px solid var(--service-provider-listing-border);
}

.service-provider-listing-table__empty-title {
  color: var(--service-provider-listing-text-strong);
  font-size: 0.98rem;
  font-weight: 700;
}

.service-provider-listing-table__empty-subtitle {
  color: var(--service-provider-listing-text-muted);
  font-size: 0.82rem;
}

.service-provider-listing-page--dark :deep(.data-table-server-wrapper) {
  --service-provider-listing-surface: #151b26;
  --service-provider-listing-surface-strong: #232a36;
  --service-provider-listing-surface-hover: #1d2633;
  --service-provider-listing-surface-mobile: #18202c;
  --service-provider-listing-border: #2a3442;
  --service-provider-listing-border-soft: #273243;
  --service-provider-listing-border-strong: #334155;
  --service-provider-listing-text: #cbd5e1;
  --service-provider-listing-text-strong: #f8fafc;
  --service-provider-listing-text-muted: #94a3b8;
  --service-provider-listing-shadow-accent: #475569;
  --service-provider-listing-mobile-shadow: 0 8px 20px rgba(2, 6, 23, 0.22);
}

@media (min-width: 768px) {
  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .service-provider-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .service-provider-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .service-provider-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: var(--service-provider-listing-surface-mobile);
    border: 1px solid var(--service-provider-listing-border);
    border-radius: 14px;
    box-shadow: var(--service-provider-listing-mobile-shadow);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid var(--service-provider-listing-border-soft);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: var(--service-provider-listing-text-muted);
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .service-provider-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .service-provider-listing-table__actions-cell {
    display: block !important;
  }

  .service-provider-listing-page :deep(.service-provider-listing-table__actions-cell .d-flex) {
    justify-content: flex-start !important;
  }
}
</style>
