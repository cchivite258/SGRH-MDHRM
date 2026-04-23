<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from "vue"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { useI18n } from "vue-i18n"
import { useToast } from "vue-toastification"
import CancelInvoiceConfirmationDialog from "@/app/common/components/CancelInvoiceConfirmationDialog.vue"
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue"
import PostInvoiceConfirmationDialog from "@/app/common/components/PostInvoiceConfirmationDialog.vue"
import ReverseInvoiceConfirmationDialog from "@/app/common/components/ReverseInvoiceConfirmationDialog.vue"
import ReverseInvoiceNotesDialog from "@/app/common/components/ReverseInvoiceNotesDialog.vue"
import Status from "@/app/common/components/Status.vue"
import { formateDate } from "@/app/common/dateFormate"
import { invoiceService } from "@/app/http/httpServiceProvider"
import AdvancedFilter from "@/components/invoice/list/AdvancedFilter.vue"
import { invoiceHeader, Options } from "@/components/invoice/list/utils"
import type { InvoiceListingType } from "@/components/invoice/types"
import { useInvoiceStore } from "@/store/invoice/invoiceStore"

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const invoiceStore = useInvoiceStore()

const searchQuery = ref("")
const searchProps = "invoiceNumber,issueDate,dueDate,totalAmount,employee.firstName,clinic.name,invoiceReferenceNumber,invoiceStatus"
const postDialog = ref(false)
const postFlaggedDialog = ref(false)
const postId = ref<string | null>(null)
const postFlaggedId = ref<string | null>(null)
const postLoading = ref(false)
const postFlaggedLoading = ref(false)
const cancelDialog = ref(false)
const cancelId = ref<string | null>(null)
const cancelLoading = ref(false)
const reverseDialog = ref(false)
const reverseNotesDialog = ref(false)
const reverseId = ref<string | null>(null)
const reverseLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const selectedInvoices = ref<any[]>([])

const resetListingFilters = () => {
  invoiceStore.clearFilters()
  searchQuery.value = ""
  selectedInvoices.value = []
}

const loading = computed(() => invoiceStore.loading)
const totalItems = computed(() => invoiceStore.pagination.totalElements)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

watch(selectedInvoices, newSelection => {
  console.log("Facturas selecionadas:", newSelection)
}, { deep: true })

interface FetchParams {
  page: number
  itemsPerPage: number
  sortBy: Array<{ key: string; order: "asc" | "desc" }>
}

const fetchInvoices = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await invoiceStore.fetchInvoices(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "createdAt",
    sortBy[0]?.order || "asc"
  )
}

const onView = (id: string) => {
  router.push(`/invoices/view/${id}`)
}

const openPostFlaggedDialog = (id: string) => {
  postFlaggedId.value = id
  postFlaggedDialog.value = true
}

const postFlaggedInvoice = async () => {
  if (!postFlaggedId.value) return

  postFlaggedLoading.value = true
  try {
    await invoiceService.postFlaggedInvoice(postFlaggedId.value)
    toast.success(t("t-toast-message-post"))
    await invoiceStore.fetchInvoices(0, itemsPerPage.value)
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null) {
      const apiError = error as { message?: string }
      toast.error(apiError.message || t("t-toast-message-error"))
    } else {
      toast.error(t("t-toast-message-error"))
    }
  } finally {
    postFlaggedLoading.value = false
    postFlaggedDialog.value = false
  }
}

const openPostDialog = (id: string) => {
  postId.value = id
  postDialog.value = true
}

const postInvoice = async () => {
  if (!postId.value) return

  postLoading.value = true
  try {
    await invoiceService.postInvoice(postId.value)
    toast.success(t("t-toast-message-post"))
    await invoiceStore.fetchInvoices(0, itemsPerPage.value)
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null) {
      const apiError = error as { message?: string }
      toast.error(apiError.message || t("t-toast-message-error"))
    } else {
      toast.error(t("t-toast-message-error"))
    }
  } finally {
    postLoading.value = false
    postDialog.value = false
  }
}

const openCancelDialog = (id: string) => {
  cancelId.value = id
  cancelDialog.value = true
}

const cancelInvoice = async () => {
  if (!cancelId.value) return

  cancelLoading.value = true
  try {
    await invoiceService.cancelInvoice(cancelId.value)
    toast.success(t("t-toast-message-cancel"))
    await invoiceStore.fetchInvoices(0, itemsPerPage.value)
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null) {
      const apiError = error as { message?: string }
      toast.error(apiError.message || t("t-toast-message-error"))
    } else {
      toast.error(t("t-toast-message-error"))
    }
  } finally {
    cancelLoading.value = false
    cancelDialog.value = false
  }
}

const openReverseDialog = (id: string) => {
  reverseId.value = id
  reverseDialog.value = true
}

