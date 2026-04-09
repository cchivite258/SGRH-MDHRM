<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted, nextTick } from "vue";
import { HealthPlanInsertType, HospitalProcedureListingType, CoveragePeriodListingType, HealthPlanListingType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { useCoveragePeriodStore } from '@/store/institution/coveragePeriodStore';
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiValidationErrors, getFirstApiErrorMessage } from "@/app/common/apiErrors";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

//Options Enums
import {
  healthPlanLimitOptions,
  salaryComponentOptions
} from "@/components/institution/create/utils";

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

// Store para periodos de cobertura
const coveragePeriodStore = useCoveragePeriodStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // No CreateEditHealthPlanDialog.vue
  data: {
    type: Object as PropType<HealthPlanInsertType | HealthPlanListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      maxNumberOfDependents: 0,
      childrenMaxAge: 0,
      childrenInUniversityMaxAge: 0,
      healthPlanLimit: "",
      fixedAmount: 0,
      salaryComponent: undefined,
      companyContributionPercentage: 0,
      coveragePeriod: "",
      company: ""
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});

// Form fields
const id = ref("");
const maxNumberOfDependents = ref(0);
const childrenMaxAge = ref(0);
const childrenInUniversityMaxAge = ref(0);
const healthPlanLimit = ref("");
const fixedAmount = ref(0);
const salaryComponent = ref<string | undefined>(undefined);
const companyContributionPercentage = ref(0);
const coveragePeriod = ref("");
const company = ref("");
const enabled = ref(true);
//Options Enums
import {
  limitTypeDefinitionOptions
} from "@/components/institution/create/utils";

// Watch for data changes
watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  maxNumberOfDependents.value = newData.maxNumberOfDependents || 0;
  childrenMaxAge.value = newData.childrenMaxAge || 0;
  childrenInUniversityMaxAge.value = newData.childrenInUniversityMaxAge || 0;
  fixedAmount.value = newData.fixedAmount || 0;
  companyContributionPercentage.value = newData.companyContributionPercentage || 0;
  healthPlanLimit.value = newData.healthPlanLimit || "";
  salaryComponent.value = newData.salaryComponent || undefined;
  enabled.value = newData.enabled || true;
  if (typeof newData.coveragePeriod === 'object' && newData.coveragePeriod !== null) {
    coveragePeriod.value = newData.coveragePeriod.id;
  } else {
    coveragePeriod.value = newData.coveragePeriod;
  }
  company.value = newData.company || "";
}, { immediate: true });

watch(healthPlanLimit, (newVal) => {
  if (newVal === 'FIXED_AMOUNT') {
    salaryComponent.value = undefined;
    companyContributionPercentage.value = 0;
  } else if (newVal !== 'FIXED_AMOUNT') {
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

const hasNumericValue = (v: number | string | null | undefined) =>
  v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  maxNumberOfDependents: [
    (v: number) => hasNumericValue(v) || t('t-please-enter-max-dependents'),
    (v: number) => Number(v) >= 0 || t('t-min-zero-dependents')
  ],
  childrenMaxAge: [
    (v: number) => hasNumericValue(v) || t('t-please-enter-max-age'),
    (v: number) => Number(v) >= 0 || t('t-min-zero-age')
  ],
  childrenInUniversityMaxAge: [
    (v: number) => hasNumericValue(v) || t('t-please-enter-max-age'),
    (v: number) => Number(v) >= 0 || t('t-min-zero-age')
  ],
  coveragePeriod: [
    (v: string) => !!v || t('t-please-select-coverage-period')
  ],
  healthPlanLimit: [
    (v: string) => !!v || t('t-please-select-plan-limit')
  ],
  // Regras condicionais como funções que verificam o contexto
  fixedAmount: [
    (v: number | null) =>
      healthPlanLimit.value !== 'FIXED_AMOUNT' ||
      !!v ||
      t('t-please-enter-fixed-amount')
  ],
  salaryComponent: [
    (v: string | null) =>
      healthPlanLimit.value !== 'ANUAL_SALARY' ||
      !!v ||
      t('t-please-select-salary-component')
  ],
  companyContributionPercentage: [
    (v: number | null) =>
      healthPlanLimit.value !== 'ANUAL_SALARY' ||
      !!v ||
      t('t-please-enter-company-contribution-percentage')
  ]
};

const coveragePeriods = computed(() => {
  return (coveragePeriodStore.enabledCoveragePeriods || [])
    .filter((item: CoveragePeriodListingType) =>
      !item.status || item.status.toString().toUpperCase() !== 'CLOSED'
    )
    .map((item: CoveragePeriodListingType) => ({
      value: item.id,
      label: item.name,
    }));
});

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const toast = useToast();
const getServerErrors = (field: string) => serverErrors.value[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

const onSubmit = async () => {
  if (!form.value) return;
  serverErrors.value = {};

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

  const payload: HealthPlanInsertType = {
    id: id.value || undefined,
    maxNumberOfDependents: maxNumberOfDependents.value,
    childrenMaxAge: childrenMaxAge.value,
    childrenInUniversityMaxAge: childrenInUniversityMaxAge.value,
    fixedAmount: fixedAmount.value,
    companyContributionPercentage: companyContributionPercentage.value,
    healthPlanLimit: healthPlanLimit.value,
    salaryComponent: salaryComponent.value,
    coveragePeriod: coveragePeriod.value,
    company: props.data?.company ?? "",
    enabled: enabled.value
  };

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: { error?: ApiErrorResponse }) => {
      serverErrors.value = getApiValidationErrors(error);
      if (Object.keys(serverErrors.value).length === 0) {
        errorMsg.value = getFirstApiErrorMessage(error, t('t-message-save-error')) || t('t-message-save-error');
      } else {
        errorMsg.value = "";
      }

      alertTimeout = setTimeout(() => {
        errorMsg.value = "";
        alertTimeout = null;
      }, 5000);
    },
    onFinally: () => localLoading.value = false
  });
};

