<script lang="ts" setup>
// =============================================
// IMPORTS
// =============================================
// Vue e Vue Utilities
import { ref, computed, onMounted, watch, reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';

// Components
import InvoiceSVG from "@/assets/images/invoice.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ProductCard from "@/components/invoice/createInvoice/ProductCard.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import CreateEditAttachmentDialog from "@/components/invoice/createInvoice/CreateEditAttachmentDialog.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";

// Stores
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useEmployeeStore } from "@/store/employee/employeeStore";
import { useCurrencyStore } from "@/store/baseTables/currencyStore";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useDependentEmployeeStore } from "@/store/employee/dependentStore";
import { useInvoiceStore } from "@/store/invoice/invoiceStore";

// Types
import { InvoiceInsertType, InvoiceItemInsertType, InvoiceAttachmentType } from "@/components/invoice/types";
import { invoiceService } from "@/app/http/httpServiceProvider";
import { file } from "@babel/types";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";

// =============================================
// COMPOSABLES & UTILITIES
// =============================================
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const invoiceStore = useInvoiceStore();

// =============================================
// COMPONENT PROPS & EMITS
// =============================================
const props = defineProps({
  modelValue: {
    type: Object as () => InvoiceInsertType,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  initialItems: {
    type: Array as () => InvoiceItemInsertType[],
    default: () => []
  }
});

const emit = defineEmits<{
  (e: 'save', invoiceData: InvoiceInsertType): void;
  (e: 'update:modelValue', value: InvoiceInsertType): void;
  (e: 'items-ready', items: InvoiceItemInsertType[]): void;
  (e: 'invoiceAttachmentUploaded', id: string): void;
}>();

// =============================================
// STORES
// =============================================
const serviceProviderStore = useServiceProviderStore();
const institutionStore = useInstitutionStore();
const employeeStore = useEmployeeStore();
const currencyStore = useCurrencyStore();
const healthPlanStore = useHealthPlanStore();
const dependentStore = useDependentEmployeeStore();

// =============================================
// REACTIVE STATE
// =============================================
const AttachmentDialog = ref(false);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const productCardRef = ref<{ emitItemsReady: () => Promise<boolean> }>();
const issueDatePickerRef = ref<{ validate: () => boolean } | null>(null);
const dueDatePickerRef = ref<{ validate: () => boolean } | null>(null);
const errorMsg = ref("");
const alertTimeout = ref<number | null>(null);
const attachmentData = ref<InvoiceAttachmentType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);

const invoiceItemData = reactive<InvoiceItemInsertType>({
  unitPrice: 0,
  quantity: 0,
  taxRate: '',
  description: '',
  companyAllowedHospitalProcedure: '',
  invoice: invoiceStore.currentInvoiceId,
  totalAmount: 0
});

// =============================================
// COMPUTED PROPERTIES
// =============================================
const invoiceData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const institutions = computed(() =>
  institutionStore.enabledInstitutions.map(item => ({
    value: item.id,
    label: item.name,
  }))
);

const service_providers = computed(() =>
  serviceProviderStore.enabledServiceProviders.map(service_provider => ({
    value: service_provider.id,
    label: service_provider.name
  }))
);

const employees = computed(() =>
  employeeStore.enabledEmployees.map(item => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }))
);

const currencies = computed(() =>
  currencyStore.enabledCurrencies.map(item => ({
    value: item.id,
    label: item.name,
  }))
);

const dependents = computed(() =>
  dependentStore.dependentsForDropdown.map(item => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }))
);

// =============================================
// VALIDATION RULES
// =============================================
const requiredRules = {
  institution: [(v: string) => !!v || t('t-institution-required')],
  service_provider: [(v: string) => !!v || t('t-service-provider-required')],
  employee: [(v: string) => !!v || t('t-employee-required')],
  issueDate: [(v: Date) => !!v || t('t-issue-date-required')],
  dueDate: [(v: Date) => !!v || t('t-due-date-required')],
  currency: [(v: string) => !!v || t('t-currency-required')],
  invoiceNumber: [(v: string) => !!v || t('t-invoice-number-required')],
  dependent: [(v: string) => invoiceData.value.isEmployeeInvoice ? true : !!v || t('t-dependent-required')],
  authorizedBy: [(v: string) => !!v || t('t-authorized-by-required')]
};