const openReverseNotesDialog = () => {
  reverseDialog.value = false
  reverseNotesDialog.value = true
}

const reverseInvoice = async (notes: string) => {
  if (!reverseId.value) return

  reverseLoading.value = true
  try {
    await invoiceService.reverseInvoice(reverseId.value, notes)
    toast.success(t("t-toast-message-reverse"))
    await invoiceStore.fetchInvoices(0, itemsPerPage.value)
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null) {
      const apiError = error as { message?: string }
      toast.error(apiError.message || t("t-toast-message-error"))
    } else {
      toast.error(t("t-toast-message-error"))
    }
  } finally {
    reverseLoading.value = false
    reverseDialog.value = false
    reverseNotesDialog.value = false
  }
}

const toggleSelection = (item: InvoiceListingType) => {
  const index = selectedInvoices.value.findIndex(selected => selected.id === item.id)
  if (index === -1) {
    selectedInvoices.value = [...selectedInvoices.value, item]
  } else {
    selectedInvoices.value = selectedInvoices.value.filter(selected => selected.id !== item.id)
  }
}

const onCreateEditClick = (id: string) => {
  router.push(`/invoices/edit/${id}`)
}

const onPost = (id: string) => {
  openPostDialog(id)
}

const onPostFlagged = (id: string) => {
  openPostFlaggedDialog(id)
}

const onCancel = (id: string) => {
  openCancelDialog(id)
}

const onReverse = (invoice: InvoiceListingType) => {
  if (invoice.invoiceStatus !== "POSTED") {
    toast.error(t("t-invoice-reverse-only-posted"))
    return
  }

  openReverseDialog(invoice.id)
}

const getDynamicOptions = (invoice: InvoiceListingType) => {
  let availableOptions = Options.filter(option => option.title !== "reverse")

  if (invoice.invoiceStatus === "CANCELLED" || invoice.invoiceStatus === "REVERSED") {
    availableOptions = availableOptions.filter(option => option.title === "view")
  } else if (invoice.invoiceStatus === "POSTED") {
    availableOptions = Options.filter(option => option.title === "view" || option.title === "reverse")
  }

  return availableOptions.map(option => ({
    ...option,
    title: t(`t-${option.title}`)
  }))
}

const onSelect = (option: string, data: InvoiceListingType) => {
  switch (option) {
    case "view":
      onView(data.id)
      break
    case "edit":
      onCreateEditClick(data.id)
      break
    case "post":
      onPost(data.id)
      break
    case "force-post":
      onPostFlagged(data.id)
      break
    case "cancel":
      onCancel(data.id)
      break
    case "reverse":
      onReverse(data)
      break
  }
}

