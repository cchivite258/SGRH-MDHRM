<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted, nextTick } from "vue";
import { HealthPlanListingType, HospitalProcedureInsertType, HospitalProcedureListingType } from "@/components/institution/types";
import { HospitalProcedureTypeListing } from "@/components/baseTables/hospitalProcedureType/types";
import { HospitalProcedureGroupListing } from "@/components/baseTables/hospitalProcedureGroup/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { useHospitalProcedureTypeStore } from '@/store/baseTables/hospitalProcedureTypeStore';
import { useHospitalProcedureGroupStore } from "@/store/baseTables/hospitalProcedureGroupStore";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiValidationErrors, getFirstApiErrorMessage } from "@/app/common/apiErrors";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

// Components
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

// Store para tipos de procedimentos hospitalares
const hospitalProcedureTypeStore = useHospitalProcedureTypeStore();
const hospitalProcedureGroupStore = useHospitalProcedureGroupStore();
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
      hospitalProcedureGroup: "",
      groupFixedAmount: null,
      groupPercentage: null,
      hospitalProcedureGroupLimit: "",
      belongsToGroup: false,
      limitType: "NONE",
      frequencyInterval: null,
      allowedFrequencyUse: 0,
      hospitalProcedureType: "",
      companyHealthPlan: "",
      enabled: true
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});

// Form fields
const id = ref("");
const fixedAmount = ref(0);
const percentage = ref(0);
const limitTypeDefinition = ref("");
const hospitalProcedureGroup = ref("");
const groupFixedAmount = ref<number | null>(null);
const groupPercentage = ref<number | null>(null);
const hospitalProcedureGroupLimit = ref("");
const belongsToGroup = ref(false);
const limitType = ref("NONE");
const frequencyInterval = ref<number | null>(null);
const allowedFrequencyUse = ref<number | null>(0);
const hospitalProcedureType = ref("");
const companyHealthPlan = ref(""); 
const enabled = ref(true);

//Options Enums
import {
  limitTypeDefinitionOptions
} from "@/components/institution/create/utils";

const hospitalProcedureLimitTypeOptions = computed<MenuSelectItemType[]>(() => [
  { label: t("t-limit-type-none"), value: "NONE" },
  { label: t("t-limit-type-day"), value: "DAY" },
  { label: t("t-limit-type-month"), value: "MONTH" },
  { label: t("t-limit-type-year"), value: "YEAR" }
]);

const getHospitalProcedureGroupValue = (
  group: HospitalProcedureListingType["hospitalProcedureGroup"] | number
) => {
  if (!group) return "";
  if (typeof group === "string" || typeof group === "number") return String(group);
  return group.id != null ? String(group.id) : "";
};

// Watch for data changes
watch(() => props.data, (newData) => {
  if (newData) {
    id.value = newData.id || "";
    fixedAmount.value = newData.fixedAmount ?? 0;
    percentage.value = newData.percentage ?? 0;
    limitTypeDefinition.value = newData.limitTypeDefinition || "";
    const groupId = getHospitalProcedureGroupValue(newData.hospitalProcedureGroup)
      || (newData as any).hospitalProcedureGroupId;
    hospitalProcedureGroup.value = groupId != null ? String(groupId) : "";
    groupFixedAmount.value = newData.groupFixedAmount ?? null;
    groupPercentage.value = newData.groupPercentage ?? null;
    hospitalProcedureGroupLimit.value = newData.hospitalProcedureGroupLimit ?? "";
    belongsToGroup.value = newData.belongsToGroup ?? false;
    limitType.value = newData.limitType || "NONE";
    frequencyInterval.value = newData.frequencyInterval ?? null;
    allowedFrequencyUse.value = newData.allowedFrequencyUse ?? 0;
    
    if (typeof newData.hospitalProcedureType === 'object' && newData.hospitalProcedureType !== null) {
      hospitalProcedureType.value = newData.hospitalProcedureType.id; 
    } else {
      hospitalProcedureType.value = newData.hospitalProcedureType || ""; 
    }
    
    // Garanta que companyHealthPlan nunca seja perdido
    companyHealthPlan.value = newData.companyHealthPlan || (props.data?.companyHealthPlan || "");
    enabled.value = newData.enabled ?? true;

  }
}, { immediate: true });

