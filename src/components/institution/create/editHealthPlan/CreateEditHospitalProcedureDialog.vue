<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted } from "vue";
import { HealthPlanListingType, HospitalProcedureInsertType, HospitalProcedureListingType } from "@/components/institution/types";
import { HospitalProcedureTypeListing } from "@/components/baseTables/hospitalProcedureType/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { useHospitalProcedureTypeStore } from '@/store/baseTables/hospitalProcedureTypeStore';
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

// Store para tipos de procedimentos hospitalares
const hospitalProcedureTypeStore = useHospitalProcedureTypeStore();
const healthPlanStore = useHealthPlanStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<HospitalProcedureInsertType | HospitalProcedureListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      fixedAmount: 0,
      percentage: 0,
      limitTypeDefinition: "",
      hospitalProcedureType: "",
      companyHealthPlan: "",
      enabled: true
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");

// Form fields
const id = ref("");
const fixedAmount = ref(0);
const percentage = ref(0);
const limitTypeDefinition = ref("");
const hospitalProcedureType = ref("");
const companyHealthPlan = ref(""); 
const enabled = ref(true);

//Options Enums
import {
  limitTypeDefinitionOptions
} from "@/components/institution/create/utils";

// Watch for data changes
watch(() => props.data, (newData) => {
  if (newData) {
    id.value = newData.id || "";
    fixedAmount.value = newData.fixedAmount || 0;
    percentage.value = newData.percentage || 0;
    limitTypeDefinition.value = newData.limitTypeDefinition || "";
    
    if (typeof newData.hospitalProcedureType === 'object' && newData.hospitalProcedureType !== null) {
      hospitalProcedureType.value = newData.hospitalProcedureType.id; 
    } else {
      hospitalProcedureType.value = newData.hospitalProcedureType || ""; 
    }
    
    // Garanta que companyHealthPlan nunca seja perdido
    companyHealthPlan.value = newData.companyHealthPlan || (props.data?.companyHealthPlan || "");
    enabled.value = newData.enabled || true;

  }
}, { immediate: true });

watch(limitTypeDefinition, (newVal) => {
  if (newVal === 'FIXED_AMOUNT') {
    percentage.value = 0;
  } else if (newVal === 'PERCENTAGE') {
    fixedAmount.value = 0;
  }
});

const isCreate = computed(() => !id.value);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  hospitalProcedureType: [
    (v: string) => !!v || t('t-please-enter-hospital-procedure-type'),
  ],
  limitTypeDefinition: [
    (v: string) => !!v || t('t-please-enter-limit-type-definition'),
  ],
  companyHealthPlan: [
    (v: string) => !!v || t('t-please-enter-health-plan'),
  ],
  // ... outras regras
  fixedAmount: [
    (v: number) => {
      if (limitTypeDefinition.value === 'FIXED_AMOUNT') {
        if (v === undefined || v === null) return t('t-please-enter-fixed-amount');
        if (v <= 0) return t('t-min-zero-amount');
      }
      return true;
    }
  ],
  percentage: [
    (v: number) => {
      if (limitTypeDefinition.value === 'PERCENTAGE') {
        if (v === undefined || v === null) return t('t-please-enter-percentage');
        if (v <= 0) return t('t-min-zero-percentage');
        if (v > 100) return t('t-max-100-percentage');
      }
      return true;
    }
  ],

};

const hospitalProceduresTypes = computed(() => {
  return (hospitalProcedureTypeStore.hospital_procedure_types_dropdown || []).map((item: HospitalProcedureTypeListing) => ({
    value: item.id,
    label: item.name,
  }));
});

const heathPlanOptions = computed(() => {
  return (healthPlanStore.health_plans_for_dropdown || []).map((item: HealthPlanListingType) => ({
    value: item.id,
    label: item.healthPlanLimit + " - " + item.fixedAmount + item.salaryComponent,
  }));
});


