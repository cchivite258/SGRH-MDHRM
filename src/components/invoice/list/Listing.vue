<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useInvoiceStore } from "@/store/invoice/invoiceStore"
import { invoiceService } from "@/app/http/httpServiceProvider"
import { useToast } from 'vue-toastification'
import { useI18n } from "vue-i18n"

// Components
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import PostInvoiceConfirmationDialog from "@/app/common/components/PostInvoiceConfirmationDialog.vue"
import CancelInvoiceConfirmationDialog from "@/app/common/components/CancelInvoiceConfirmationDialog.vue"
import { invoiceHeader, Options } from "@/components/invoice/list/utils"
import Card from "@/app/common/components/Card.vue"
import Status from "@/app/common/components/Status.vue";
import { formateDate } from "@/app/common/dateFormate";
import { InvoiceListingType } from "../types"
import axios from "axios"
import AdvancedFilter from "@/components/invoice/list/AdvancedFilter.vue"; 

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const invoiceStore = useInvoiceStore()

// Estado do componente
const searchQuery = ref("")
const searchProps = "invoiceNumber,issueDate,dueDate,totalAmount,employee.firstName,clinic.name,invoiceReferenceNumber,invoiceStatus" // Campos de pesquisa,
const postDialog = ref(false)
const postFlaggedDialog = ref(false)
const postId = ref<string | null>(null)
const postFlaggedId = ref<string | null>(null)
const postLoading = ref(false)
const postFlaggedLoading = ref(false)
const cancelDialog = ref(false)
const cancelId = ref<string | null>(null)
const cancelLoading = ref(false)
const itemsPerPage = ref(10)
const selectedInvoices = ref<any[]>([]) // Armazena os funcionários selecionados

// Computed properties
const loading = computed(() => invoiceStore.loading)
const totalItems = computed(() => invoiceStore.pagination.totalElements)

// Observa mudanças nos funcionários selecionados
watch(selectedInvoices, (newSelection) => {
  console.log('Instituicoes selecionadas:', newSelection)
}, { deep: true })

interface FetchParams {
  page: number
  itemsPerPage: number
  sortBy: { key: string, order: 'asc' | 'desc' }[]
  search: string
}

// Busca os funcionários com os parâmetros atuais
const fetchInvoices = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  await invoiceStore.fetchInvoices( 
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
  )
}

// Navega para a página de visualização
const onView = (id: string) => {
  router.push(`/invoices/view/${id}`)
}

// Abre o diálogo de confirmação para do lançamento
const openPostFlaggedDialog = (id: string) => {
  postFlaggedId.value = id
  postFlaggedDialog.value = true
}

const postFlaggedInvoice = async () => {
  if (!postFlaggedId.value) return;

  postFlaggedLoading.value = true;
  try {
    await invoiceService.postFlaggedInvoice(postFlaggedId.value);
    toast.success(t('t-toast-message-post'));
    await invoiceStore.fetchInvoices(0, itemsPerPage.value);
  } catch (error: unknown) {
    console.log('Erro completo:', error); // Para debugging
    
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        message?: string;
        details?: any;
        status?: number;
      };
      
      if (apiError.message) {
        // Mostra a mensagem direta do erro
        toast.error(apiError.message);
      } else {
        // Fallback para mensagem genérica
        toast.error(t('t-toast-message-error'));
      }
    } else {
      // Caso o erro não seja um objeto
      toast.error(t('t-toast-message-error'));
    }
  } finally {
    postFlaggedLoading.value = false;
    postFlaggedDialog.value = false;
  }
};

// Abre o diálogo de confirmação para do lançamento
const openPostDialog = (id: string) => {
  postId.value = id
  postDialog.value = true
}

const postInvoice = async () => {
  if (!postId.value) return;

  postLoading.value = true;
  try {
    await invoiceService.postInvoice(postId.value);
    toast.success(t('t-toast-message-post'));
    await invoiceStore.fetchInvoices(0, itemsPerPage.value);
  } catch (error: unknown) {
    console.log('Erro completo:', error); // Para debugging
    
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        message?: string;
        details?: any;
        status?: number;
      };
      
      if (apiError.message) {
        // Mostra a mensagem direta do erro
        toast.error(apiError.message);
      } else {
        // Fallback para mensagem genérica
        toast.error(t('t-toast-message-error'));
      }
    } else {
      // Caso o erro não seja um objeto
      toast.error(t('t-toast-message-error'));
    }
  } finally {
    postLoading.value = false;
    postDialog.value = false;
  }
};

// Abre o diálogo de confirmação para do lançamento
const openCancelDialog = (id: string) => {
  cancelId.value = id
  cancelDialog.value = true
}

const cancelInvoice = async () => {
  if (!cancelId.value) return;

  cancelLoading.value = true;
  try {
    await invoiceService.cancelInvoice(cancelId.value);
    toast.success(t('t-toast-message-cancel'));
    await invoiceStore.fetchInvoices(0, itemsPerPage.value);
  } catch (error: unknown) {
    console.log('Erro completo:', error); // Para debugging
    
    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        message?: string;
        details?: any;
        status?: number;
      };
      
      if (apiError.message) {
        // Mostra a mensagem direta do erro
        toast.error(apiError.message);
      } else {
        // Fallback para mensagem genérica
        toast.error(t('t-toast-message-error'));
      }
    } else {
      // Caso o erro não seja um objeto
      toast.error(t('t-toast-message-error'));
    }
  } finally {
    cancelLoading.value = false;
    cancelDialog.value = false;
  }
};
// Abre o diálogo de confirmação para exclusão
/*
const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

// Executa a exclusão do funcionário
const deleteInvoice = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await invoiceService.deleteInvoice(deleteId.value);
    toast.success(t('t-toast-message-deleted'));
    await invoiceStore.fetchInvoices(0, itemsPerPage.value);
  } catch (error) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || t('t-toast-message-error'));
    } else {
      toast.error(t('t-toast-message-error'));
    }
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};
*/

