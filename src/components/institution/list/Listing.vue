<script lang="ts" setup>
import { ref, computed, watch, onBeforeMount } from "vue"
import { useRouter, onBeforeRouteLeave } from "vue-router"
import { useLayoutStore } from "@/store/app"
import { useInstitutionStore } from "@/store/institution/institutionStore"
import { institutionService } from "@/app/http/httpServiceProvider"
import { useToast } from "vue-toastification"
import { useI18n } from "vue-i18n"

import DataTableServer from "@/app/common/components/DataTableServer.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue"
import Overview from "@/components/institution/list/Overview.vue"
import { institutionHeader } from "@/components/institution/list/utils"
import Status from "@/app/common/components/Status.vue"
import { formateDate } from "@/app/common/dateFormate"
import type { InstitutionListingType } from "../types"
import AdvancedFilter from "@/components/institution/list/AdvancedFilter.vue"

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const layoutStore = useLayoutStore()
const institutionStore = useInstitutionStore()
const isDarkMode = computed(() => layoutStore.mode === "dark")

const searchQuery = ref("")
const searchProps = "name,description,organization.name,organization.address,organization.phone,organization.email,organization.website,organization.incomeTaxNumber,organization.institutionType.name"
const itemsPerPage = ref(10)
const currentPage = ref(1)
const selectedInstitutions = ref<any[]>([])

const resetListingFilters = () => {
  institutionStore.clearFilters()
  searchQuery.value = ""
  selectedInstitutions.value = []
}

const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)

const loading = computed(() => institutionStore.loading)
const totalItems = computed(() => institutionStore.pagination.totalElements)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

watch(selectedInstitutions, (newSelection) => {
  console.log("Contratos selecionados:", newSelection)
}, { deep: true })

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
}

const fetchInstitutions = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await institutionStore.fetchInstitutions(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "createdAt",
    sortBy[0]?.order || "asc"
  )
}

const onView = (id: string) => {
  router.push(`/institution/view/${id}`)
}

