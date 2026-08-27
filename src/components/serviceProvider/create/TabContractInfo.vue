<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import ServiceProviderContractExtensionsDialog from "@/components/serviceProvider/create/ServiceProviderContractExtensionsDialog.vue";
import ServiceProviderAttachments from "@/components/serviceProvider/create/ServiceProviderAttachments.vue";
import type { ServiceProviderInsertType } from "@/components/serviceProvider/types";
import { useUserStore } from "@/store/userStore";
import type { UserType1 } from "@/app/http/types";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

const { t } = useI18n();
const userStore = useUserStore();
const { can, canAny } = usePermissions();

const emit = defineEmits<{
  (e: "onStepChange", step: number): void;
  (e: "update:modelValue", value: ServiceProviderInsertType): void;
  (e: "clear-server-error", field: string): void;
  (e: "validated"): void;
}>();

const props = withDefaults(defineProps<{
  modelValue: ServiceProviderInsertType;
  serviceProviderId?: string | null;
  loading?: boolean;
  serverErrors?: Record<string, string[]>;
  showActions?: boolean;
}>(), {
  serviceProviderId: null,
  loading: false,
  serverErrors: () => ({}),
  showActions: true
});

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const attachmentsRef = ref<{ refreshServiceProviderAttachments: () => Promise<void> } | null>(null);
const startDatePickerRef = ref<{ validate: () => boolean | Promise<boolean> } | null>(null);
const endDatePickerRef = ref<{ validate: () => boolean | Promise<boolean> } | null>(null);
const errorMsg = ref("");
const contractExtensionsDialog = ref(false);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const canConsultContractExtensions = computed(() => canAny([
  PERMISSIONS.SERVICE_PROVIDER_CONTRACT_EXTENSIONS.READ,
  PERMISSIONS.SERVICE_PROVIDER_CONTRACT_EXTENSIONS.CREATE,
  PERMISSIONS.SERVICE_PROVIDER_CONTRACT_EXTENSIONS.UPDATE,
]));
const canManageContractExtensions = computed(() => canAny([
  PERMISSIONS.SERVICE_PROVIDER_CONTRACT_EXTENSIONS.CREATE,
  PERMISSIONS.SERVICE_PROVIDER_CONTRACT_EXTENSIONS.UPDATE,
]));
const canConsultAttachments = computed(() => canAny([
  PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.READ,
  PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.CREATE,
  PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.DELETE,
]));

const serviceProviderData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  }
});

const getServerErrors = (field: string) => props.serverErrors?.[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

const requiredRules = {
  responsibleId: [
    (v: string | number | null | undefined) => !!v || t("t-please-select-contract-responsible")
  ],
  contractStartDate: [
    (v: Date | string | null) => !!v || t("t-please-enter-contract-start-date")
  ],
  contractEndDate: [
    (v: Date | string | null) => !!v || t("t-please-enter-contract-end-date"),
    (v: Date | string | null) => {
      if (!v || !serviceProviderData.value.contractStartDate) return true;
      const startDate = new Date(serviceProviderData.value.contractStartDate);
      const endDate = new Date(v);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return t("t-validation-error");
      }
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= startDate || t("t-contract-end-date-must-be-after-start-date");
    }
  ],
  optionalPositiveNumber: [
    (v: string | number | null | undefined) => v === null || v === undefined || v === "" || Number(v) >= 0 || t("t-value-must-be-zero-or-greater")
  ],
  requiredPositiveNumber: [
    (v: string | number | null | undefined) => v !== null && v !== undefined && v !== "" || t("t-required-field"),
    (v: string | number | null | undefined) => Number(v) >= 0 || t("t-value-must-be-zero-or-greater")
  ]
};

const userOptions = computed(() =>
  (userStore.users as UserType1[]).map((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return {
      value: String(user.id),
      label: fullName ? `${fullName} (${user.email})` : user.email,
    };
  })
);

onMounted(async () => {
  userStore.clearFilters();
  await userStore.fetchUsers(0, 10000000);
});

watch(
  () => props.serverErrors,
  async (errors) => {
    if (errors && Object.keys(errors).length > 0) {
      await nextTick();
      await startDatePickerRef.value?.validate?.();
      await endDatePickerRef.value?.validate?.();
      await form.value?.validate();
    }
  },
  { deep: true }
);

watch(() => serviceProviderData.value.contractStartDate, () => emit("clear-server-error", "contractStartDate"));
watch(() => serviceProviderData.value.contractEndDate, () => emit("clear-server-error", "contractEndDate"));
watch(() => serviceProviderData.value.responsibleId, () => emit("clear-server-error", "responsibleId"));
watch(() => serviceProviderData.value.erpCode, () => emit("clear-server-error", "erpCode"));
watch(() => serviceProviderData.value.isBusinessDays, () => emit("clear-server-error", "isBusinessDays"));
watch(() => serviceProviderData.value.gracePeriod, () => emit("clear-server-error", "gracePeriod"));
watch(() => serviceProviderData.value.maxDaysAfterService, () => emit("clear-server-error", "maxDaysAfterService"));

