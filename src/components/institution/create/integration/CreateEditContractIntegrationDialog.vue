<script lang="ts" setup>
import { PropType, computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { getApiValidationErrors } from "@/app/common/apiErrors";
import { integrationDefinitionService } from "@/app/http/httpServiceProvider";
import { integrationUsageOptions } from "@/components/settings/integration/listView/utils";
import type { IntegrationDefinitionSummary, IntegrationUsageType } from "@/components/settings/integration/types";
import type { ContractIntegrationForm } from "@/components/institution/create/integration/types";
import {
  ACCOUNT_PATTERN,
  classificationTypeOptions,
  deductionBaseOptions,
  integrationModelOptions,
  settledAmountModeOptions,
} from "@/components/institution/create/integration/utils";

const emit = defineEmits(["update:modelValue", "onSubmit"]);
const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ContractIntegrationForm | null>,
    required: false,
    default: null,
  },
});

const localLoading = ref(false);
const definitionsLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});
const definitions = ref<IntegrationDefinitionSummary[]>([]);

const id = ref<ContractIntegrationForm["id"]>();
const contractId = ref<ContractIntegrationForm["contractId"]>("");
const integrationDefinitionId = ref<ContractIntegrationForm["integrationDefinitionId"]>("");
const usage = ref<ContractIntegrationForm["usage"]>("PAYMENT_ORDERS");
const integrationModel = ref<ContractIntegrationForm["integrationModel"]>("");
const classificationType = ref<ContractIntegrationForm["classificationType"]>("");
const projectCostAccount = ref("");
const companyCostAccount = ref("");
const settledAmountMode = ref<ContractIntegrationForm["settledAmountMode"]>("");
const deductionLimitPercentage = ref<number | null>(null);
const deductionBase = ref<ContractIntegrationForm["deductionBase"]>("");
const currentDefinition = ref<IntegrationDefinitionSummary | null>(null);

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const isCreate = computed(() => !id.value);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

const translateOptions = (options: { label: string; value: string | number }[]) =>
  options.map((option) => ({
    ...option,
    label: t(option.label),
  }));

const definitionOptions = computed(() => {
  const options = definitions.value.map((item) => {
    const identity = [item.code, item.name].filter(Boolean).join(" - ") || String(item.id);
    const application = item.application ? ` (${item.application})` : "";
    return {
      value: String(item.id),
      label: `${identity}${application}`,
    };
  });

  if (
    currentDefinition.value
    && !options.some((option) => option.value === String(currentDefinition.value?.id))
  ) {
    const identity = [currentDefinition.value.code, currentDefinition.value.name].filter(Boolean).join(" - ");
    options.unshift({
      value: String(currentDefinition.value.id),
      label: identity || String(currentDefinition.value.id),
    });
  }

  return options;
});

const requiredText = (message: string) => (value: string | number | null) =>
  !!String(value ?? "").trim() || message;

const optionalAccount = (value: string | null) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return true;
  if (normalized.length > 45) return t("t-contract-integration-account-maximum");
  return ACCOUNT_PATTERN.test(normalized) || t("t-contract-integration-account-invalid");
};

const requiredRules = {
  integrationDefinitionId: [requiredText(t("t-please-select-contract-integration-definition"))],
  usage: [requiredText(t("t-please-select-contract-integration-usage"))],
  integrationModel: [requiredText(t("t-please-select-contract-integration-model"))],
  classificationType: [requiredText(t("t-please-select-contract-integration-classification"))],
  settledAmountMode: [requiredText(t("t-please-select-contract-integration-settled-amount-mode"))],
  projectCostAccount: [optionalAccount],
  companyCostAccount: [optionalAccount],
  deductionLimitPercentage: [
    (value: number | string | null) => {
      if (value === null || value === undefined || value === "") return true;
      const parsed = Number(value);
      return (Number.isFinite(parsed) && parsed >= 0 && parsed <= 33.33)
        || t("t-contract-integration-deduction-limit-range");
    },
  ],
};

const getServerErrors = (field: string) => serverErrors.value[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  },
];

const applyData = (data: ContractIntegrationForm | null) => {
  id.value = data?.id;
  contractId.value = data?.contractId || "";
  integrationDefinitionId.value = data?.integrationDefinitionId ? String(data.integrationDefinitionId) : "";
  usage.value = data?.usage || "PAYMENT_ORDERS";
  integrationModel.value = data?.integrationModel || "";
  classificationType.value = data?.classificationType || "";
  projectCostAccount.value = data?.projectCostAccount || "";
  companyCostAccount.value = data?.companyCostAccount || "";
  settledAmountMode.value = data?.settledAmountMode || "";
  deductionLimitPercentage.value = data?.deductionLimitPercentage ?? null;
  deductionBase.value = data?.deductionBase || "";
  currentDefinition.value = data?.integrationDefinition || null;
  serverErrors.value = {};
  errorMsg.value = "";
};

const loadDefinitions = async (selectedUsage: IntegrationUsageType | "") => {
  if (!selectedUsage) {
    definitions.value = [];
    return;
  }

  definitionsLoading.value = true;
  try {
    definitions.value = await integrationDefinitionService.getAvailableIntegrationDefinitions(selectedUsage);
  } catch (error) {
    definitions.value = [];
    toast.error(t("t-contract-integration-definitions-load-error"));
  } finally {
    definitionsLoading.value = false;
  }
};

watch(() => props.data, (data) => {
  applyData(data);
}, { immediate: true });