const formatAmount = (amount: number | string) => {
  if (amount === null || amount === undefined || amount === "N/A") return "N/A"

  const num = typeof amount === "string" ? parseFloat(amount) : amount

  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

const getInvoiceAlerts = (invoice: InvoiceListingType) => {
  const alerts: string[] = []

  if (invoice.flag === "EXCEEDS_GLOBAL_LIMIT") alerts.push(t("t-exceeds-global-limit"))
  if (invoice.flag === "INSUFFICIENT_FUNDS") alerts.push(t("t-insufficient-funds"))
  if (invoice.areItemsFlagged === true) alerts.push(t("t-exceeds-procedure-limit"))

  return alerts
}

const shouldHighlight = (invoice: InvoiceListingType) => {
  return (!!invoice.flag && invoice.flag !== "UNFLAGGED") || invoice.areItemsFlagged === true
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
    class="invoice-listing-page"
    :title="$t('t-invoice-list')"
    subtitle="Consulte, pesquise e faça a gestão das facturas registadas."
    :action-label="$t('t-add-invoice')"
    action-to="/invoices/create"
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
      v-model="selectedInvoices"
      v-model:page="currentPage"
      :headers="invoiceHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="invoiceStore.invoices"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loading"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      show-select
      @load-items="fetchInvoices"
    >
      <template #body="{ items }: { items: readonly unknown[] }">
        <tr
          v-for="item in items as InvoiceListingType[]"
          :key="item.id"
          :class="[shouldHighlight(item) ? 'bg-danger-subtle' : '', 'invoice-listing-table__row']"
        >
          <td data-label="">
            <v-checkbox
              :model-value="selectedInvoices.some(selected => selected.id === item.id)"
              hide-details
              density="compact"
              @update:model-value="toggleSelection(item)"
            />
          </td>
          <td data-label="Factura" class="invoice-listing-table__primary-cell cursor-pointer" @click="onView(item.id)">
            <div class="d-flex align-center ga-2">
              <span>{{ item.invoiceNumber || "N/A" }}</span>
              <v-tooltip v-if="getInvoiceAlerts(item).length" location="top">
                <template #activator="{ props }">
                  <i v-bind="props" class="ph ph-warning-circle text-danger" />
                </template>
                <span>{{ getInvoiceAlerts(item).join(" | ") }}</span>
              </v-tooltip>
            </div>
          </td>
          <td data-label="Colaborador">
            {{ item.employee?.firstName || "N/A" }} {{ item.employee?.lastName || "N/A" }}
          </td>
          <td data-label="Provedor">
            {{ item.serviceProvider?.name || "N/A" }}
          </td>
          <td data-label="Total" class="invoice-listing-table__amount-cell">
            {{ formatAmount(item.totalAmount) || "N/A" }} {{ item.currency?.symbol }}
          </td>
          <td data-label="Vencimento">
            {{ formateDate(item.dueDate) || "N/A" }}
          </td>
          <td data-label="Estado">
            <Status :status="item.invoiceStatus" />
          </td>
          <td data-label="Acção" class="invoice-listing-table__actions-cell">
            <ListMenuWithIcon :menuItems="getDynamicOptions(item)" @onSelect="onSelect($event, item)" />
          </td>
        </tr>
      </template>

      <template v-if="invoiceStore.invoices.length === 0" #body>
        <tr>
          <td :colspan="invoiceHeader.length" class="invoice-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="invoice-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="invoice-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="invoice-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faça uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <PostInvoiceConfirmationDialog v-model="postDialog" :loading="postLoading" @onConfirm="postInvoice" />
  <PostInvoiceConfirmationDialog v-model="postFlaggedDialog" :loading="postFlaggedLoading" @onConfirm="postFlaggedInvoice" />
  <CancelInvoiceConfirmationDialog v-model="cancelDialog" :loading="cancelLoading" @onConfirm="cancelInvoice" />
  <ReverseInvoiceConfirmationDialog v-model="reverseDialog" :loading="reverseLoading" @onConfirm="openReverseNotesDialog" />
  <ReverseInvoiceNotesDialog v-model="reverseNotesDialog" :loading="reverseLoading" @onConfirm="reverseInvoice" />
</template>

<style scoped>
.invoice-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.invoice-listing-page :deep(.v-table),
.invoice-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.invoice-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.invoice-listing-page :deep(.v-table__wrapper > table > thead),
.invoice-listing-page :deep(.v-data-table thead) {
  background: #f3f6fa;
}

.invoice-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.invoice-listing-page :deep(.v-data-table-header th),
.invoice-listing-page :deep(.v-data-table__th) {
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

.invoice-listing-page :deep(.v-table__wrapper > table) {
  table-layout: auto;
  width: 100%;
}

.invoice-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.invoice-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.invoice-listing-page :deep(.v-data-table-header th:last-child),
.invoice-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.invoice-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.invoice-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.invoice-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.invoice-listing-page :deep(.v-data-table-header__sort-icon) {
  color: #94a3b8;
  font-size: 0.82rem;
  opacity: 1;
}

.invoice-listing-page :deep(.v-data-table__td) {
  background: #ffffff;
}

.invoice-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 0.8rem;
  padding-top: 20px;
  padding-bottom: 20px;
  vertical-align: middle;
}

.invoice-listing-page :deep(.v-data-table__tr:hover) {
  background: #fcfdff !important;
}

.invoice-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 #cbd5e1;
}

.invoice-listing-page :deep(.v-data-table__td--select),
.invoice-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.invoice-listing-page :deep(.v-selection-control) {
  min-height: auto;
}

.invoice-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.invoice-listing-page :deep(.v-checkbox .v-selection-control__wrapper) {
  color: #64748b;
}

.invoice-listing-table__primary-cell {
  color: #334155;
  font-weight: 500;
  line-height: 1.45;
  transition: color 0.18s ease;
}

.invoice-listing-table__primary-cell:hover {
  color: #0f172a;
}

.invoice-listing-table__amount-cell {
  white-space: nowrap;
}

.invoice-listing-page :deep(.v-chip) {
  font-size: 0.8rem !important;
  font-weight: 500 !important;
}

.invoice-listing-page :deep(.v-chip .status-chip),
.invoice-listing-page :deep(.v-chip .v-chip__content) {
  font-size: inherit;
  font-weight: inherit;
}

.invoice-listing-table__actions-cell {
  white-space: nowrap;
}

.invoice-listing-page :deep(.invoice-listing-table__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.invoice-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.invoice-listing-table__empty-avatar {
  border: 1px solid #e2e8f0;
}

.invoice-listing-table__empty-title {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 700;
}

.invoice-listing-table__empty-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .invoice-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .invoice-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .invoice-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: #ffffff;
    border: 1px solid #e5edf6;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid #eef2f7;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: #64748b;
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .invoice-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .invoice-listing-table__amount-cell {
    white-space: normal;
  }

  .invoice-listing-table__actions-cell {
    display: block !important;
  }
}
</style>