const toggleSelection = (item: InvoiceListingType) => {
  const index = selectedInvoices.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedInvoices.value = [...selectedInvoices.value, item];
  } else {
    selectedInvoices.value = selectedInvoices.value.filter(selected => selected.id !== item.id);
  }
};

const onCreateEditClick = (id: string) => {
  router.push(`/invoices/edit/${id}`);
}

const onViewClick = (id: string) => {
  router.push(`/invoices/view/${id}`);
}

/*
const onDelete = (id: string) => {
openDeleteDialog(id);
}
*/

const onPost = (id: string) => {
  openPostDialog(id);
}

const onPostFlagged = (id: string) => {
  openPostFlaggedDialog(id);
}
const onCancel = (id: string) => {
  openCancelDialog(id);
}

const getDynamicOptions = (invoice: InvoiceListingType) => {
  // Opções base
  let availableOptions = [...Options];
  
  // Filtrar opções com base no status
  if (invoice.invoiceStatus === 'CANCELLED' || invoice.invoiceStatus === 'POSTED') {
    availableOptions = availableOptions.filter(option => 
      option.title === 'view'
    );
  }
  
  return availableOptions.map(option => ({
    ...option,
    title: t(`t-${option.title}`)
  }));
};


const onSelect = (option: string, data: InvoiceListingType) => {
  switch (option) {
    case "view":
      onViewClick(data.id);
      break;
    case "edit":
      onCreateEditClick(data.id);
      break;
    case "post":
      onPost(data.id); 
      break;
    case "force-post":
      onPostFlagged(data.id); 
      break;
    case "cancel":
      onCancel(data.id); 
      break;
  }
};

const formatAmount = (amount: number | string) => {
  if (amount === null || amount === undefined || amount === 'N/A') return 'N/A';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const hasFlaggedItems = (invoice: InvoiceListingType) => invoice.areItemsFlagged === true;

const shouldHighlight = (invoice: InvoiceListingType) =>
  invoice.flag !== 'UNFLAGGED' || hasFlaggedItems(invoice);
</script>
<template>
  <Card :title="$t('t-invoice-list')" class="mt-7">
    
     <v-card-title class="mt-2">
      <v-row justify="space-between" class="mt-n6">
        <v-col lg="12">
          <AdvancedFilter />
        </v-col>
      </v-row>
      <v-row justify="space-between" class="mt-n6">
        <v-col lg="8">
        </v-col>
        <v-col lg="auto">
          <v-btn color="secondary" to="/invoices/create" block>
            <i class="ph-plus-circle" /> {{ $t('t-add-invoice') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <DataTableServer v-model="selectedInvoices"
        :headers="invoiceHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="invoiceStore.invoices" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loading" :search-query="searchQuery" @load-items="fetchInvoices" item-value="id"
        show-select>
        <template #body="{ items }: { items: readonly unknown[] }">
          <tr v-for="item in items as InvoiceListingType[]" :key="item.id" :class="[shouldHighlight(item) ? 'bg-danger-subtle' : '']" >
            <td>
              <v-checkbox :model-value="selectedInvoices.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td class="text-primary cursor-pointer" @click="onView(item.id)">
              <div class="d-flex align-center ga-2">
                <span>{{ item.invoiceNumber || 'N/A' }}</span>
                <v-tooltip v-if="hasFlaggedItems(item)" location="top">
                  <template #activator="{ props }">
                    <i v-bind="props" class="ph ph-warning-circle text-danger" />
                  </template>
                  <span>{{ $t('t-items-flagged') }}</span>
                </v-tooltip>
              </div>
            </td>
            <td>{{ item.employee?.firstName || 'N/A' }} {{ item.employee?.lastName || 'N/A' }} </td>
            <td>{{ item.serviceProvider?.name || 'N/A' }}</td>
            <td>{{ formatAmount(item.totalAmount) || 'N/A' }} {{ item.currency?.symbol }}</td>
            <td>{{ formateDate(item.dueDate) || 'N/A' }}</td>
            <td><Status :status="item.invoiceStatus" /></td>
            <td>
              <ListMenuWithIcon  :menuItems="getDynamicOptions(item)" @onSelect="onSelect($event, item)" />
            </td>
          </tr>
        </template>

        <template v-if="invoiceStore.invoices.length === 0" #body>
          <tr>
            <td :colspan="invoiceHeader.length" class="text-center py-10">
              <v-avatar size="80" color="primary" variant="tonal">
                <i class="ph-magnifying-glass" style="font-size: 30px" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold mt-3">
                {{ $t('t-search-not-found-message') }}
              </div>
            </td>
          </tr>
        </template>

      </DataTableServer>
    </v-card-text>
  </Card>

  <PostInvoiceConfirmationDialog v-model="postDialog" @onConfirm="postInvoice" :loading="postLoading" />
  <PostInvoiceConfirmationDialog v-model="postFlaggedDialog" @onConfirm="postFlaggedInvoice" :loading="postFlaggedLoading" />
  <CancelInvoiceConfirmationDialog v-model="cancelDialog" @onConfirm="cancelInvoice" :loading="cancelLoading" />
</template>