const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteInstitution = async () => {
  if (!deleteId.value) return

  deleteLoading.value = true
  try {
    await institutionService.deleteInstitution(deleteId.value)
    toast.success(t("t-toast-message-deleted"))
    await institutionStore.fetchInstitutions(0, itemsPerPage.value)
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

const toggleSelection = (item: InstitutionListingType) => {
  const index = selectedInstitutions.value.findIndex(selected => selected.id === item.id)
  if (index === -1) {
    selectedInstitutions.value = [...selectedInstitutions.value, item]
  } else {
    selectedInstitutions.value = selectedInstitutions.value.filter(selected => selected.id !== item.id)
  }
}

const getInstitutionTypeColor = (type?: string | null) => {
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
    class="institution-listing-page"
    :class="{ 'institution-listing-page--dark': isDarkMode }"
    :title="$t('t-institution-list')"
    subtitle="Consulte, pesquise e faça a gestão dos contratos registados."
    :action-label="$t('t-add-institution')"
    action-to="/institution/create"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
  >
    <template #afterHeader>
      <Overview />
    </template>

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
      v-model="selectedInstitutions"
      v-model:page="currentPage"
      :headers="institutionHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="institutionStore.institutions"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loading"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      show-select
      @load-items="fetchInstitutions"
    >
      <template #body="{ items }: { items: readonly unknown[] }">
        <tr v-for="item in items as InstitutionListingType[]" :key="item.id" class="institution-listing-table__row">
          <td data-label="">
            <v-checkbox
              :model-value="selectedInstitutions.some(selected => selected.id === item.id)"
              hide-details
              density="compact"
              @update:model-value="toggleSelection(item)"
            />
          </td>
          <td
            data-label="Nome do Contrato"
            class="institution-listing-table__primary-cell cursor-pointer"
            @click="onView(item.id)"
          >
            <div class="institution-listing-table__identity">
              <div class="institution-listing-table__identity-content">
                <div class="institution-listing-table__identity-name">
                  {{ item.name || "N/A" }}
                </div>
              </div>
            </div>
          </td>
          <td data-label="Tipo de Entidade">
            <Status
              :status="getInstitutionTypeColor(item.institutionType?.name)"
              :label="item.institutionType?.name || 'N/A'"
            />
          </td>
          <td data-label="Email">
            <a
              v-if="item.email"
              class="institution-listing-table__contact-link"
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
              class="institution-listing-table__contact-link"
              :href="`tel:${item.phone}`"
              @click.stop
            >
              {{ item.phone }}
            </a>
            <span v-else>N/A</span>
          </td>
          <td data-label="Data de Criação">
            {{ formateDate(item.createdAt) || "N/A" }}
          </td>
          <td data-label="Habilitado?">
            <Status :status="item.enabled ? 'enabled' : 'disabled'" />
          </td>
          <td data-label="Acção" class="institution-listing-table__actions-cell">
            <TableAction
              @onEdit="() => router.push(`/institution/edit/${item.id}`)"
              @onView="() => onView(item.id)"
              @onDelete="() => openDeleteDialog(item.id)"
            />
          </td>
        </tr>
      </template>

      <template v-if="institutionStore.institutions.length === 0" #body>
        <tr>
          <td :colspan="institutionHeader.length" class="institution-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="institution-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="institution-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="institution-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faça uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="deleteInstitution" />
</template>

<style scoped>
.institution-listing-page :deep(.data-table-server-wrapper) {
  --institution-listing-surface: #ffffff;
  --institution-listing-surface-strong: #f3f6fa;
  --institution-listing-surface-hover: #fcfdff;
  --institution-listing-surface-mobile: #ffffff;
  --institution-listing-border: #e8edf3;
  --institution-listing-border-soft: #eef2f7;
  --institution-listing-border-strong: #d8e1ec;
  --institution-listing-text: #334155;
  --institution-listing-text-strong: #0f172a;
  --institution-listing-text-muted: #64748b;
  --institution-listing-link-hover: #2563eb;
  --institution-listing-shadow-accent: #cbd5e1;
  --institution-listing-mobile-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  background: var(--institution-listing-surface);
  border: 1px solid var(--institution-listing-border);
  border-radius: 14px;
  overflow: hidden;
}

.institution-listing-page :deep(.v-table),
.institution-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.institution-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.institution-listing-page :deep(.v-table__wrapper > table > thead),
.institution-listing-page :deep(.v-data-table thead) {
  background: var(--institution-listing-surface-strong);
}

.institution-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.institution-listing-page :deep(.v-data-table-header th),
.institution-listing-page :deep(.v-data-table__th) {
  background-color: var(--institution-listing-surface-strong) !important;
  border-bottom: 1px solid var(--institution-listing-border-strong);
  color: var(--institution-listing-text);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.institution-listing-page :deep(.v-table__wrapper > table) {
  table-layout: auto;
  width: 100%;
}

.institution-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.institution-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.institution-listing-page :deep(.v-data-table-header th:last-child),
.institution-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.institution-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.institution-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.institution-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.institution-listing-page :deep(.v-data-table-header__sort-icon) {
  color: var(--institution-listing-text-muted);
  font-size: 0.82rem;
  opacity: 1;
}

.institution-listing-page :deep(.v-data-table__td) {
  background: var(--institution-listing-surface);
}

.institution-listing-page :deep(.v-data-table__tr) {
  transition: background-color 0.18s ease, box-shadow 0.18s ease;
}

.institution-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid var(--institution-listing-border-soft);
  color: var(--institution-listing-text);
  font-size: 0.8rem;
  padding-top: 20px;
  padding-bottom: 20px;
  vertical-align: middle;
}

.institution-listing-page :deep(.v-data-table__tr:hover) {
  background: var(--institution-listing-surface-hover) !important;
}

.institution-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 var(--institution-listing-shadow-accent);
}

.institution-listing-page :deep(.v-data-table__td--select),
.institution-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.institution-listing-page :deep(.v-selection-control) {
  min-height: auto;
}

.institution-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.institution-listing-page :deep(.v-checkbox .v-selection-control__wrapper) {
  color: var(--institution-listing-text-muted);
}

.institution-listing-table__row {
  position: relative;
}

.institution-listing-table__primary-cell {
  color: var(--institution-listing-text);
  font-weight: 500;
  line-height: 1.45;
  transition: color 0.18s ease;
}

.institution-listing-table__primary-cell:hover {
  color: var(--institution-listing-text-strong);
}

.institution-listing-table__identity {
  align-items: center;
  display: flex;
  min-width: 220px;
}

.institution-listing-table__identity-content {
  min-width: 0;
}

.institution-listing-table__identity-name {
  color: inherit;
  font-size: 0.8rem;
  font-weight: inherit;
  line-height: 1.3;
}

.institution-listing-table__contact-link {
  color: inherit;
  font-size: 0.8rem;
  font-weight: inherit;
  white-space: normal;
  text-decoration: none;
  transition: color 0.18s ease;
  word-break: break-word;
}

.institution-listing-table__contact-link:hover {
  color: var(--institution-listing-link-hover);
}

.institution-listing-page :deep(.v-chip) {
  font-size: 0.8rem !important;
  font-weight: 500 !important;
}

.institution-listing-page :deep(.v-chip .status-chip),
.institution-listing-page :deep(.v-chip .v-chip__content) {
  font-size: inherit;
  font-weight: inherit;
}

.institution-listing-table__actions-cell {
  white-space: nowrap;
}

.institution-listing-page :deep(.institution-listing-table__actions-cell .d-flex) {
  gap: 6px;
}

.institution-listing-page :deep(.institution-listing-table__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.institution-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.institution-listing-table__empty-avatar {
  border: 1px solid var(--institution-listing-border);
}

.institution-listing-table__empty-title {
  color: var(--institution-listing-text-strong);
  font-size: 0.98rem;
  font-weight: 700;
}

.institution-listing-table__empty-subtitle {
  color: var(--institution-listing-text-muted);
  font-size: 0.82rem;
}

.institution-listing-page--dark :deep(.data-table-server-wrapper) {
  --institution-listing-surface: #151b26;
  --institution-listing-surface-strong: #232a36;
  --institution-listing-surface-hover: #1d2633;
  --institution-listing-surface-mobile: #18202c;
  --institution-listing-border: #2a3442;
  --institution-listing-border-soft: #273243;
  --institution-listing-border-strong: #334155;
  --institution-listing-text: #cbd5e1;
  --institution-listing-text-strong: #f8fafc;
  --institution-listing-text-muted: #94a3b8;
  --institution-listing-link-hover: #60a5fa;
  --institution-listing-shadow-accent: #475569;
  --institution-listing-mobile-shadow: 0 8px 20px rgba(2, 6, 23, 0.22);
}

@media (min-width: 768px) {
  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .institution-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .institution-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .institution-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: var(--institution-listing-surface-mobile);
    border: 1px solid var(--institution-listing-border);
    border-radius: 14px;
    box-shadow: var(--institution-listing-mobile-shadow);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid var(--institution-listing-border-soft);
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .institution-listing-table__contact-link {
    white-space: normal;
    word-break: break-word;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: var(--institution-listing-text-muted);
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .institution-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .institution-listing-table__identity {
    align-items: flex-start;
  }

  .institution-listing-table__actions-cell {
    display: block !important;
  }

  .institution-listing-page :deep(.institution-listing-table__actions-cell .d-flex) {
    justify-content: flex-start !important;
  }
}
</style>
