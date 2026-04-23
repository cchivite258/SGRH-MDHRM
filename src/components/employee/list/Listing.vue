<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"
import { employeeService } from "@/app/http/httpServiceProvider"
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import Status from "@/app/common/components/Status.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import AdvancedFilter from "@/components/employee/list/AdvancedFilter.vue"
import Overview from "@/components/employee/list/Overview.vue"
import { employeeHeader } from "@/components/employee/list/utils"
import type { EmployeeListingType } from "@/components/employee/types"
import { useEmployeeStore } from "@/store/employee/employeeStore"

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const employeeStore = useEmployeeStore()

const searchQuery = ref("")
const searchProps = "firstName,lastName,email,employeeNumber,phone"
const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const selectedEmployees = ref<any[]>([])

const resetListingFilters = () => {
  employeeStore.clearFilters()
  searchQuery.value = ""
  selectedEmployees.value = []
}

const loading = computed(() => employeeStore.loading)
const totalItems = computed(() => employeeStore.pagination.totalElements)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

watch(selectedEmployees, newSelection => {
  console.log("Funcionários selecionados:", newSelection)
}, { deep: true })

interface FetchParams {
  page: number
  itemsPerPage: number
  sortBy: Array<{ key: string; order: "asc" | "desc" }>
}

const fetchEmployees = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await employeeStore.fetchEmployees(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "createdAt",
    sortBy[0]?.order || "asc"
  )
}

const onView = (id: string) => {
  router.push(`/employee/view/${id}`)
}

const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteEmployee = async () => {
  if (!deleteId.value) return

  deleteLoading.value = true
  try {
    await employeeService.deleteEmployee(deleteId.value)
    toast.success(t("t-toast-message-deleted"))
    await employeeStore.fetchEmployees(0, itemsPerPage.value)
  } catch {
    toast.error(t("t-toast-message-deleted-error"))
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
  }
}

const toggleSelection = (item: EmployeeListingType) => {
  const index = selectedEmployees.value.findIndex(selected => selected.id === item.id)
  if (index === -1) {
    selectedEmployees.value = [...selectedEmployees.value, item]
  } else {
    selectedEmployees.value = selectedEmployees.value.filter(selected => selected.id !== item.id)
  }
}

const shouldHighlight = (employee: EmployeeListingType) => {
  return !!employee.alertFlag && employee.alertFlag !== "UNFLAGGED"
}

