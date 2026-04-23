<script lang="ts" setup>
import { ref, computed, watch, onBeforeMount } from "vue"
import { useRouter, onBeforeRouteLeave } from "vue-router"
import { useCompanyDetailsStore } from "@/store/institution/companyDetailsStore"
import { companyDetailsService } from "@/app/http/httpServiceProvider"
import { useToast } from "vue-toastification"
import { useI18n } from "vue-i18n"

import DataTableServer from "@/app/common/components/DataTableServer.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue"
import { entitiesHeader } from "@/components/entities/list/utils"
import Status from "@/app/common/components/Status.vue"
import type { EntityListingType } from "@/components/entities/types"
import AdvancedFilter from "@/components/entities/list/AdvancedFilter.vue"

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const companyDetailsStore = useCompanyDetailsStore()

const searchQuery = ref("")
const searchProps = "name,description,address,phone,email,website,incomeTaxNumber,institutionType.name"
const itemsPerPage = ref(10)
const currentPage = ref(1)
const selectedEntities = ref<any[]>([])

const resetListingFilters = () => {
  companyDetailsStore.clearFilters()
  searchQuery.value = ""
  selectedEntities.value = []
}

const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)

const loading = computed(() => companyDetailsStore.loading)
const totalItems = computed(() => companyDetailsStore.pagination.totalElements)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

watch(selectedEntities, (newSelection) => {
  console.log("Entidades selecionadas:", newSelection)
}, { deep: true })

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
}

const fetchEntities = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await companyDetailsStore.fetchCompanyDetails(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "createdAt",
    sortBy[0]?.order || "asc"
  )
}

const onView = (id: string) => {
  router.push(`/entities/view/${id}`)
}

const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteEntity = async () => {
  if (!deleteId.value) return

  deleteLoading.value = true
  try {
    await companyDetailsService.deleteCompanyDetails(deleteId.value)
    toast.success(t("t-toast-message-deleted"))
    await companyDetailsStore.fetchCompanyDetails(0, itemsPerPage.value)
  } catch (error) {
    if (error instanceof Error && "response" in error) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      toast.error(axiosError.response?.data?.message || t("t-toast-message-error"))
    } else {
      toast.error(t("t-toast-message-error"))
    }
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
  }
}

const toggleSelection = (item: EntityListingType) => {
  const index = selectedEntities.value.findIndex(selected => selected.id === item.id)
  if (index === -1) {
    selectedEntities.value = [...selectedEntities.value, item]
  } else {
    selectedEntities.value = selectedEntities.value.filter(selected => selected.id !== item.id)
  }
}

