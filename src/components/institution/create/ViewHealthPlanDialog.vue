<script lang="ts" setup>
import { PropType, computed } from "vue";
import { HealthPlanInsertType, HealthPlanListingType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { formateDate } from "@/app/common/dateFormate";
import Status from "@/app/common/components/Status.vue";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

// Utils
import { healthPlanLimitOptions, salaryComponentOptions } from "@/components/institution/create/utils";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<HealthPlanListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      maxNumberOfDependents: 0,
      childrenMaxAge: 0,
      fixedAmount: 0,
      companyContributionPercentage: 0,
      healthPlanLimit: "",
      salaryComponent: "",
      coveragePeriod: {
        id: undefined,
        name: ""
      },
      company: ""
    })
  },
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
 * Prepara dados para edição
 */
const gethealthPlanLimitLabel = (value: string | undefined) => {
  const option = healthPlanLimitOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getsalaryComponentLabel = (value: string | undefined) => {
  const option = salaryComponentOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

</script>

<template>
  <v-dialog v-model="dialogValue" width="500">
    <Card :title="$t('t-view-health-plan')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text>
        <v-row class="">
          <v-col cols="12" lg="12" class="text-right">
            <Status :status="props.data?.enabled ? 'enabled' : 'disabled'" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-coverage-period') }}
            </div>
            <div>{{ props.data?.coveragePeriod?.name || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-number-of-dependents') }}
            </div>
            <div>{{ props.data?.maxNumberOfDependents || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-age-of-dependents') }}
            </div>
            <div>{{ props.data?.childrenMaxAge || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-health-plan-limit') }}
            </div>
            <div>{{ gethealthPlanLimitLabel(props.data?.healthPlanLimit) || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-fixed-amount') }}
            </div>
            <div>{{ props.data?.fixedAmount || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-salary-component') }}
            </div>
            <div>{{ getsalaryComponentLabel(props.data?.salaryComponent) || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-company-contribuition-percentage') }}
            </div>
            <div>{{ props.data?.companyContributionPercentage || '-' }}</div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
