<script lang="ts" setup>
import InvoiceSVG from "@/assets/images/invoice.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ProductCard from "@/components/invoice/view/ProductCard.vue";
import { ref, computed, onMounted, watch, reactive } from "vue";
import { InvoiceInsertType, InvoiceItemInsertType } from "@/components/invoice/types";
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useEmployeeStore } from "@/store/employee/employeeStore";
import { useCurrencyStore } from "@/store/baseTables/currencyStore";
import { useDependentEmployeeStore } from "@/store/employee/dependentStore";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { useRouter } from "vue-router";
import { useInvoiceStore } from "@/store/invoice/invoiceStore";
import { invoiceService } from "@/app/http/httpServiceProvider";

// Composables
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const invoiceStore = useInvoiceStore();

// Props
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

// Emits
const emit = defineEmits<{
  (e: 'save', invoiceData: InvoiceInsertType): void;
  (e: 'update:modelValue', value: InvoiceInsertType): void;
  (e: 'items-ready', items: InvoiceItemInsertType[]): void;
}>();

// Stores
const serviceProviderStore = useServiceProviderStore();
const institutionStore = useInstitutionStore();
const employeeStore = useEmployeeStore();
const currencyStore = useCurrencyStore();
const dependentStore = useDependentEmployeeStore();

// Refs
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const productCardRef = ref<{ emitItemsReady: () => boolean }>();
const errorMsg = ref("");
const alertTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Computed
const invoiceData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const invoiceItemData = reactive<InvoiceItemInsertType>({
  unitPrice: 0,
  quantity: 0,
  taxRate: '',
  description: '',
  companyAllowedHospitalProcedure: '',
  invoice: invoiceStore.currentInvoiceId,
  totalAmount: 0
});

const institutions = computed(() => {
  return institutionStore.institutions.map((item) => ({
    value: item.id,
    label: item.name,
  }));
});

const service_providers = computed(() => {
  return serviceProviderStore.service_provider_list.map((service_provider) => ({
    value: service_provider.id,
    label: service_provider.name
  }));
});

const employees = computed(() => {
  return employeeStore.employeesForDropdown.map((item) => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }));
});

const currencies = computed(() => {
  return currencyStore.currenciesForDropdown.map((item) => ({
    value: item.id,
    label: item.name,
  }));
});

const dependents = computed(() => {
  return dependentStore.dependentsForDropdown.map((item) => ({
    value: item.id,
    label: `${item.firstName} ${item.lastName}`,
  }));
});

// Validation rules
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

// Methods
const handleLoadError = (resource: string, error: any) => {
  console.error(`Failed to load ${resource}:`, error);
  errorMsg.value = t(`t-failed-to-load-${resource}`);

  if (alertTimeout.value) clearTimeout(alertTimeout.value);
  alertTimeout.value = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout.value = null;
  }, 5000);
};

const submitInvoice = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t('t-validation-error'));
    return;
  }

  try {
    // Se houver itens, emite apenas eles (que já vão disparar o salvamento completo)
    if (productCardRef.value) {
      const itemsValid = productCardRef.value.emitItemsReady();
      if (!itemsValid) return;
    }
    // Se não houver itens, emite os dados básicos
    else {
      emit('save', { ...invoiceData.value });
    }
  } catch (error) {
    console.error("Error submitting invoice:", error);
    toast.error(t('t-message-save-error'));
  }
};

const handleItemsReady = (items: InvoiceItemInsertType[]) => {
  // SEMPRE atualiza o total, mesmo em modo edição
  const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  invoiceData.value.totalAmount = totalAmount;

  // Emite os itens com o total atualizado
  emit('items-ready', items);
};

const onBack = () => {
  institutionStore.clearDraft();
  router.push('/invoices/list');
};

// Watchers
// Adicione este watcher para debug
watch(() => invoiceData.value, (newValue) => {
  // console.log('Invoice data structure:', {
  //   coveragePeriod: newValue.coveragePeriod,
  //   companyHealthPlanId: newValue.coveragePeriod?.companyHealthPlanId,
  //   fullData: newValue
  // });
}, { deep: true, immediate: true });