const getEntityTypeColor = (type?: string | null) => {
  const normalizedType = type?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || ""

  if (normalizedType.includes("public")) return "entity-public"
  if (normalizedType.includes("privad")) return "entity-private"
  return "entity-neutral"
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
    class="entity-listing-page"
    :title="$t('t-entity-list')"
    subtitle="Consulte, pesquise e faça a gestão das entidades registadas."
    :action-label="$t('t-add-entity')"
    action-to="/entities/create"
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
      v-model="selectedEntities"
      v-model:page="currentPage"
      :headers="entitiesHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="companyDetailsStore.entities"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loading"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      show-select
      @load-items="fetchEntities"
    >
      <template #body="{ items }: { items: readonly unknown[] }">
        <tr v-for="item in items as EntityListingType[]" :key="item.id" class="entity-listing-table__row">
          <td data-label="">
            <v-checkbox
              :model-value="selectedEntities.some(selected => selected.id === item.id)"
              hide-details
              density="compact"
              @update:model-value="toggleSelection(item)"
            />
          </td>
          <td
            data-label="Nome da Entidade"
            class="entity-listing-table__primary-cell cursor-pointer"
            @click="onView(item.id)"
          >
            <div class="entity-listing-table__identity">
              <div class="entity-listing-table__identity-content">
                <div class="entity-listing-table__identity-name">
                  {{ item.name || "N/A" }}
                </div>
              </div>
            </div>
          </td>
          <td data-label="Tipo de Entidade">
            <Status
              :status="getEntityTypeColor(item.institutionType?.name)"
              :label="item.institutionType?.name || 'N/A'"
            />
          </td>
          <td data-label="Email">
            <a
              v-if="item.email"
              class="entity-listing-table__contact-link"
              :href="`mailto:${item.email}`"
              @click.stop
            >
              {{ item.email }}
            </a>
            <span v-else>N/A</span>
          </td>
          <td data-label="Telemóvel">
            <a
              v-if="item.phone"
              class="entity-listing-table__contact-link"
              :href="`tel:${item.phone}`"
              @click.stop
            >
              {{ item.phone }}
            </a>
            <span v-else>N/A</span>
          </td>
          <td data-label="Habilitado?">
            <Status :status="item.enabled ? 'enabled' : 'disabled'" />
          </td>
          <td data-label="Acção" class="entity-listing-table__actions-cell">
            <TableAction
              @onEdit="() => router.push(`/entities/edit/${item.id}`)"
              @onView="() => onView(item.id)"
              @onDelete="() => openDeleteDialog(item.id)"
            />
          </td>
        </tr>
      </template>

      <template v-if="companyDetailsStore.entities.length === 0" #body>
        <tr>
          <td :colspan="entitiesHeader.length" class="entity-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="entity-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="entity-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="entity-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faça uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="deleteEntity" />
</template>

<style scoped>
.entity-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.entity-listing-page :deep(.v-table),
.entity-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.entity-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.entity-listing-page :deep(.v-table__wrapper > table > thead),
.entity-listing-page :deep(.v-data-table thead) {
  background: #f3f6fa;
}

.entity-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.entity-listing-page :deep(.v-data-table-header th),
.entity-listing-page :deep(.v-data-table__th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.entity-listing-page :deep(.v-table__wrapper > table) {
  table-layout: auto;
  width: 100%;
}

.entity-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.entity-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.entity-listing-page :deep(.v-data-table-header th:last-child),
.entity-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.entity-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.entity-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.entity-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.entity-listing-page :deep(.v-data-table-header__sort-icon) {
  color: #94a3b8;
  font-size: 0.82rem;
  opacity: 1;
}

.entity-listing-page :deep(.v-data-table__td) {
  background: #ffffff;
}

.entity-listing-page :deep(.v-data-table__tr) {
  transition: background-color 0.18s ease, box-shadow 0.18s ease;
}

.entity-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 0.76rem;
  padding-top: 20px;
  padding-bottom: 20px;
  vertical-align: middle;
}

.entity-listing-page :deep(.v-data-table__tr:hover) {
  background: #fcfdff !important;
}

.entity-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 #cbd5e1;
}

.entity-listing-page :deep(.v-data-table__td--select),
.entity-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.entity-listing-page :deep(.v-selection-control) {
  min-height: auto;
}

.entity-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.entity-listing-page :deep(.v-checkbox .v-selection-control__wrapper) {
  color: #64748b;
}

.entity-listing-table__row {
  position: relative;
}

.entity-listing-table__primary-cell {
  color: #334155;
  font-weight: 500;
  line-height: 1.45;
  transition: color 0.18s ease;
}

.entity-listing-table__primary-cell:hover {
  color: #0f172a;
}

.entity-listing-table__identity {
  align-items: center;
  display: flex;
  min-width: 220px;
}

.entity-listing-table__identity-content {
  min-width: 0;
}

.entity-listing-table__identity-name {
  color: inherit;
  font-size: 0.76rem;
  font-weight: inherit;
  line-height: 1.3;
}

.entity-listing-table__contact-link {
  color: inherit;
  font-size: 0.76rem;
  font-weight: inherit;
  white-space: normal;
  text-decoration: none;
  transition: color 0.18s ease;
  word-break: break-word;
}

.entity-listing-table__contact-link:hover {
  color: #2563eb;
}

.entity-listing-page :deep(.v-chip) {
  font-size: 0.76rem !important;
  font-weight: 500 !important;
}

.entity-listing-page :deep(.v-chip .status-chip),
.entity-listing-page :deep(.v-chip .v-chip__content) {
  font-size: inherit;
  font-weight: inherit;
}

.entity-listing-table__actions-cell {
  white-space: nowrap;
}

.entity-listing-page :deep(.entity-listing-table__actions-cell .d-flex) {
  gap: 6px;
}

.entity-listing-page :deep(.entity-listing-table__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.entity-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.entity-listing-table__empty-avatar {
  border: 1px solid #e2e8f0;
}

.entity-listing-table__empty-title {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 700;
}

.entity-listing-table__empty-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .entity-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .entity-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .entity-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: #ffffff;
    border: 1px solid #e5edf6;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid #eef2f7;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .entity-listing-table__contact-link {
    white-space: normal;
    word-break: break-word;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: #64748b;
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .entity-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .entity-listing-table__identity {
    align-items: flex-start;
  }

  .entity-listing-table__actions-cell {
    display: block !important;
  }

  .entity-listing-page :deep(.entity-listing-table__actions-cell .d-flex) {
    justify-content: flex-start !important;
  }
}
</style>
