<script lang="ts" setup>
// =============================================
// IMPORTS
// =============================================
// Vue e Vue Utilities
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';

// Services e Stores
import { invoiceService, invoiceItemService } from "@/app/http/httpServiceProvider";
import { useInvoiceStore } from "@/store/invoice/invoiceStore";

// Tipos e Componentes
import { InvoiceInsertType, InvoiceItemInsertType, InvoiceListingType, InvoiceResponseType } from "../types";
import InvoiceForm from "@/components/invoice/createInvoice/InvoiceForm.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

// =============================================
// COMPOSABLES & UTILITIES
// =============================================
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const invoiceStore = useInvoiceStore();

// =============================================
// COMPONENT EMITS
// =============================================
const emit = defineEmits<{
  (e: 'invoice-created', id: string): void;
}>();

// =============================================
// REACTIVE STATE
// =============================================
const loading = ref(false);
const errorMsg = ref("");
const basicDataValidated = ref(false);
const invoiceItems = ref<InvoiceItemInsertType[]>([]);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;


// Parse do ID da fatura da rota
const invoiceId = ref<string | null>(
  typeof route.params.id === 'string' ? route.params.id :
    Array.isArray(route.params.id) ? route.params.id[0] : null
);

// Dados principais da fatura
const invoiceData = reactive<InvoiceInsertType>({
  invoiceNumber: '',
  serviceProvider: undefined,
  currency: undefined,
  employee: undefined,
  issueDate: new Date(),
  dueDate: new Date(),
  totalAmount: 0,
  isEmployeeInvoice: false,
  dependent: undefined,
  company: '',
  authorizedBy: '',
  invoiceReferenceNumber: '',
  coveragePeriod: undefined
});

const resetInvoiceData = () => {
  Object.assign(invoiceData, {
    invoiceNumber: '',
    serviceProvider: undefined,
    currency: undefined,
    employee: undefined,
    issueDate: new Date(),
    dueDate: new Date(),
    totalAmount: 0,
    isEmployeeInvoice: false,
    dependent: undefined,
    company: '',
    authorizedBy: '',
    invoiceReferenceNumber: '',
    coveragePeriod: undefined
  });

  invoiceItems.value = [];
  basicDataValidated.value = false;
};


// =============================================
// COMPUTED PROPERTIES
// =============================================
const isEditMode = computed(() => !!invoiceId.value);

const currentInvoiceId = computed(() => {
  if (!isEditMode.value) return null;

  const id = typeof route.params.id === 'string' ? route.params.id :
    Array.isArray(route.params.id) ? route.params.id[0] : null;

  return id || invoiceStore.currentInvoiceId;
});

// =============================================
// CORE METHODS
// =============================================
/**
 * Carrega dados de uma fatura existente
 */
const loadInvoiceData = async (id: string) => {
  try {
    loading.value = true;
    errorMsg.value = "";

    const [invoiceResponse, itemsResponse] = await Promise.all([
      invoiceService.getInvoiceById(id),
      invoiceItemService.getInvoiceItemByInvoice(id)
    ]);
    console.log('no index loadInvoiceData Carregando fatura com ID: xxx ', id);
    console.log('no index loadInvoiceData invoiceResponse: xxx ', invoiceResponse);


    if (invoiceResponse?.data) {
      Object.assign(invoiceData, {
        ...invoiceResponse.data,
        company: invoiceResponse.data.employee?.companyId,
        serviceProvider: invoiceResponse.data.serviceProvider?.id,
        employee: invoiceResponse.data.employee?.id,
        currency: invoiceResponse.data.currency?.id,
        dependent: invoiceResponse.data.dependent?.id
      });
    }

    if (itemsResponse?.content) {
      invoiceItems.value = itemsResponse.content.map(item => ({
        ...item,
        taxRate: item.taxRate?.id || '',
        companyAllowedHospitalProcedure: item.companyAllowedHospitalProcedure?.id || '',
        invoice: item.invoice?.id || ''
      }));
    }
  } catch (error) {
    console.error('Error loading invoice:', error);
    toast.error(t('t-error-loading-invoice'));
  } finally {
    loading.value = false;
  }
};

/**
 * Handler para sucesso na operação
 */
const handleSaveSuccess = async (response: any) => {
  if (!response?.data?.id) {
    console.error('No invoice ID in response');
    toast.error(t('t-message-save-error'));
    return;
  }

  const newInvoiceId = response.data.id;

  // Atualiza a store primeiro
  invoiceStore.setDraftInvoice(invoiceData);
  invoiceStore.setCurrentInvoiceId(newInvoiceId);

  toast.success(isEditMode.value
    ? t('t-invoice-updated-success')
    : t('t-invoice-created-success'));

  if (!isEditMode.value) {
    emit('invoice-created', newInvoiceId);
  }

  // Aguarda um tick para garantir que tudo está atualizado
  await nextTick();

  // Navega para a rota de edição e recarrega os dados
  router.push(`/invoices/edit/${newInvoiceId}`).then(() => {
    // Força o recarregamento dos dados após a navegação
    loadInvoiceData(newInvoiceId);
  });
};

// =============================================
// SAVE OPERATIONS
// =============================================
/**
 * Processa operações CRUD para itens da fatura
 */
