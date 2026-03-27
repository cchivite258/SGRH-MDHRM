<script lang="ts" setup>
import InvoiceForm from "@/components/invoice/view/InvoiceForm.vue";
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { invoiceService, invoiceItemService } from "@/app/http/httpServiceProvider";
import { useInvoiceStore } from "@/store/invoice/invoiceStore";
import { InvoiceInsertType, InvoiceItemInsertType } from "../types";

/**
 * Composables - Instâncias de utilitários globais
 */
const { t } = useI18n(); // Internacionalização
const route = useRoute(); // Rota atual
const router = useRouter(); // Controle de navegação
const toast = useToast(); // Notificações
const invoiceStore = useInvoiceStore(); // Store de faturas

/**
 * Emits - Eventos que este componente emite
 */
const emit = defineEmits<{
  (e: 'invoice-created', id: string): void; // Quando uma nova fatura é criada
}>();

/**
 * Estado do componente
 */
const loading = ref(false); // Estado de carregamento global
const errorMsg = ref(""); // Mensagem de erro
const basicDataValidated = ref(false); // Validação básica
const invoiceItems = ref<InvoiceItemInsertType[]>([]); // Itens da fatura

// Obtém o ID da fatura da rota (se estiver em modo de edição)
const invoiceId = ref<string | null>(
  typeof route.params.id === 'string' ? route.params.id :
    Array.isArray(route.params.id) ? route.params.id[0] : null
);

/**
 * Computed - Valores reativos derivados
 */
const isEditMode = computed(() => !!invoiceId.value); // Determina se está em modo de edição

/**
 * Dados reativos da fatura
 */
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

/**
 * Carrega os dados de uma fatura existente
 * @param id - ID da fatura a ser carregada
 */