watch(limitTypeDefinition, (newVal) => {
  if (belongsToGroup.value) return;
  if (newVal === 'FIXED_AMOUNT') {
    percentage.value = 0;
  } else if (newVal === 'PERCENTAGE') {
    fixedAmount.value = 0;
  }
});

watch(hospitalProcedureGroupLimit, (newVal) => {
  if (!belongsToGroup.value) return;
  if (newVal === 'FIXED_AMOUNT') {
    groupPercentage.value = null;
  } else if (newVal === 'PERCENTAGE') {
    groupFixedAmount.value = null;
  }
});

watch(belongsToGroup, (isGroupBased) => {
  if (isGroupBased) {
    hospitalProcedureType.value = "";
    fixedAmount.value = 0;
    percentage.value = 0;
    limitTypeDefinition.value = "";
    return;
  }

  hospitalProcedureGroup.value = "";
  groupFixedAmount.value = null;
  groupPercentage.value = null;
  hospitalProcedureGroupLimit.value = "";
});

const isCreate = computed(() => !id.value);
const hasUsageLimit = computed(() => !!limitType.value && limitType.value !== "NONE");
const hasSelectedAmountLimit = computed(() => {
  const selectedLimit = belongsToGroup.value ? hospitalProcedureGroupLimit.value : limitTypeDefinition.value;
  return selectedLimit === "FIXED_AMOUNT" || selectedLimit === "PERCENTAGE";
});