watch(
  () => coveragePeriodStore.coverage_periods_for_dropdown,
  (newPeriods) => {
    if (!newPeriods || newPeriods.length === 0) return;

    const period = newPeriods.find(p => p.id === coveragePeriod.value);
    if (!period && typeof props.data?.coveragePeriod === 'object') {
      coveragePeriod.value = props.data.coveragePeriod.id;
    }
  },
  { immediate: true }
);


/* Watch for changes in the company prop to fetch coverage periods
*/

watch(() => props.data?.company, (newCompany) => {
  if (newCompany) {
    company.value = newCompany;
    coveragePeriodStore.fetchCoveragePeriodsForDropdown(newCompany, 0, 10000000);
  }
}, { immediate: true });

/* Carrega os períodos de cobertura ao montar o componente
 * Garante que company.value está definido antes de carregar
 */

onMounted(async () => {
  // Garante que company.value está definido antes de carregar
  if (!company.value && props.data?.company) {
    company.value = props.data.company;
  }

  try {
    if (company.value) {
      await coveragePeriodStore.fetchCoveragePeriodsForDropdown(company.value, 0, 10000000);

    }
  } catch (error) {
    console.error("Failed to load períodos de cobertura:", error);
    errorMsg.value = "Falha ao carregar períodos de cobertura";
    setTimeout(() => errorMsg.value = "", 5000);
  }
});

</script>
<template>
  <v-dialog v-model="dialogValue" width="500">

    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-health-plan') : $t('t-edit-health-plan')" title-class="py-0"
        style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />
        <transition name="fade">
          <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mx-5 mt-3" variant="tonal" color="danger"
            density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
        </transition>
        <v-card-text>
          <v-row class="">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-2">
                {{ $t('t-coverage-period') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="coveragePeriod" :items="coveragePeriods" :loading="coveragePeriodStore.loading"
                :rules="requiredRules.coveragePeriod" :disabled="!isCreate"
                :error-messages="getServerErrors('coveragePeriod')" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                {{ $t('t-maximum-number-of-dependents') }}<i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model.number="maxNumberOfDependents" :placeholder="t('t-enter-maximum-number-of-dependents')"
                :rules="applyServerErrorsToRules('maxNumberOfDependents', requiredRules.maxNumberOfDependents)" type="number" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                {{ $t('t-maximum-age-of-dependents') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model.number="childrenMaxAge" :placeholder="t('t-enter-maximum-age-of-dependents')"
                type="number" :rules="applyServerErrorsToRules('childrenMaxAge', requiredRules.childrenMaxAge)" class="mb-2" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">
                {{ $t('t-maximum-age-of-dependents-in-university') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model.number="childrenInUniversityMaxAge"
                :placeholder="t('t-enter-maximum-age-of-dependents-in-university')" type="number"
                :rules="applyServerErrorsToRules('childrenInUniversityMaxAge', requiredRules.childrenInUniversityMaxAge)" class="mb-2" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <!-- Health Plan Limit - Expande para 12 colunas quando for ANUAL_SALARY -->
            <v-col :cols="12" :lg="healthPlanLimit === 'ANUAL_SALARY' ? 12 : 6">
              <div class="font-weight-bold mb-2">
                {{ $t('t-health-plan-limit') }}<i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="healthPlanLimit" :items="healthPlanLimitOptions"
                :rules="requiredRules.healthPlanLimit" :error-messages="getServerErrors('healthPlanLimit')" />
            </v-col>

            <!-- Campo Fixed Amount - aparece apenas quando healthPlanLimit for FIXED_AMOUNT -->
            <v-col cols="12" lg="6" v-if="healthPlanLimit === 'FIXED_AMOUNT'">
              <div class="font-weight-bold mb-2">
                {{ $t('t-fixed-amount') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model.number="fixedAmount" type="number" :placeholder="t('t-enter-fixed-amount')"
                :rules="applyServerErrorsToRules('fixedAmount', requiredRules.fixedAmount)" class="mb-2" />
            </v-col>
          </v-row>

          <v-row class="mt-n6">
            <!-- Campo Salary Component - aparece apenas quando healthPlanLimit for ANUAL_SALARY -->
            <v-col cols="12" lg="6" v-if="healthPlanLimit === 'ANUAL_SALARY'">
              <div class="font-weight-bold mb-2">
                {{ $t('t-salary-component') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="salaryComponent" :items="salaryComponentOptions"
                :rules="requiredRules.salaryComponent" :error-messages="getServerErrors('salaryComponent')" />
            </v-col>

            <!-- Campo Company Contribution - aparece apenas quando healthPlanLimit for ANUAL_SALARY -->
            <v-col cols="12" lg="6" v-if="healthPlanLimit === 'ANUAL_SALARY'">
              <div class="font-weight-bold mb-2">
                {{ $t('t-company-contribuition-percentage') }}
              </div>
              <TextField v-model="companyContributionPercentage"
                :placeholder="t('t-enter-company-contribuition-percentage')" type="number" class="mb-2"
                :rules="applyServerErrorsToRules('companyContributionPercentage', requiredRules.companyContributionPercentage)" />
            </v-col>
          </v-row>
          <v-row :class="healthPlanLimit === 'ANUAL_SALARY' ? 'mt-n6' : ''">
            <v-col cols="12" lg="12" class="">
              <div class="font-weight-bold">{{ $t('t-availability') }}</div>
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
