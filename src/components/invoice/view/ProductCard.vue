<script lang="ts" setup>
// =============================================
// IMPORTS
// =============================================
// Vue e Vue Utilities
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import Table from "@/app/common/components/Table.vue";

// Stores
import { useTaxRateStore } from "@/store/baseTables/taxRateServiceStore";
import { useHospitalProcedureStore } from "@/store/institution/hospitalProcedureStore";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";

// Types e Utils
import { InvoiceItemInsertType } from "@/components/invoice/types";
import { productHeaderView } from "@/components/invoice/createInvoice/utils";

// =============================================
// INTERFACES E TIPOS
// =============================================
interface InvoiceItem extends Omit<InvoiceItemInsertType, 'taxRate'> {
  id: string;
  taxRate: string;
  originalId?: string;
}

interface FlagConfig {
  color: string;
  icon: string;
  text: string;
}

// =============================================
// COMPOSABLES
// =============================================
const { t } = useI18n();
const toast = useToast();

// =============================================
// PROPS & EMITS
// =============================================
const props = defineProps({
  modelValue: { 
    type: Object as () => InvoiceItemInsertType, 
    required: true 
  },
  loading: { 
    type: Boolean, 
    default: false 
  },
  healthplanId: { 
    type: String,
    default: '' 
  },
  institutionId: { 
    type: String, 
    required: true 
  },
  initialItems: { 
    type: Array as () => InvoiceItemInsertType[], 
    default: () => [] 
  },
  isEditMode: { 
    type: Boolean, 
    default: false 
  }
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: InvoiceItemInsertType): void;
  (e: 'items-ready', items: InvoiceItemInsertType[]): void;
}>();

// =============================================
// STORES
// =============================================
const taxRateStore = useTaxRateStore();
const hospitalProcedureStore = useHospitalProcedureStore();
const healthPlanStore = useHealthPlanStore();

// =============================================
// REACTIVE STATE
// =============================================
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const errorMsg = ref("");
const invoiceItems = ref<InvoiceItem[]>([]);
const activeHealthPlanId = ref("");

// =============================================
// COMPUTED PROPERTIES
// =============================================


const companyAllowedHospitalProcedures = computed(() => 
  hospitalProcedureStore.hospital_procedure_of_plan.map(item => ({
    value: item.id,
    label: item.hospitalProcedureType.name
  }))
);

const taxRates = computed(() => 
  taxRateStore.tax_rates_for_dropdown.map(item => ({
    value: item.id,
    label: `${item.rate}%`,
    rate: item.rate ? item.rate / 100 : 0
  }))
);

const lineTotals = computed(() => 
  invoiceItems.value.map(calculateLineTotal)
);

const invoiceTotals = computed(() => {
  const totals = lineTotals.value.reduce((acc, curr) => ({
    subTotal: acc.subTotal + curr.subtotal,
    taxAmount: acc.taxAmount + curr.taxAmount,
    total: acc.total + curr.total
  }), { subTotal: 0, taxAmount: 0, total: 0 });

  return {
    subTotal: totals.subTotal.toFixed(2),
    taxAmount: totals.taxAmount.toFixed(2),
    finalTotal: totals.total.toFixed(2)
  };
});

// =============================================
// VALIDATION RULES
// =============================================
const requiredRules = {
  unitPrice: [(v: number) => v > 0 || t('t-unit-price-required')],
  quantity: [(v: number) => v > 0 || t('t-quantity-required')],
  taxRate: [(v: string) => !!v || t('t-tax-rate-required')],
  companyAllowedHospitalProcedure: [(v: string) => !!v || t('t-procedure-required')]
};

// =============================================
// FLAG CONFIGURATION
// =============================================
const flagConfig: Record<string, FlagConfig> = {
  EXCEEDS_LIMIT: { 
    color: 'warning', 
    icon: 'ph-warning', 
    text: t('t-exceeds-limit') 
  },
  INSUFFICIENT_FUNDS: { 
    color: 'error', 
    icon: 'ph-money', 
    text: t('t-insufficient-funds') 
  },
  default: { 
    color: 'info', 
    icon: '', 
    text: '' 
  }
};

const getFlagConfig = (flag?: string): FlagConfig | null => 
  flag && flag !== 'UNFLAGGED' 
    ? flagConfig[flag as keyof typeof flagConfig] || flagConfig.default 
    : null;

// =============================================
// CORE METHODS
// =============================================
const calculateLineTotal = (item: InvoiceItem) => {
  const taxRate = taxRates.value.find(t => t.value === item.taxRate);
  const rate = taxRate?.rate || 0;
  const subtotal = item.unitPrice * item.quantity;
  const taxAmount = subtotal * rate;
  
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount
  };
};