watch(limitType, (selectedLimitType) => {
  if (!selectedLimitType || selectedLimitType === "NONE") {
    frequencyInterval.value = null;
    allowedFrequencyUse.value = 0;
  }
});

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
    (v: string) => belongsToGroup.value || !!v || t('t-please-enter-hospital-procedure-type'),
  ],
  limitTypeDefinition: [
    (v: string) => belongsToGroup.value || !!v || t('t-please-enter-limit-type-definition'),
  ],
  hospitalProcedureGroup: [
    (v: string) => !belongsToGroup.value || !!v || t('t-please-enter-hospital-procedure-group'),
  ],
  hospitalProcedureGroupLimit: [
    (v: string) => !belongsToGroup.value || !!v || t('t-please-enter-hospital-procedure-group-limit'),
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
  groupFixedAmount: [
    (v: number | null) => {
      if (belongsToGroup.value && hospitalProcedureGroupLimit.value === 'FIXED_AMOUNT') {
        if (v === undefined || v === null) return t('t-please-enter-group-fixed-amount');
        if (v <= 0) return t('t-min-zero-amount');
      }
      return true;
    }
  ],
  groupPercentage: [
    (v: number | null) => {
      if (belongsToGroup.value && hospitalProcedureGroupLimit.value === 'PERCENTAGE') {
        if (v === undefined || v === null) return t('t-please-enter-group-percentage');
        if (v <= 0) return t('t-min-zero-percentage');
        if (v > 100) return t('t-max-100-percentage');
      }
      return true;
    }
  ],
  frequencyInterval: [
    (v: number | null) => {
      if (!hasUsageLimit.value) return true;
      if (v === undefined || v === null) return t('t-please-enter-frequency-interval');
      return Number(v) > 0 || t('t-frequency-interval-minimum');
    }
  ],
  allowedFrequencyUse: [
    (v: number | null) => {
      if (!hasUsageLimit.value) return true;
      if (v === undefined || v === null) return t('t-please-enter-allowed-frequency-use');
      return Number(v) > 0 || t('t-allowed-frequency-use-minimum');
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

const hospitalProcedureGroups = computed(() => {
  return (hospitalProcedureGroupStore.hospital_procedure_groups_dropdown || []).map((item: HospitalProcedureGroupListing) => ({
    value: String(item.id),
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

  const payload: HospitalProcedureInsertType = {
    id: id.value || undefined,
    fixedAmount: belongsToGroup.value ? null : fixedAmount.value,
    percentage: belongsToGroup.value ? null : percentage.value,
    limitTypeDefinition: belongsToGroup.value ? "" : limitTypeDefinition.value,
    hospitalProcedureGroup: belongsToGroup.value ? (hospitalProcedureGroup.value || null) : null,
    groupFixedAmount: belongsToGroup.value ? groupFixedAmount.value : null,
    groupPercentage: belongsToGroup.value ? groupPercentage.value : null,
    hospitalProcedureGroupLimit: belongsToGroup.value ? (hospitalProcedureGroupLimit.value || null) : null,
    ...(isCreate.value ? { belongsToGroup: belongsToGroup.value } : {}),
    limitType: limitType.value || "NONE",
    frequencyInterval: hasUsageLimit.value ? frequencyInterval.value : null,
    allowedFrequencyUse: allowedFrequencyUse.value ?? 0,
    hospitalProcedureType: belongsToGroup.value ? undefined : hospitalProcedureType.value,
    companyHealthPlan: companyHealthPlan.value,
    company: props.data?.company || "",
    enabled: enabled.value 
  };

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== "")
  ) as HospitalProcedureInsertType;

  emit("onSubmit", cleanPayload, {
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

/* Watch for changes in the companyHealthPlan prop to fetch coverage periods
*/

watch(() => props.data?.companyHealthPlan, (newCompanyHealthPlan) => {
  if (newCompanyHealthPlan) {
    companyHealthPlan.value = newCompanyHealthPlan;
    hospitalProcedureTypeStore.fetchHospitalProcedureTypesForDropdown(0, 10000000);
    healthPlanStore.fetchHealthPlansForDropdown(newCompanyHealthPlan, 0, 10000000);
    hospitalProcedureGroupStore.fetchHospitalProcedureGroupsForDropdown(0, 10000000);
  }
}, { immediate: true });


onMounted(async () => {
  // Garante que companyHealthPlan.value está definido antes de carregar
  companyHealthPlan.value = props.data?.companyHealthPlan || "";
  
  try {
    if (companyHealthPlan.value) {
      await hospitalProcedureTypeStore.fetchHospitalProcedureTypesForDropdown(0,10000000);
      await healthPlanStore.fetchHealthPlansForDropdown(companyHealthPlan.value, 0, 10000000);
      await hospitalProcedureGroupStore.fetchHospitalProcedureGroupsForDropdown(0, 10000000);
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
        <v-card-text class="hospital-procedure-dialog-content">
          <!--<v-row class="">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-health-plan') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="companyHealthPlan" :items="heathPlanOptions"
                :loading="healthPlanStore.loading" :rules="requiredRules.companyHealthPlan" :disabled="!isCreate"/>
            </v-col>
          </v-row>-->
          <v-row class="">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">{{ $t('t-belongs-to-group') }}</div>
              <v-checkbox v-model="belongsToGroup" density="compact" color="primary" class="d-inline-flex"
                :disabled="!isCreate">
                <template #label>
                  <span>{{ $t('t-belongs-to-group') }}?</span>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>
          <v-row class="mt-n3">
            <v-col cols="12" lg="12" v-if="!belongsToGroup">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-hospital-procedure-type') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="hospitalProcedureType" :items="hospitalProceduresTypes"
                :loading="hospitalProcedureTypeStore.loading" :rules="requiredRules.hospitalProcedureType"
                :error-messages="getServerErrors('hospitalProcedureType')" :disabled="!isCreate" />
            </v-col>
            <v-col cols="12" lg="12" v-if="belongsToGroup">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-hospital-procedure-group') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="hospitalProcedureGroup" :items="hospitalProcedureGroups"
                :loading="hospitalProcedureGroupStore.loading"
                :rules="applyServerErrorsToRules('hospitalProcedureGroup', requiredRules.hospitalProcedureGroup)" 
                :error-messages="getServerErrors('hospitalProcedureGroup')" :disabled="!isCreate" />
            </v-col>
          </v-row>
          <v-row class="mt-n9" v-if="belongsToGroup">
            <v-col cols="12" :lg="hasSelectedAmountLimit ? 6 : 12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-hospital-procedure-group-limit') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="hospitalProcedureGroupLimit" :items="limitTypeDefinitionOptions"
                :rules="applyServerErrorsToRules('hospitalProcedureGroupLimit', requiredRules.hospitalProcedureGroupLimit)"
                :error-messages="getServerErrors('hospitalProcedureGroupLimit')" />
            </v-col>
            <v-col :cols="12" :lg="hasSelectedAmountLimit ? 6 : 12" v-if="hospitalProcedureGroupLimit === 'FIXED_AMOUNT'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-group-fixed-amount') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="groupFixedAmount" type="number" :placeholder="$t('t-enter-group-fixed-amount')"
                :rules="applyServerErrorsToRules('groupFixedAmount', requiredRules.groupFixedAmount)" />
            </v-col>
            <v-col :cols="12" :lg="hasSelectedAmountLimit ? 6 : 12" v-if="hospitalProcedureGroupLimit === 'PERCENTAGE'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-group-percentage') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="groupPercentage" type="number" :placeholder="$t('t-enter-group-percentage')"
                :rules="applyServerErrorsToRules('groupPercentage', requiredRules.groupPercentage)" />
            </v-col>
          </v-row>
          <v-row class="mt-n7" v-if="!belongsToGroup">
            <v-col cols="12" :lg="hasSelectedAmountLimit ? 6 : 12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-limit-type-definition') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="limitTypeDefinition" :items="limitTypeDefinitionOptions"
                :rules="requiredRules.limitTypeDefinition" :error-messages="getServerErrors('limitTypeDefinition')" />
            </v-col>
            <v-col :cols="12" :lg="hasSelectedAmountLimit ? 6 : 12" v-if="limitTypeDefinition === 'FIXED_AMOUNT'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-fixed-amount') }} <i v-if="limitTypeDefinition === 'FIXED_AMOUNT'"
                  class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="fixedAmount" type="number" :placeholder="$t('t-enter-fixed-amount')"
                :rules="applyServerErrorsToRules('fixedAmount', requiredRules.fixedAmount)" />
            </v-col>     
            <v-col :cols="12" :lg="hasSelectedAmountLimit ? 6 : 12" v-if="limitTypeDefinition === 'PERCENTAGE'">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-percentage') }} <i v-if="limitTypeDefinition === 'PERCENTAGE'"
                  class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="percentage" type="number" :placeholder="$t('t-enter-percentage')"
                :rules="applyServerErrorsToRules('percentage', requiredRules.percentage)" />
            </v-col>
          </v-row>
          <v-row class="mt-n8">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">{{ $t('t-limit-type') }}</div>
              <MenuSelect v-model="limitType" :items="hospitalProcedureLimitTypeOptions"
                :error-messages="getServerErrors('limitType')" />
            </v-col>
          </v-row>
          <v-row v-if="hasUsageLimit" class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-frequency-interval') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model.number="frequencyInterval" type="number"
                :placeholder="$t('t-enter-frequency-interval')"
                :rules="applyServerErrorsToRules('frequencyInterval', requiredRules.frequencyInterval)"
                :error-messages="getServerErrors('frequencyInterval')" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-allowed-frequency-use') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model.number="allowedFrequencyUse" type="number"
                :placeholder="$t('t-enter-allowed-frequency-use')"
                :rules="applyServerErrorsToRules('allowedFrequencyUse', requiredRules.allowedFrequencyUse)"
                :error-messages="getServerErrors('allowedFrequencyUse')" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
          <v-col cols="12" lg="12" class="">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-enabled') }}</div>
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

<style scoped>
.hospital-procedure-dialog-content {
  max-height: min(70vh, calc(100dvh - 200px));
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