// =============================================
// METHODS
// =============================================
/**
 * Manipula erros de carregamento
 */
const handleLoadError = (resource: string, error: unknown) => {
  console.error(`Failed to load ${resource}:`, error);
  errorMsg.value = t(`t-failed-to-load-${resource}`);

  if (alertTimeout.value) {
    clearTimeout(alertTimeout.value);
  }

  alertTimeout.value = window.setTimeout(() => {
    errorMsg.value = "";
    alertTimeout.value = null;
  }, 5000);
};

interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}



const onDownloadClick = (id: string | undefined, name: string, extension: string) => {
  if (!id) return;
  onSubmitDownloadInvoice(id, name, extension);
};

const onSubmitDownloadInvoice = async (invoiceId: string, name: string, extension: string, callbacks?: {
  onSuccess?: () => void;
  onFinally?: () => void;
}) => {
  try {
    const response = await invoiceService.downloadAttachment(invoiceId, name, extension);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-download-error")).forEach((message) => toast.error(message));
      return;
    }

    //toast.success(t("t-toast-message-downloaded"));
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-download-error")).forEach((message) => toast.error(message));
  } finally {
    callbacks?.onFinally?.();
  }
};

const onUploadClick = (data: InvoiceAttachmentType | undefined) => {
  console.log("onUploadClick data: ", invoiceData.value);
  attachmentData.value = {
    ...(data || {}),
    id: invoiceData.value.id || undefined,
    file: data?.file || null
  };
  AttachmentDialog.value = true;
};

const onSubmitInvoiceAttachment = async (
  data: InvoiceAttachmentType,
  callbacks?: {
    onSuccess?: () => void,
    onFinally?: () => void
  }
) => {
  try {

    let response: ServiceResponse<InvoiceAttachmentType>;

    response = await invoiceService.uploadAttachment(data);

    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      getApiErrorMessages(response.error, t("t-message-save-error")).forEach((message) => toast.error(message));
      return;
    }

    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(data.id ? t('t-toast-message-update') : t('t-toast-message-created'));
    emit('invoiceAttachmentUploaded', invoiceData.value.id!);

    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    callbacks?.onFinally?.();
  }
};



watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const onDeleteAttachmentClick = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};


const onConfirmDelete = async () => {
  deleteLoading.value = true;

  try {
    const response = await invoiceService.deleteAttachment(deleteId.value!);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-delete-error")).forEach((message) => toast.error(message));
      return;
    }

    toast.success(t("t-toast-message-deleted"));
    emit('invoiceAttachmentUploaded', deleteId.value!);
  } catch (error) {
    getApiErrorMessages(error, t("t-message-delete-error")).forEach((message) => toast.error(message));
  }
  finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

/**
 * Submete o formulário da fatura
 */
const submitInvoice = async () => {
  if (!form.value) return;
  const isIssueDateValid = issueDatePickerRef.value?.validate() ?? true;
  const isDueDateValid = dueDatePickerRef.value?.validate() ?? true;

  const { valid } = await form.value.validate();
  if (!valid || !isIssueDateValid || !isDueDateValid) {
    toast.error(t('t-validation-error'));
    return;
  }

  try {
    const normalizedInvoice = { ...invoiceData.value };
    normalizeObjectStringFieldsInPlace(normalizedInvoice as Record<string, any>, {
      invoiceNumber: "trimToEmpty",
      authorizedBy: "trimToEmpty",
      invoiceReferenceNumber: "trimToNull"
    });

    if (productCardRef.value) {
      const itemsValid = await productCardRef.value.emitItemsReady();
      if (!itemsValid) return;
    } else {
      emit('save', normalizedInvoice);
    }
  } catch (error) {
    console.error("Error submitting invoice:", error);
    toast.error(t('t-message-save-error'));
  }
};


/**
 * Processa os itens prontos para envio
 */
const handleItemsReady = (items: InvoiceItemInsertType[]) => {
  const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  invoiceData.value.totalAmount = totalAmount;
  emit('items-ready', items);
};

/**
 * Navega de volta para a lista
 */
const onBack = () => {
  institutionStore.clearDraft();
  router.push('/invoices/list');
};