const loadProcedures = async () => {
  try {
    hospitalProcedureStore.hospital_procedure_of_plan = [];
    activeHealthPlanId.value = "";

    // console.log('Loading procedures with:', {
    //   healthplanId: props.healthplanId,
    //   institutionId: props.institutionId
    // });

    if (!props.healthplanId || !props.institutionId) {
      console.warn('Missing required IDs:', {
        hasHealthplanId: !!props.healthplanId,
        hasInstitutionId: !!props.institutionId
      });
      return;
    }

    activeHealthPlanId.value = props.healthplanId;
    console.log("Active Health Plan ID:", activeHealthPlanId.value);

    await Promise.all([
      taxRateStore.fetchTaxRatesForDropdown(),
      hospitalProcedureStore.fetchHospitalProceduresOfPlan(activeHealthPlanId.value)
    ]);
    
    console.log('Procedures loaded successfully');
    
  } catch (error) {
    handleError('t-error-loading-procedures', error);
  }
};

const handleError = (messageKey: string, error: unknown) => {
  console.error(messageKey, error);
  errorMsg.value = t(messageKey);
  setTimeout(() => errorMsg.value = "", 5000);
};

// =============================================
// ITEM MANAGEMENT
// =============================================
const addItem = () => {
  invoiceItems.value.push({
    id: Date.now().toString(),
    companyAllowedHospitalProcedure: "",
    description: "",
    taxRate: "",
    quantity: 1,
    unitPrice: 0,
    invoice: props.modelValue.invoice,
    totalAmount: 0
  });
};

const removeItem = (id: string) => {
  const index = invoiceItems.value.findIndex(item => item.id === id);
  if (index !== -1) {
    invoiceItems.value.splice(index, 1);
  }
};

const prepareItemsForSubmission = (): InvoiceItemInsertType[] => {
  return invoiceItems.value.map(item => ({
    ...item,
    id: props.isEditMode ? item.originalId : undefined,
    taxRate: item.taxRate || '',
    companyAllowedHospitalProcedure: item.companyAllowedHospitalProcedure || '',
    description: item.description || '',
    unitPrice: item.unitPrice || 0,
    quantity: item.quantity || 0,
    invoice: item.invoice || '',
    totalAmount: calculateLineTotal(item).total
  }));
};

// =============================================
// ITEM VALIDATION & SUBMISSION
// =============================================
const validateItems = (items: InvoiceItemInsertType[]): boolean => {
  return !items.some(item =>
    !item.companyAllowedHospitalProcedure ||
    item.quantity <= 0 ||
    item.unitPrice <= 0
  );
};

const emitItemsReady = (): boolean => {
  const items = prepareItemsForSubmission();

  if (!validateItems(items)) {
    toast.error(t('t-fill-all-item-fields'));
    return false;
  }

  emit('items-ready', items);
  return true;
};

// =============================================
// EXPOSED METHODS
// =============================================
defineExpose({ emitItemsReady });

// =============================================
// WATCHERS
// =============================================
watch(() => props.institutionId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadProcedures();
  }
}, { immediate: true });

watch(() => props.initialItems, (newItems) => {
  if (newItems?.length) {
    invoiceItems.value = newItems.map(item => ({
      ...item,
      originalId: item.id,
      id: item.id || Date.now().toString(),
      taxRate: item.taxRate || '',
      companyAllowedHospitalProcedure: item.companyAllowedHospitalProcedure || ''
    }));
  }
}, { immediate: true });

watch(invoiceItems, (newItems) => {
  newItems.forEach(item => {
    item.totalAmount = calculateLineTotal(item).total;
  });
}, { deep: true });


watch([() => props.healthplanId, () => props.institutionId], ([newHealthplanId, newInstitutionId]) => {
  if (newHealthplanId && newInstitutionId) {
   // console.log('Both IDs available, loading procedures...');
    loadProcedures();
  }
}, { immediate: true });

// =============================================
// LIFECYCLE HOOKS
// =============================================
onMounted(() => {
  loadProcedures();

  if (props.initialItems?.length) {
    invoiceItems.value = props.initialItems.map(item => ({
      ...item,
      id: item.id || Date.now().toString(),
    }));
  } else {
    addItem();
  }
});
</script>

