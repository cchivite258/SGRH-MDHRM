<script lang="ts" setup>
import { PropType, computed } from "vue";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";
import { integrationUsageOptions } from "@/components/settings/integration/listView/utils";
import type { ContractIntegration } from "@/components/institution/create/integration/types";
import {
  classificationTypeOptions,
  deductionBaseOptions,
  integrationModelOptions,
  settledAmountModeOptions,
} from "@/components/institution/create/integration/utils";

const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ContractIntegration | null>,
    required: false,
    default: null,
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

const display = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const optionLabel = (
  options: { label: string; value: string | number }[],
  value?: string | null
) => {
  if (!value) return "-";
  const option = options.find((item) => item.value === value);
  return option ? t(option.label) : value;
};

const definitionLabel = computed(() => {
  const definition = props.data?.integrationDefinition;
  if (!definition) return "-";
  const identity = [definition.code, definition.name].filter(Boolean).join(" - ");
  const application = definition.application ? ` (${definition.application})` : "";
  return `${identity || definition.id}${application}`;
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="920" scrollable>
    <Card :title="$t('t-view-contract-integration')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" class="text-right">
            <Status :status="data?.enabled ? 'enabled' : 'disabled'" />
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-definition") }}</div>
            <div>{{ definitionLabel }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-usage") }}</div>
            <div>{{ optionLabel(integrationUsageOptions, data?.usage) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-model") }}</div>
            <div>{{ optionLabel(integrationModelOptions, data?.integrationModel) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-classification") }}</div>
            <div>{{ optionLabel(classificationTypeOptions, data?.classificationType) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-project-cost-account") }}</div>
            <div>{{ display(data?.projectCostAccount) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-company-cost-account") }}</div>
            <div>{{ display(data?.companyCostAccount) }}</div>
          </v-col>

          <v-col cols="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-settled-amount-mode") }}</div>
            <div>{{ optionLabel(settledAmountModeOptions, data?.settledAmountMode) }}</div>
          </v-col>

          <v-col cols="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-deduction-limit") }}</div>
            <div>{{ display(data?.deductionLimitPercentage) }}</div>
          </v-col>

          <v-col cols="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-integration-deduction-base") }}</div>
            <div>{{ optionLabel(deductionBaseOptions, data?.deductionBase) }}</div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
