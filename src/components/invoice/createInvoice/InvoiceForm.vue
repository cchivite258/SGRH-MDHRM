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

// Stores
import { useClinicStore } from "@/store/clinic/clinicStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useEmployeeStore } from "@/store/employee/employeeStore";
import { useCurrencyStore } from "@/store/baseTables/currencyStore";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useDependentEmployeeStore } from "@/store/employee/dependentStore";
import { useInvoiceStore } from "@/store/invoice/invoiceStore";

// Types
import { InvoiceInsertType, InvoiceItemInsertType } from "@/components/invoice/types";

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
}>();

// =============================================
// STORES
// =============================================
const clinicStore = useClinicStore();
const institutionStore = useInstitutionStore();
const employeeStore = useEmployeeStore();
const currencyStore = useCurrencyStore();
const healthPlanStore = useHealthPlanStore();
const dependentStore = useDependentEmployeeStore();

// =============================================
// REACTIVE STATE
// =============================================
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const productCardRef = ref<{ emitItemsReady: () => boolean }>();
const errorMsg = ref("");
const alertTimeout = ref<number | null>(null);

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

const clinics = computed(() =>
  clinicStore.enabledClinics.map(clinic => ({
    value: clinic.id,
    label: clinic.name
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
  clinic: [(v: string) => !!v || t('t-clinic-required')],
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

/**
 * Submete o formulário da fatura
 */
const submitInvoice = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t('t-validation-error'));
    return;
  }

  try {
    if (productCardRef.value) {
      const itemsValid = productCardRef.value.emitItemsReady();
      if (!itemsValid) return;
    } else {
      emit('save', { ...invoiceData.value });
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
  if (!newInstitutionId) {
    employeeStore.clearEmployeesForDropdown();
    invoiceData.value.employee = undefined;
    return;
  }

  try {
    await employeeStore.fetchEmployeesForDropdown(newInstitutionId);

    if (invoiceData.value.employee) {
      const employeeExists = employeeStore.employeesForDropdown.some(
        e => e.id === invoiceData.value.employee
      );
      if (!employeeExists) {
        invoiceData.value.employee = undefined;
      }
    }
  } catch (error) {
    handleLoadError("employees", error);
  }
});

watch(() => invoiceData.value.employee, async (newEmployeeId) => {
  if (!newEmployeeId) {
    dependentStore.clearDependentForDropdown();
    invoiceData.value.dependent = undefined;
    return;
  }

  try {
    await dependentStore.fetchDependentsEmployeeForDropdown(newEmployeeId);

    if (invoiceData.value.dependent) {
      const dependentExists = dependentStore.dependentsForDropdown.some(
        d => d.id === invoiceData.value.dependent
      );
      if (!dependentExists) {
        invoiceData.value.dependent = undefined;
      }
    }
  } catch (error) {
    handleLoadError("dependents", error);
  }
});

// =============================================
// LIFECYCLE HOOKS
// =============================================
onMounted(async () => {
  try {
    await Promise.all([
      institutionStore.fetchInstitutionsforListing(0,100000000),
      currencyStore.fetchCurrenciesForDropdown(0,1000000000),
      clinicStore.fetchClinicsForDropdown(0,1000000000)
    ]);
  } catch (error) {
    handleLoadError("institutions", error);
  }
});
</script>

<template>
  <v-form ref="form">
    <v-card elevation="0" class="position-relative h-100 d-block">
      <div class="invoice-detail-card-image">
        <InvoiceSVG />
      </div>

      <v-card-text>
        <!-- Seção de Informações Básicas -->
        <v-row justify="end" class="mt-4 pt-16 pt-md-0">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold">{{ $t('t-institution') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.company" :items="institutions" :loading="institutionStore.loading"
              :rules="requiredRules.institution" :placeholder="$t('t-institution')" />

            <div class="font-weight-bold mt-n1">{{ $t('t-clinic') }} <i class="ph-asterisk ph-xs text-danger" /></div>
            <MenuSelect v-model="invoiceData.clinic" :items="clinics" :loading="clinicStore.loading"
              :rules="requiredRules.clinic" :placeholder="$t('t-clinic')" :disabled="!clinics.length" />

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
            <ValidatedDatePicker v-model="invoiceData.issueDate" :teleport="true" :enable-time-picker="false"
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
            <ValidatedDatePicker v-model="invoiceData.dueDate" :teleport="true" :enable-time-picker="false"
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
            :initial-items="initialItems" :is-edit-mode="isEditMode" @items-ready="handleItemsReady" />
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
</template>