<template>
  <v-form ref="form">
    <!-- Tabela de Itens -->
    <Table 
      :headerItems="productHeaderView.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" 
      class="fixed-columns"
    >
      <template #body>
        <tr 
          v-for="(item, index) in invoiceItems" 
          :key="`product-item-${item.id}`"
          :class="[`flag-border-${item.flag}`, { 'has-flag': item.flag && item.flag !== 'UNFLAGGED' }]"
        >
          <!-- Número do Item -->
          <td class="font-weight-bold text-center" style="width: 3%">
            <v-tooltip 
              v-if="getFlagConfig(item.flag)" 
              :text="getFlagConfig(item.flag)?.text" 
              location="top"
            >
              <template v-slot:activator="{ props: tooltipProps }">
                <v-icon 
                  v-bind="tooltipProps" 
                  :color="getFlagConfig(item.flag)?.color" 
                  size="small"
                >
                  {{ getFlagConfig(item.flag)?.icon }}
                </v-icon>
              </template>
            </v-tooltip>
            {{ index + 1 }}
          </td>

          <!-- Procedimento -->
          <td style="width: 30%" class="pt-4">
            <MenuSelect 
              v-model="item.companyAllowedHospitalProcedure" 
              :items="companyAllowedHospitalProcedures"
              :rules="requiredRules.companyAllowedHospitalProcedure" 
              :placeholder="$t('t-select-procedure')"
              item-value="value" 
              class="w-100" 
              disabled
            />
          </td>

          <!-- Preço Unitário -->
          <td style="width: 10%" class="pt-4 px-1">
            <TextField 
              v-model.number="item.unitPrice" 
              :rules="requiredRules.unitPrice"
              :placeholder="$t('t-unit-price')" 
              type="number" 
              min="0" 
              step="0.01" 
              class="compact-input" 
              disabled
            />
          </td>

          <!-- Quantidade -->
          <td style="width: 5%" class="pt-4 px-1">
            <TextField 
              v-model.number="item.quantity" 
              :placeholder="$t('t-quantity')" 
              type="number" 
              min="0"
              :rules="requiredRules.quantity" 
              class="compact-input" 
              disabled
            />
          </td>

          <!-- Taxa -->
          <td style="width: 12%" class="pt-4 px-1">
            <MenuSelect 
              v-model="item.taxRate" 
              :items="taxRates" 
              :rules="requiredRules.taxRate"
              :placeholder="$t('t-select-tax-rate')" 
              item-value="value" 
              class="w-100" 
              disabled
            />
          </td>

          <!-- Total -->
          <td style="width: 20%" class="pt-4">
            <TextField 
              disabled 
              :model-value="calculateLineTotal(item).total.toFixed(2)" 
              class="total-input" 
            />
          </td>

          <!-- Descrição -->
          <td style="width: 25%" class="pt-4">
            <TextArea 
              v-model="item.description" 
              :placeholder="$t('t-description')" 
              class="description-field" 
              rows="1"
              auto-grow 
              disabled
            />
          </td>

          
        </tr>
      </template>
    </Table>

   

    <v-divider class="my-4" />

    <!-- Resumo dos Totais -->
    <v-row justify="end" class="mt-4">
      <v-col cols="12" lg="4">
        <v-row class="d-flex align-center mb-2" no-gutters>
          <v-col cols="6">
            <span class="font-weight-bold me-4">{{ $t('t-incidence-base') }}:</span>
          </v-col>
          <v-col cols="6">
            <TextField :model-value="invoiceTotals.subTotal" disabled />
          </v-col>
        </v-row>

        <v-row class="d-flex align-center mb-2" no-gutters>
          <v-col cols="6">
            <span class="font-weight-bold me-4">{{ $t('t-rate') }}:</span>
          </v-col>
          <v-col cols="6">
            <TextField :model-value="invoiceTotals.taxAmount" disabled />
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-row class="d-flex align-center mb-2" no-gutters>
          <v-col cols="6">
            <span class="font-weight-bold me-4">{{ $t('t-total-amount') }}:</span>
          </v-col>
          <v-col cols="6">
            <TextField :model-value="invoiceTotals.finalTotal" disabled />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
.fixed-columns {
  table-layout: fixed;
  width: 100%;

  td {
    vertical-align: middle;
    overflow: hidden;

    &:nth-child(1),
    &:nth-child(4),
    &:nth-child(8) {
      padding: 0 4px;
    }

    &:nth-child(3),
    &:nth-child(4),
    &:nth-child(6) {
      text-align: right;
    }
  }
}

.compact-input {
  max-width: 100px;
}

.total-input {
  width: 100%;
  min-width: 120px;
}

.description-field {
  width: 100%;
  min-height: 40px;
}

.w-100 {
  width: 100%;
}

.has-flag {
  position: relative;
  background-color: rgba(0, 0, 0, 0.02);
}

.flag-border-EXCEEDS_LIMIT {
  border-left: 4px solid orange;
}

.flag-border-INSUFFICIENT_FUNDS {
  border-left: 4px solid red;
}
</style>