watch(() => invoiceData.value.company, async (newInstitutionId) => {
  if (newInstitutionId) {
    try {
      await employeeStore.fetchEmployeesForDropdown(newInstitutionId);

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
      toast.error(response.error?.message || t("t-message-download-error"));
      return;
    }

    //toast.success(t("t-toast-message-downloaded"));
    callbacks?.onSuccess?.();
  } catch (error) {
    toast.error(t("t-message-download-error"));
  } finally {
    callbacks?.onFinally?.();
  }
};
// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      institutionStore.fetchInstitutions(),
      currencyStore.fetchCurrenciesForDropdown(),
      serviceProviderStore.fetchServiceProvidersForDropdown()
    ]);
  } catch (error) {
    handleLoadError("institutions", error);
  }
});
</script>

<template>
  <v-form ref="form">
    <v-card elevation="0" class="position-relative h-100 d-block">

      <v-card-text>
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

          </v-col>
          <v-col cols="12" lg="4" class="text-center">
            <h2 class="font-weight-bold mb-0"></h2>
          </v-col>
          <v-col cols="12" lg="4" justify="end">
            <div class="font-weight-bold">{{ $t('t-institution') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.company" :items="institutions" :loading="institutionStore.loading"
              :rules="requiredRules.institution" :placeholder="$t('t-institution')" disabled />

            <div class="font-weight-bold mt-n1">{{ $t('t-service-provider') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.serviceProvider" :items="service_providers" :loading="serviceProviderStore.loading"
              :rules="requiredRules.service_provider" :placeholder="$t('t-service-provider')" disabled />

            <div class="font-weight-bold">{{ $t('t-employee-or-dependent') }}</div>
            <v-checkbox v-model="invoiceData.isEmployeeInvoice" density="compact" color="primary" disabled>
              <template #label>
                <span>{{ $t('t-is-employee-invoice') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold">{{ $t('t-invoice-number') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <TextField v-model="invoiceData.invoiceNumber" :placeholder="$t('t-enter-invoice-number')"
              :rules="requiredRules.invoiceNumber" disabled />
          </v-col>

          <v-col cols="12" lg="">
            <div class="font-weight-bold">{{ $t('t-employee') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.employee" :items="employees" :loading="employeeStore.loading"
              :rules="requiredRules.employee" :placeholder="$t('t-select-employee')" disabled />
          </v-col>

          <v-col cols="12" lg="4" v-if="!invoiceData.isEmployeeInvoice">
            <div class="font-weight-bold">{{ $t('t-dependent') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.dependent" :items="dependents" :loading="dependentStore.loading"
              :rules="requiredRules.dependent" :placeholder="$t('t-select-dependent')" disabled />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold">{{ $t('t-issue-date') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <ValidatedDatePicker v-model="invoiceData.issueDate" :teleport="true" :enable-time-picker="false"
              :rules="requiredRules.issueDate" :placeholder="$t('t-select-issue-date')" disabled />
          </v-col>

          <v-col cols="12" lg="4">
            <div class="font-weight-bold">{{ $t('t-currency') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.currency" :items="currencies" :rules="requiredRules.currency"
              :placeholder="$t('t-select-currency')" disabled />
          </v-col>

          <v-col cols="12" lg="4">
            <div class="font-weight-bold">{{ $t('t-due-date') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <ValidatedDatePicker v-model="invoiceData.dueDate" :teleport="true" :enable-time-picker="false"
              :rules="requiredRules.dueDate" :placeholder="$t('t-select-due-date')" disabled />
          </v-col>
        </v-row>

        <v-row class="mt-n6 mb-2">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold">{{ $t('t-invoice-reference') }}</div>
            <TextField v-model="invoiceData.invoiceReferenceNumber" :placeholder="$t('t-enter-invoice-reference')"
              disabled />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold">{{ $t('t-authorized-by') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <TextField v-model="invoiceData.authorizedBy" :placeholder="$t('t-enter-authorized-by')"
              :rules="requiredRules.authorizedBy" disabled />
          </v-col>
        </v-row>

        <div class="mb-12">
          <ProductCard ref="productCardRef" v-model="invoiceItemData"
            :healthplan-id="invoiceData.coveragePeriod?.companyHealthPlanId || ''"
            :institution-id="invoiceData.company || ''" :initial-items="initialItems" :is-edit-mode="isEditMode"
            @items-ready="handleItemsReady" />
        </div>

      </v-card-text>

      <v-card-actions class="d-flex justify-space-between mt-5">
        <v-btn color="secondary" variant="outlined" class="me-4" @click="onBack">
          {{ $t('t-back-to-list') }} <i class="ph-arrow-left ms-2" />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>