const getAlertMessage = (employee: EmployeeListingType) => {
  if (!shouldHighlight(employee)) return ""

  switch (employee.alertFlag) {
    case "EXCEEDS_NUMBER_OF_DEPENDENTS":
      return t("t-exceeds-number-of-dependents")
    default:
      return "Problemas identificados no cadastro"
  }
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
    class="employee-listing-page"
    :title="$t('t-employee-list')"
    subtitle="Consulte, pesquise e faça a gestão dos colaboradores registados."
    :action-label="$t('t-add-employee')"
    action-to="/employee/create"
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
      v-model="selectedEmployees"
      v-model:page="currentPage"
      :headers="employeeHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="employeeStore.employees"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loading"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      show-select
      @load-items="fetchEmployees"
    >
      <template #body="{ items }: { items: readonly unknown[] }">
        <tr
          v-for="item in items as EmployeeListingType[]"
          :key="item.id"
          :class="[shouldHighlight(item) ? 'bg-danger-subtle' : '', 'employee-listing-table__row']"
        >
          <v-tooltip v-if="shouldHighlight(item)" location="top">
            <template #activator="{ props }">
              <td v-bind="props" data-label="">
                <v-checkbox
                  :model-value="selectedEmployees.some(selected => selected.id === item.id)"
                  hide-details
                  density="compact"
                  @update:model-value="toggleSelection(item)"
                />
              </td>
            </template>
            <span>{{ getAlertMessage(item) }}</span>
          </v-tooltip>

          <td v-else data-label="">
            <v-checkbox
              :model-value="selectedEmployees.some(selected => selected.id === item.id)"
              hide-details
              density="compact"
              @update:model-value="toggleSelection(item)"
            />
          </td>

          <v-tooltip v-if="shouldHighlight(item)" location="top">
            <template #activator="{ props }">
              <td
                v-bind="props"
                data-label="Número"
                class="employee-listing-table__primary-cell cursor-pointer"
                @click="onView(item.id)"
              >
                #{{ item.employeeNumber || "N/A" }}
              </td>
            </template>
            <span>{{ getAlertMessage(item) }}</span>
          </v-tooltip>

          <td
            v-else
            data-label="Número"
            class="employee-listing-table__primary-cell cursor-pointer"
            @click="onView(item.id)"
          >
            #{{ item.employeeNumber || "N/A" }}
          </td>

          <v-tooltip v-if="shouldHighlight(item)" location="top">
            <template #activator="{ props }">
              <td v-bind="props" data-label="Colaborador">
                {{ item.firstName }} {{ item.lastName }}
              </td>
            </template>
            <span>{{ getAlertMessage(item) }}</span>
          </v-tooltip>

          <td v-else data-label="Colaborador">
            {{ item.firstName }} {{ item.lastName }}
          </td>

          <v-tooltip v-if="shouldHighlight(item)" location="top">
            <template #activator="{ props }">
              <td v-bind="props" data-label="Telemóvel">
                {{ item.phone || "N/A" }}
              </td>
            </template>
            <span>{{ getAlertMessage(item) }}</span>
          </v-tooltip>

          <td v-else data-label="Telemóvel">
            {{ item.phone || "N/A" }}
          </td>

          <v-tooltip v-if="shouldHighlight(item)" location="top">
            <template #activator="{ props }">
              <td v-bind="props" data-label="Email">
                {{ item.email || "N/A" }}
              </td>
            </template>
            <span>{{ getAlertMessage(item) }}</span>
          </v-tooltip>

          <td v-else data-label="Email">
            {{ item.email || "N/A" }}
          </td>

          <td data-label="Habilitado?">
            <Status :status="item.enabled ? 'enabled' : 'disabled'" />
          </td>

          <td data-label="Acção" class="employee-listing-table__actions-cell">
            <TableAction
              @on-view="() => router.push(`/employee/view/${item.id}`)"
              @onEdit="() => router.push(`/employee/edit/${item.id}`)"
              @onDelete="() => openDeleteDialog(item.id)"
            />
          </td>
        </tr>
      </template>

      <template v-if="employeeStore.employees.length === 0" #body>
        <tr>
          <td :colspan="employeeHeader.length" class="employee-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="employee-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="employee-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="employee-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faça uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="deleteEmployee" />
</template>

<style scoped>
.employee-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.employee-listing-page :deep(.v-table),
.employee-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.employee-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.employee-listing-page :deep(.v-table__wrapper > table > thead),
.employee-listing-page :deep(.v-data-table thead) {
  background: #f3f6fa;
}

.employee-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.employee-listing-page :deep(.v-data-table-header th),
.employee-listing-page :deep(.v-data-table__th) {
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

.employee-listing-page :deep(.v-table__wrapper > table) {
  table-layout: auto;
  width: 100%;
}

.employee-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.employee-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.employee-listing-page :deep(.v-data-table-header th:last-child),
.employee-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.employee-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.employee-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.employee-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.employee-listing-page :deep(.v-data-table-header__sort-icon) {
  color: #94a3b8;
  font-size: 0.82rem;
  opacity: 1;
}

.employee-listing-page :deep(.v-data-table__td) {
  background: #ffffff;
}

.employee-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 0.8rem;
  padding-top: 20px;
  padding-bottom: 20px;
  vertical-align: middle;
}

.employee-listing-page :deep(.v-data-table__tr:hover) {
  background: #fcfdff !important;
}

.employee-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 #cbd5e1;
}

.employee-listing-page :deep(.v-data-table__td--select),
.employee-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.employee-listing-page :deep(.v-selection-control) {
  min-height: auto;
}

.employee-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.employee-listing-page :deep(.v-checkbox .v-selection-control__wrapper) {
  color: #64748b;
}

.employee-listing-table__primary-cell {
  color: #334155;
  font-weight: 500;
  line-height: 1.45;
  transition: color 0.18s ease;
}

.employee-listing-table__primary-cell:hover {
  color: #0f172a;
}

.employee-listing-page :deep(.v-chip) {
  font-size: 0.8rem !important;
  font-weight: 500 !important;
}

.employee-listing-page :deep(.v-chip .status-chip),
.employee-listing-page :deep(.v-chip .v-chip__content) {
  font-size: inherit;
  font-weight: inherit;
}

.employee-listing-table__actions-cell {
  white-space: nowrap;
}

.employee-listing-page :deep(.employee-listing-table__actions-cell .d-flex) {
  gap: 6px;
}

.employee-listing-page :deep(.employee-listing-table__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.employee-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.employee-listing-table__empty-avatar {
  border: 1px solid #e2e8f0;
}

.employee-listing-table__empty-title {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 700;
}

.employee-listing-table__empty-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .employee-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .employee-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .employee-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: #ffffff;
    border: 1px solid #e5edf6;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid #eef2f7;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: #64748b;
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .employee-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .employee-listing-table__actions-cell {
    display: block !important;
  }

  .employee-listing-page :deep(.employee-listing-table__actions-cell .d-flex) {
    justify-content: flex-start !important;
  }
}
</style>