const loadInvoiceData = async (id: string) => {
  try {
    loading.value = true;

    // Carrega em paralelo os dados da fatura e seus itens
    const [invoiceResponse, itemsResponse] = await Promise.all([
      invoiceService.getInvoiceById(id),
      invoiceItemService.getInvoiceItemByInvoice(id)
    ]);

    console.log("invoiceResponse: ", invoiceResponse);
    console.log("itemsResponse: ", itemsResponse);

    // Atualiza os dados da fatura se existirem
    if (invoiceResponse?.data) {
      Object.assign(invoiceData, invoiceResponse.data);
      // Mapeia os relacionamentos
      invoiceData.company = invoiceResponse.data.employee?.companyId || undefined;
      invoiceData.serviceProvider = invoiceResponse.data.serviceProvider?.id || undefined;
      invoiceData.employee = invoiceResponse.data.employee?.id || undefined;
      invoiceData.currency = invoiceResponse.data.currency?.id || undefined;
      invoiceData.dependent = invoiceResponse.data.dependent?.id || undefined;
    }

    // Processa os itens da factura
    if (itemsResponse?.content) {
      invoiceItems.value = itemsResponse.content.map(item => ({
        ...item,
        taxRate: item.taxRate?.id || '',
        companyAllowedHospitalProcedure: item.companyAllowedHospitalProcedure?.id || '',
        invoice: item.invoice?.id || ''
      }));
    }

  } catch (error) {
    toast.error(t('t-error-loading-invoice'));
    console.error('Error loading invoice:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * Trata o sucesso na operação de salvar
 * @param response - Resposta da API
 */
const handleSaveSuccess = (response: any) => {
  // Atualiza o store e busca as faturas mais recentes
  invoiceStore.setDraftInvoice(invoiceData);
  invoiceStore.fetchInvoices(0, invoiceStore.pagination.itemsPerPage || 10);

  // Feedback visual
  toast.success(isEditMode.value
    ? t('t-invoice-updated-success')
    : t('t-invoice-created-success'));

  // Emite evento se for uma nova fatura
  if (!isEditMode.value && response?.data?.id) {
    emit('invoice-created', response.data.id);
  }

  // Redireciona para a lista
  router.push('/invoices/list');
};

/**
 * Trata erros da API
 * @param error - Erro ocorrido
 */
const handleApiError = (error: any) => {
  const message = error?.response?.data?.message || error.message || t('t-error-saving-employee');
  toast.error(message);
  errorMsg.value = message;
  setTimeout(() => errorMsg.value = "", 5000);
};

/**
 * Watchers - Reação a mudanças
 */

// Observa mudanças no ID da rota para carregar os dados corretos
watch(() => route.params.id, async (newId) => {
  const newInvoiceId = typeof newId === 'string' ? newId :
    Array.isArray(newId) ? newId[0] : null;

  if (newInvoiceId) {
    console.log('Loading data for invoice:', newInvoiceId);
    await loadInvoiceData(newInvoiceId);
    invoiceStore.setCurrentInvoiceId(newInvoiceId);
  }
}, { immediate: true });

/**
 * Lifecycle hooks
 */
onMounted(() => {
  // Limpa o ID se estiver em modo de criação
  if (!route.params.id) {
    invoiceStore.setCurrentInvoiceId('');
  }

  // Carrega dados do storage local
  invoiceStore.loadFromStorage();

  // Se houver ID no store, usa ele
  if (invoiceStore.currentInvoiceId) {
    invoiceId.value = invoiceStore.currentInvoiceId;
    basicDataValidated.value = true;
  }
});

/**
 * Computed - ID atual da fatura (considera rota e store)
 */
const currentInvoiceId = computed(() => {
  // Em modo de criação, retorna null
  if (!isEditMode.value) return null;

  // Obtém ID da rota ou do store
  const id = typeof route.params.id === 'string' ? route.params.id :
    Array.isArray(route.params.id) ? route.params.id[0] : null;
  return id || invoiceStore.currentInvoiceId;
});

/**
 * Salva a fatura (dados básicos e/ou itens)
 * @param param - Pode ser os dados da fatura ou seus itens
 */
// Modifique o saveInvoice
// Modifique o saveInvoice para lidar com ambos os casos de forma mais inteligente
const saveInvoice = async (param: InvoiceInsertType | InvoiceItemInsertType[]): Promise<void> => {
  try {
    loading.value = true;
    errorMsg.value = "";

    // Caso 1: Recebeu os itens primeiro
    if (Array.isArray(param)) {
      const items = param;

      // Calcula o total baseado nos itens
      const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
      invoiceData.totalAmount = totalAmount;

      // Se já estiver em modo de edição, atualiza a invoice com os itens
      if (isEditMode.value) {
        await invoiceService.updateInvoice(currentInvoiceId.value!, { ...invoiceData, totalAmount });
        await saveInvoiceItems(currentInvoiceId.value!, items);
        handleSaveSuccess({ data: { id: currentInvoiceId.value! } });
      }
      // Se for criação, primeiro cria a invoice básica e depois os itens
      else {
        const invoiceResponse = await invoiceService.createInvoice({ ...invoiceData, totalAmount });
        const targetInvoiceId = invoiceResponse.data?.id;

        if (!targetInvoiceId) throw new Error('Invoice ID not available');

        await saveInvoiceItems(targetInvoiceId, items);
        handleSaveSuccess(invoiceResponse);
      }
    }
    // Caso 2: Recebeu apenas os dados básicos (sem itens)
    else {
      const response = isEditMode.value
        ? await invoiceService.updateInvoice(currentInvoiceId.value!, { ...param, totalAmount: invoiceData.totalAmount })
        : await invoiceService.createInvoice({ ...param, totalAmount: invoiceData.totalAmount });

      handleSaveSuccess(response);
    }
  } catch (error) {
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};

/**
 * Salva os itens da fatura
 * @param invoiceId - ID da fatura
 * @param items - Itens a serem salvos
 */
const saveInvoiceItems = async (invoiceId: string, items: InvoiceItemInsertType[]) => {
  try {
    loading.value = true;

    if (!items || items.length === 0) {
      console.warn('No items to save');
      return;
    }

    // Em modo edição, primeiro limpamos os itens existentes
    if (isEditMode.value) {
      const existingItems = await invoiceItemService.getInvoiceItemByInvoice(invoiceId);
      await Promise.all(
        existingItems.content.map(item =>
          invoiceItemService.deleteInvoiceItem(item.id)
        )
      );
    }

    // Prepara os itens com o invoiceId correto
    const itemsToSave = items.map(item => ({
      ...item,
      invoice: invoiceId,
      id: undefined // Força criação de novo registro
    }));

    // Persiste todos os itens
    const results = await Promise.all(
      itemsToSave.map(item =>
        invoiceItemService.createInvoiceItem(item)
      )
    );

    console.log('Items saved successfully:', results);
    return results;
  } catch (error) {
    console.error("Error saving invoice items:", error);
    throw error;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" xl="9">
        <InvoiceForm v-model="invoiceData" :is-edit-mode="isEditMode" :loading="loading" :initial-items="invoiceItems"
          @save="saveInvoice" @items-ready="(items: InvoiceItemInsertType[]) => saveInvoice(items)" />
      </v-col>
    </v-row>
  </v-container>
</template>