watch(() => props.modelValue, (open) => {
  if (!open) return;
  applyData(props.data);
  loadDefinitions(usage.value);
}, { immediate: true });

watch(usage, (selectedUsage) => {
  if (!dialogValue.value || !isCreate.value) return;
  integrationDefinitionId.value = "";
  loadDefinitions(selectedUsage);
});

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
    toast.error(t("t-validation-error"));
    errorMsg.value = t("t-please-correct-errors");
    return;
  }

  localLoading.value = true;

  const payload: ContractIntegrationForm = {
    id: id.value,
    contractId: contractId.value,
    integrationDefinitionId: integrationDefinitionId.value,
    usage: usage.value,
    integrationModel: integrationModel.value,
    classificationType: classificationType.value,
    projectCostAccount: projectCostAccount.value.trim(),
    companyCostAccount: companyCostAccount.value.trim(),
    settledAmountMode: settledAmountMode.value,
    deductionLimitPercentage: deductionLimitPercentage.value === null || `${deductionLimitPercentage.value}` === ""
      ? null
      : Number(deductionLimitPercentage.value),
    deductionBase: deductionBase.value,
    integrationDefinition: currentDefinition.value,
  };

  emit("onSubmit", payload, {
    onSuccess: () => {
      dialogValue.value = false;
    },
    onError: (error: any) => {
      serverErrors.value = getApiValidationErrors(error);
    },
    onFinally: () => {
      localLoading.value = false;
    },
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="920" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card
        :title="isCreate ? $t('t-add-contract-integration') : $t('t-edit-contract-integration')"
        title-class="py-0"
        style="overflow: hidden"
      >
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-alert
          v-if="errorMsg"
          :text="errorMsg"
          variant="tonal"
          color="danger"
          class="mx-5 mt-3"
          density="compact"
        />

        <v-card-text class="overflow-y-auto" style="max-height: 70vh">
          <p class="text-medium-emphasis text-body-2 mb-4">
            {{ $t("t-contract-integration-hint") }}
          </p>

          <v-row>
            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-usage") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="usage"
                :items="translateOptions(integrationUsageOptions)"
                :disabled="!isCreate"
                :rules="applyServerErrorsToRules('usage', requiredRules.usage)"
                :error-messages="getServerErrors('usage')"
                :placeholder="$t('t-select-contract-integration-usage')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-definition") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="integrationDefinitionId"
                :items="definitionOptions"
                :loading="definitionsLoading"
                :rules="applyServerErrorsToRules('integrationDefinitionId', requiredRules.integrationDefinitionId)"
                :error-messages="getServerErrors('integrationDefinitionId')"
                :placeholder="$t('t-select-contract-integration-definition')"
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="!definitionsLoading && usage && !definitionOptions.length"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            {{ $t("t-contract-integration-no-definitions") }}
          </v-alert>

          <v-row class="mt-n3">
            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-model") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="integrationModel"
                :items="translateOptions(integrationModelOptions)"
                :rules="applyServerErrorsToRules('integrationModel', requiredRules.integrationModel)"
                :error-messages="getServerErrors('integrationModel')"
                :placeholder="$t('t-select-contract-integration-model')"
              />
            </v-col>

            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-classification") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="classificationType"
                :items="translateOptions(classificationTypeOptions)"
                :rules="applyServerErrorsToRules('classificationType', requiredRules.classificationType)"
                :error-messages="getServerErrors('classificationType')"
                :placeholder="$t('t-select-contract-integration-classification')"
              />
            </v-col>
          </v-row>

          <v-row class="mt-n3">
            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-project-cost-account") }}
              </div>
              <TextField
                v-model="projectCostAccount"
                :placeholder="$t('t-enter-contract-integration-account')"
                :rules="applyServerErrorsToRules('projectCostAccount', requiredRules.projectCostAccount)"
                max-length="45"
              />
            </v-col>

            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-company-cost-account") }}
              </div>
              <TextField
                v-model="companyCostAccount"
                :placeholder="$t('t-enter-contract-integration-account')"
                :rules="applyServerErrorsToRules('companyCostAccount', requiredRules.companyCostAccount)"
                max-length="45"
              />
            </v-col>
          </v-row>

          <v-row class="mt-n3">
            <v-col cols="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-settled-amount-mode") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="settledAmountMode"
                :items="translateOptions(settledAmountModeOptions)"
                :rules="applyServerErrorsToRules('settledAmountMode', requiredRules.settledAmountMode)"
                :error-messages="getServerErrors('settledAmountMode')"
                :placeholder="$t('t-select-contract-integration-settled-amount-mode')"
              />
            </v-col>

            <v-col cols="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-deduction-limit") }}
              </div>
              <TextField
                v-model.number="deductionLimitPercentage"
                type="number"
                min="0"
                max="33.33"
                step="0.01"
                :placeholder="$t('t-enter-contract-integration-deduction-limit')"
                :rules="applyServerErrorsToRules('deductionLimitPercentage', requiredRules.deductionLimitPercentage)"
              />
            </v-col>

            <v-col cols="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-deduction-base") }}
              </div>
              <MenuSelect
                v-model="deductionBase"
                :items="translateOptions(deductionBaseOptions)"
                :error-messages="getServerErrors('deductionBase')"
                :placeholder="$t('t-select-contract-integration-deduction-base')"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" :loading="localLoading" :disabled="localLoading" @click="onSubmit">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