// =============================================
// WATCHERS
// =============================================
watch(() => invoiceData.value.company, async (newInstitutionId) => {
  if (newInstitutionId) {
    try {
      await employeeStore.fetchEmployeesForDropdown(newInstitutionId, 0, 1000000000);

      if (invoiceData.value.employee) {
        const currentEmployee = employeeStore.employeesForDropdown.find(
          c => c.id === invoiceData.value.employee
        );
        if (!currentEmployee) {
          invoiceData.value.employee = undefined;
        }
      }
    } catch (error) {
      handleLoadError("employees", error);
    }
  } else {
    employeeStore.clearEmployeesForDropdown();
    invoiceData.value.employee = undefined;
  }
});


watch(() => invoiceData.value.employee, async (newEmployeeId) => {
  if (newEmployeeId) {
    try {
      await dependentStore.fetchDependentsEmployeeForDropdown(newEmployeeId);

      if (invoiceData.value.dependent) {
        const currentDependent = dependentStore.dependentsForDropdown.find(
          c => c.id === invoiceData.value.dependent
        );
        if (!currentDependent) {
          invoiceData.value.dependent = undefined;
        }
      }
    } catch (error) {
      handleLoadError("dependents", error);
    }
  } else {
    dependentStore.clearDependentForDropdown();
    invoiceData.value.dependent = undefined;
  }
});

// =============================================
// LIFECYCLE HOOKS
// =============================================
onMounted(async () => {
  try {
    await Promise.all([
      institutionStore.fetchInstitutionsforListing(0, 100000000),
      currencyStore.fetchCurrenciesForDropdown(0, 1000000000),
      serviceProviderStore.fetchServiceProvidersForDropdown(0, 1000000000)
    ]);
  } catch (error) {
    handleLoadError("institutions", error);
  }
});
</script>