const showError = () => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
  }

  errorMsg.value = t("t-please-correct-errors");
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

const validateForm = async () => {
  if (!form.value) return false;

  const isStartDateValid = await startDatePickerRef.value?.validate?.();
  const isEndDateValid = await endDatePickerRef.value?.validate?.();
  const { valid } = await form.value.validate();

  if (!valid || isStartDateValid === false || isEndDateValid === false) {
    showError();
    return false;
  }

  return true;
};

const submitForm = async () => {
  const valid = await validateForm();
  if (!valid) return;

  emit("validated");
  emit("onStepChange", 3);
};

const refreshContractDocuments = async () => {
  await nextTick();
  await attachmentsRef.value?.refreshServiceProviderAttachments();
};

defineExpose({ submitForm, validateForm });
</script>

<template>
  <v-form ref="form" @submit.prevent="submitForm">
    <Card :title="$t('t-contract')" elevation="0" title-class="pb-0">
      <template #title-action>
        <v-btn
          v-if="serviceProviderId && canConsultContractExtensions"
          color="info"
          variant="tonal"
          :disabled="loading"
          @click="contractExtensionsDialog = true"
        >
          <i class="ph-file-plus me-2" />
          {{ $t('t-contract-addenda') }}
        </v-btn>
      </template>

      <transition name="fade">
        <v-alert
          v-if="errorMsg"
          :text="errorMsg"
          type="error"
          class="mb-4 mx-5 mt-3"
          variant="tonal"
          color="danger"
          density="compact"
          @click="errorMsg = ''"
          style="cursor: pointer;"
        />
      </transition>

      <v-card-text class="pt-0">
        <v-row class="mt-2">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-contract-code') }}
            </div>
            <TextField :model-value="serviceProviderData.code || ''" :disabled="true" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-erp-code') }}
            </div>
            <TextField
              v-model="serviceProviderData.erpCode"
              :error-messages="getServerErrors('erpCode')"
            />
          </v-col>
        </v-row>

        <v-row class="mt-n2">
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-is-business-days') }}
            </div>
            <v-checkbox v-model="serviceProviderData.isBusinessDays" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-count-business-days') }}</span>
              </template>
            </v-checkbox>
          </v-col>

          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-max-days-after-service') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="serviceProviderData.maxDaysAfterService"
              type="number"
              :placeholder="$t('t-enter-max-days-after-service')"
              :rules="applyServerErrorsToRules('maxDaysAfterService', requiredRules.requiredPositiveNumber)"
            />
          </v-col>

          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-grace-period') }}
            </div>
            <TextField
              v-model="serviceProviderData.gracePeriod"
              type="number"
              :placeholder="$t('t-enter-grace-period')"
              :rules="applyServerErrorsToRules('gracePeriod', requiredRules.optionalPositiveNumber)"
            />
          </v-col>
        </v-row>

        <v-row class="mt-2">
          <v-col cols="12" lg="4" class="mt-n4">
            <div class="font-weight-bold mb-2 " >
              {{ $t('t-contract-start-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker
              ref="startDatePickerRef"
              v-model="serviceProviderData.contractStartDate"
              :placeholder="$t('t-enter-contract-start-date')"
              :rules="applyServerErrorsToRules('contractStartDate', requiredRules.contractStartDate)"
              :teleport="true"
              format="dd/MM/yyyy"
            />
          </v-col>

          <v-col cols="12" lg="4" class="mt-n4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-contract-end-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker
              ref="endDatePickerRef"
              v-model="serviceProviderData.contractEndDate"
              :placeholder="$t('t-enter-contract-end-date')"
              :rules="applyServerErrorsToRules('contractEndDate', requiredRules.contractEndDate)"
              :teleport="true"
              format="dd/MM/yyyy"
            />
          </v-col>

          <v-col cols="12" lg="4" class="mt-n4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-contract-responsible') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect
              v-model="serviceProviderData.responsibleId"
              :items="userOptions"
              :loading="userStore.loading"
              :placeholder="$t('t-select-contract-responsible')"
              :rules="applyServerErrorsToRules('responsibleId', requiredRules.responsibleId)"
              :error-messages="getServerErrors('responsibleId')"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-3">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 1)" :disabled="loading">
          <i class="ph-arrow-left me-2" /> {{ $t('t-back-to-general-info') }}
        </v-btn>

        <v-btn color="secondary" variant="elevated" @click="submitForm" :loading="loading">
          {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
        </v-btn>
      </v-card-actions>
    </Card>

    <ServiceProviderContractExtensionsDialog
      v-model="contractExtensionsDialog"
      :service-provider-id="serviceProviderId"
      :service-provider-name="serviceProviderData.name || ''"
      :current-contract-end-date="serviceProviderData.contractEndDate || null"
      :read-only="!canManageContractExtensions"
      @saved="refreshContractDocuments"
    />
  </v-form>

  <ServiceProviderAttachments
    v-if="serviceProviderId && canConsultAttachments"
    ref="attachmentsRef"
    class="mt-4"
    :service-provider-id="serviceProviderId"
  />
</template>

<style scoped>
:deep(.dp__input) {
  height: 2.63rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