const processInvoiceItems = async (invoiceId: string, items: InvoiceItemInsertType[]) => {
  if (!items?.length) {
    console.warn('No items to process');
    return [];
  }

  try {
    const existingItemsResponse = await invoiceItemService.getInvoiceItemByInvoice(invoiceId);
    const existingItems = existingItemsResponse.content || [];
    const existingIds = existingItems.map(item => item.id);
    const newIds = items.filter(item => item.id).map(item => item.id);

    // Classificação dos itens
    const itemsToCreate = items.filter(item => !item.id || !existingIds.includes(item.id));
    const itemsToUpdate = items.filter(item => item.id && existingIds.includes(item.id));
    const itemsToDelete = existingItems.filter(item => !newIds.includes(item.id));

    // Execução em paralelo
    return await Promise.all([
      ...itemsToCreate.map(item =>
        invoiceItemService.createInvoiceItem({ ...item, invoice: invoiceId })
      ),
      ...itemsToUpdate.map(item =>
        invoiceItemService.updateInvoiceItem(item.id!, { ...item, invoice: invoiceId })
      ),
      ...itemsToDelete.map(item =>
        invoiceItemService.deleteInvoiceItem(item.id)
      )
    ]);
  } catch (error) {
    console.error("Error processing invoice items:", error);
    throw error;
  }
};

/**
 * Salva a fatura (dados básicos e/ou itens)
 */
interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

const saveInvoice = async (
  param: InvoiceInsertType | InvoiceItemInsertType[],
  callbacks?: {
    onSuccess?: () => void,
    onFinally?: () => void
  }
): Promise<void> => {
  try {
    loading.value = true;
    errorMsg.value = "";

    let response: ServiceResponse<InvoiceResponseType>;

    if (Array.isArray(param)) {
      // Calcula o total amount
      const totalAmount = param.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
      invoiceData.totalAmount = totalAmount;

      if (isEditMode.value && invoiceId.value) {
        // Modo edição - atualiza fatura e itens
        response = await invoiceService.updateInvoice(invoiceId.value, invoiceData);

        if (response?.status === "error") {
          const validationErrors = response?.error?.error?.errors;

          if (validationErrors && typeof validationErrors === "object") {
            Object.values(validationErrors).forEach((messages: any) => {
              if (Array.isArray(messages)) {
                messages.forEach((msg) => toast.error(msg));
              }
            });
            return;
          }

          toast.error(response.error?.message || t("t-message-save-error"));
          return;
        }

        if (response?.data) {
          await processInvoiceItems(invoiceId.value, param);
          await handleSaveSuccess(response);
        }
      } else {
        // Modo criação - cria fatura primeiro, depois itens
        response = await invoiceService.createInvoice(invoiceData);

        if (response?.status === "error") {
          const validationErrors = response?.error?.error?.errors;

          if (validationErrors && typeof validationErrors === "object") {
            Object.values(validationErrors).forEach((messages: any) => {
              if (Array.isArray(messages)) {
                messages.forEach((msg) => toast.error(msg));
              }
            });
            return;
          }

          toast.error(response.error?.message || t("t-message-save-error"));
          return;
        }

        if (response?.data?.id) {
          const newInvoiceId = response.data.id;
          await processInvoiceItems(newInvoiceId, param);
          await handleSaveSuccess(response);
        }
      }
    } else {
      // Apenas dados básicos da fatura
      if (isEditMode.value && invoiceId.value) {
        response = await invoiceService.updateInvoice(invoiceId.value, param);
      } else {
        response = await invoiceService.createInvoice(param);
      }

      if (response?.data) {
        await handleSaveSuccess(response);
      }
    }

    callbacks?.onSuccess?.();

  } catch (error: any) {
    console.error("Erro ao salvar fatura:", error);

    const validationErrors = error?.response?.data?.error?.errors;

    if (validationErrors && typeof validationErrors === "object") {
      Object.values(validationErrors).forEach((messages: any) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(msg));
        }
      });
      return;
    }

    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      t("t-message-save-error")
    );
  } finally {
    loading.value = false;
    callbacks?.onFinally?.();
  }
};


// =============================================
// LIFECYCLE & WATCHERS
// =============================================
watch(() => route.params.id, async (newId) => {
  const parsedId = typeof newId === 'string' ? newId :
    Array.isArray(newId) ? newId[0] : null;

  if (parsedId) {
    await loadInvoiceData(parsedId);
    invoiceStore.setCurrentInvoiceId(parsedId);
    console.log('no index Rota mudou, carregando fatura com ID: xxx ', parsedId);
  }
}, { immediate: true });

watch(
  () => route.params.id,
  (id) => {
    if (!id) {
      console.log('Modo criação → limpar estado');

      invoiceStore.clearDraft();
      resetInvoiceData();
      invoiceId.value = null;
    }
  },
  { immediate: true }
);



onMounted(() => {
  invoiceStore.loadFromStorage();

  if (!route.params.id && invoiceStore.currentInvoiceId) {
    // Apenas em modo criação
    console.log(
      'Carregando rascunho do armazenamento local:',
      invoiceStore.currentInvoiceId
    );

    invoiceId.value = invoiceStore.currentInvoiceId;
    loadInvoiceData(invoiceStore.currentInvoiceId);
    basicDataValidated.value = true;
  }
  
});

</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" xl="9">
        <InvoiceForm v-model="invoiceData" :is-edit-mode="isEditMode" :loading="loading" :initial-items="invoiceItems"
          @save="saveInvoice" @items-ready="(items: InvoiceItemInsertType[]) => saveInvoice(items)"
          @invoiceAttachmentUploaded="loadInvoiceData" />
      </v-col>
    </v-row>
  </v-container>
</template>