<template>
  <v-form ref="form" @submit.prevent="submitInvoice">
    <v-card elevation="0" class="position-relative h-100 d-block">


      <v-card-text>
        <!-- Seção de Informações Básicas -->
        <v-row class="mt-4 pt-16 pt-md-0">
          <v-col cols="12" lg="4" class="mt-6">
            <v-card class="bg-light" elevation="0" v-if="invoiceData.invoiceAttachment && invoiceData.id">
              <v-card-text class="py-3">
                <div class="d-flex justify-space-between">
                  <span class="font-weight-bold align-center d-flex">
                    <i class="ph ph-file me-2" /> {{ invoiceData.invoiceAttachment.originalFilename }}</span>
                  <span class="text-muted">{{ invoiceData.invoiceAttachment.fileSize }} KB</span>
                </div>
              </v-card-text>
            </v-card>

            <div class="mt-3" v-if="invoiceData.invoiceAttachment && invoiceData.id">
              <v-btn color="black" variant="elevated"
                @click="onDownloadClick(invoiceData.id, invoiceData.invoiceAttachment.originalFilename, invoiceData.invoiceAttachment.extension)"
                block>
                <span class="font-weight-bold align-center d-flex">
                  <i class="ph ph-download-simple me-2" /> {{ $t('t-download-original-invoice') }}
                </span>
              </v-btn>
            </div>

            <div class="mt-3" v-if="invoiceData.invoiceAttachment && invoiceData.id">
              <v-btn color="black" variant="elevated" @click="onDeleteAttachmentClick(invoiceData.id)" block>
                <span class="font-weight-bold align-center d-flex">
                  <i class="ph ph-trash me-2" /> {{ $t('t-delete-original-invoice') }}
                </span>
              </v-btn>
            </div>

            <div class="mt-3" v-if="invoiceData.id">
              <v-btn color="black" variant="elevated" @click="onUploadClick(undefined)" block>
                <span class="font-weight-bold align-center d-flex">
                  <i class="ph ph-upload-simple me-2" /> {{ $t('t-upload-original-invoice') }}
                </span>
              </v-btn>
            </div>

          </v-col>
          <v-col cols="12" lg="4" class="text-center">
            <h2 class="font-weight-bold mb-0"></h2>
          </v-col>
          <v-col cols="12" lg="4" justify="end">
            <div class="font-weight-bold">{{ $t('t-institution') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.company" :items="institutions" :loading="institutionStore.loading"
              :rules="requiredRules.institution" :placeholder="$t('t-institution')" />

            <div class="font-weight-bold mt-n1">{{ $t('t-service-provider') }} <i
                class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.serviceProvider" :items="service_providers"
              :loading="serviceProviderStore.loading" :rules="requiredRules.service_provider"
              :placeholder="$t('t-service-provider')" :disabled="!service_providers.length" />

            <div class="font-weight-bold">{{ $t('t-employee-or-dependent') }}</div>
            <v-checkbox v-model="invoiceData.isEmployeeInvoice" density="compact" color="primary">
              <template #label>
                <span>{{ $t('t-is-employee-invoice') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>


        <!-- Seção de Detalhes da Fatura -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold">
              {{ $t('t-invoice-number') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="invoiceData.invoiceNumber" :placeholder="$t('t-enter-invoice-number')"
              :rules="requiredRules.invoiceNumber" />
          </v-col>

          <v-col cols="12" lg="">
            <div class="font-weight-bold">
              {{ $t('t-employee') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="invoiceData.employee" :items="employees" :loading="employeeStore.loading"
              :rules="requiredRules.employee" :placeholder="$t('t-select-employee')"
              :disabled="!invoiceData.company || !employees.length" />
          </v-col>

          <v-col cols="12" lg="4" v-if="!invoiceData.isEmployeeInvoice">
            <div class="font-weight-bold">
              {{ $t('t-dependent') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="invoiceData.dependent" :items="dependents" :loading="dependentStore.loading"
              :rules="requiredRules.dependent" :placeholder="$t('t-select-dependent')"
              :disabled="!invoiceData.employee || !dependents.length" />
          </v-col>
        </v-row>

        <!-- Seção de Datas e Moeda -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold">
              {{ $t('t-issue-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker ref="issueDatePickerRef" v-model="invoiceData.issueDate" :teleport="true" :enable-time-picker="false"
              :rules="requiredRules.issueDate" :placeholder="$t('t-select-issue-date')" />
          </v-col>

          <v-col cols="12" lg="4">
            <div class="font-weight-bold">
              {{ $t('t-currency') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="invoiceData.currency" :items="currencies" :rules="requiredRules.currency"
              :placeholder="$t('t-select-currency')" />
          </v-col>

          <v-col cols="12" lg="4">
            <div class="font-weight-bold">
              {{ $t('t-due-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker ref="dueDatePickerRef" v-model="invoiceData.dueDate" :teleport="true" :enable-time-picker="false"
              :rules="requiredRules.dueDate" :placeholder="$t('t-select-due-date')" />
          </v-col>
        </v-row>

        <!-- Seção de Referência e Autorização -->
        <v-row class="mt-n6 mb-2">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold">{{ $t('t-invoice-reference') }}</div>
            <TextField v-model="invoiceData.invoiceReferenceNumber" :placeholder="$t('t-enter-invoice-reference')" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold">
              {{ $t('t-authorized-by') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="invoiceData.authorizedBy" :placeholder="$t('t-enter-authorized-by')"
              :rules="requiredRules.authorizedBy" />
          </v-col>
        </v-row>

        <!-- Componente de Itens da Fatura -->
        <div class="mb-12">
          <ProductCard ref="productCardRef" v-model="invoiceItemData" :institution-id="invoiceData.company || ''"
            :employee-id="invoiceData.employee || ''" :initial-items="initialItems" :is-edit-mode="isEditMode"
            @items-ready="handleItemsReady" />
        </div>
      </v-card-text>

      <!-- Ações do Formulário -->
      <v-card-actions class="d-flex justify-space-between mt-5">
        <v-btn color="secondary" variant="outlined" class="me-4" @click="onBack">
          {{ $t('t-back-to-list') }} <i class="ph-arrow-left ms-2" />
        </v-btn>

        <v-btn color="success" variant="elevated" @click="submitInvoice" :loading="loading">
          <i class="ph-printer me-1" /> {{ $t('t-save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>


  <CreateEditAttachmentDialog v-if="attachmentData" v-model="AttachmentDialog" :data="attachmentData"
    @onSubmit="onSubmitInvoiceAttachment" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>