const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const toast = useToast();

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();

  if (!valid) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  localLoading.value = true;

  const payload: HospitalProcedureInsertType = {
    id: id.value || undefined,
    fixedAmount: fixedAmount.value,
    percentage: percentage.value,
    limitTypeDefinition: limitTypeDefinition.value,
    hospitalProcedureType: hospitalProcedureType.value,
    companyHealthPlan: companyHealthPlan.value,
    company: props.data?.company || "",
    enabled: enabled.value 
  };

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: { error?: ApiErrorResponse }) => {
      // Mostra mensagem específica para erro 409
      errorMsg.value = error.error?.message || t('t-message-save-error');

      alertTimeout = setTimeout(() => {
        errorMsg.value = "";
        alertTimeout = null;
      }, 5000);
    },
    onFinally: () => localLoading.value = false
  });
};

/* Watch for changes in the companyHealthPlan prop to fetch coverage periods
*/

watch(() => props.data?.companyHealthPlan, (newCompanyHealthPlan) => {
  if (newCompanyHealthPlan) {
    companyHealthPlan.value = newCompanyHealthPlan;
    hospitalProcedureTypeStore.fetchHospitalProcedureTypesForDropdown(0, 10000000);
    healthPlanStore.fetchHealthPlansForDropdown(newCompanyHealthPlan, 0, 10000000);
  }
}, { immediate: true });


onMounted(async () => {
  // Garante que companyHealthPlan.value está definido antes de carregar
  companyHealthPlan.value = props.data?.companyHealthPlan || "";
  
  try {
    if (companyHealthPlan.value) {
      await hospitalProcedureTypeStore.fetchHospitalProcedureTypesForDropdown(0,10000000);
      await healthPlanStore.fetchHealthPlansForDropdown(companyHealthPlan.value, 0, 10000000);
    }
  } catch (error) {
    console.error("Failed to load procedimentos hospitalares:", error);
    errorMsg.value = "Falha ao carregar procedimentos hospitalares";
    setTimeout(() => errorMsg.value = "", 5000);
  }
});

</script>
<template>
  <v-dialog v-model="dialogValue" width="500" >

    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-hospital-procedure') : $t('t-edit-hospital-procedure')" title-class="py-0"
        style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
        <v-card-text >
          <!--<v-row class="">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-health-plan') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="companyHealthPlan" :items="heathPlanOptions"
                :loading="healthPlanStore.loading" :rules="requiredRules.companyHealthPlan" :disabled="!isCreate"/>
            </v-col>
          </v-row>-->
          <v-row class="mt-n6">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-hospital-procedure-type') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="hospitalProcedureType" :items="hospitalProceduresTypes"
                :loading="hospitalProcedureTypeStore.loading" :rules="requiredRules.hospitalProcedureType" :disabled="!isCreate"/>
            </v-col>
          </v-row> 
          <v-row class="mt-n6">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-limit-type-definition') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="limitTypeDefinition" :items="limitTypeDefinitionOptions"
                :rules="requiredRules.limitTypeDefinition" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col :cols="12" :lg="limitTypeDefinition === 'FIXED_AMOUNT' ? 12 : 6" v-if="limitTypeDefinition === 'FIXED_AMOUNT'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-fixed-amount') }} <i v-if="limitTypeDefinition === 'FIXED_AMOUNT'"
                  class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="fixedAmount" type="number" :placeholder="$t('t-enter-fixed-amount')"
                :rules="requiredRules.fixedAmount" />
            </v-col>     
            <v-col :cols="12" :lg="limitTypeDefinition === 'PERCENTAGE' ? 12 : 6" v-if="limitTypeDefinition === 'PERCENTAGE'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-percentage') }} <i v-if="limitTypeDefinition === 'PERCENTAGE'"
                  class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="percentage" type="number" :placeholder="$t('t-enter-percentage')"
                :rules="requiredRules.percentage" />
            </v-col>
          </v-row>
          <v-row :class="limitTypeDefinition === 'FIXED_AMOUNT' || limitTypeDefinition === 'PERCENTAGE' ? 'mt-n6' : 'mt-6'">
          <v-col cols="12" lg="12" class="">
            <div class="font-weight-bold">{{ $t('t-enabled') }}</div>
            <v-checkbox v-model="enabled" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-is-enabled') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="dialogValue = false"> 
              <i class="ph-x me-1" /> {{ $t('t-close') }}
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading"
              :disabled="localLoading">
              {{ localLoading ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
