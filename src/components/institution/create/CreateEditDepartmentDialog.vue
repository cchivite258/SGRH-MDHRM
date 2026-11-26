<script lang="ts" setup>
import { PropType, computed, ref, watch, nextTick } from "vue";
import { DepartmentInsertType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { getApiValidationErrors } from "@/app/common/apiErrors";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import {
  COST_CENTER_ACCOUNT_MAX_LENGTH,
  paymentOrderCodeRules
} from "@/app/common/paymentOrderData";

const { t } = useI18n();
const { can } = usePermissions();
const canEditPaymentOrderData = computed(() => can(PERMISSIONS.CONTRACT_DEPARTMENTS.UPDATE_PAYMENT_ORDER_DATA));
const costCenterAccountRules = computed(() => paymentOrderCodeRules(
  COST_CENTER_ACCOUNT_MAX_LENGTH,
  t("t-cost-center-account-invalid"),
  t("t-cost-center-account-maximum")
));
const emit = defineEmits(["update:modelValue", "onSubmit"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // No CreateEditContactDialog.vue
  data: {
    type: Object as PropType<DepartmentInsertType | null>,
    required: false,
    default: () => ({
      id: undefined,
      name: "",
      description: "",
      costCenterAccount: "",
      company: "",
      enabled: true
    })
  },
});

const activeTab = ref("general");
const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});

// Form fields
const id = ref("");
const fullname = ref("");
const description = ref("");
const costCenterAccount = ref("");
const enabled = ref(true);

// Watch for data changes
watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  fullname.value = newData.name || "";
  description.value = newData.description || "";
  costCenterAccount.value = newData.costCenterAccount || "";
  enabled.value = newData.enabled || true;
}, { immediate: true });


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
  name: [
    (v: string) => !!v || t('t-please-enter-department-name'),
  ],
  description: [
    (v: string) => !!v || t('t-please-enter-description'),
  ]
};

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
  if (errors.costCenterAccount?.length) {
    activeTab.value = "integration";
  }
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
    const accountError = costCenterAccountRules.value[0]?.(costCenterAccount.value);
    if (accountError !== true) {
      activeTab.value = "integration";
    }
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  localLoading.value = true;

  const payload: DepartmentInsertType = {
  id: id.value || undefined,
  name: fullname.value, 
  description: description.value,
  costCenterAccount: costCenterAccount.value,
  company: props.data?.company ?? "",
  enabled: true 
};


  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: any) => {
      serverErrors.value = getApiValidationErrors(error);
    },
    onFinally: () => localLoading.value = false
  });
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="640" >
    <v-form ref="form" @submit.prevent="onSubmit"> 
    <Card :title="isCreate ? $t('t-add-department') : $t('t-edit-department')" title-class="py-0"
      style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
      <v-card-text>
        <v-tabs v-model="activeTab" color="primary" density="comfortable">
          <v-tab value="general">{{ $t('t-general-information') }}</v-tab>
          <v-tab value="integration">{{ $t('t-integration') }}</v-tab>
        </v-tabs>
        <v-window v-model="activeTab" class="department-window mt-4">
          <v-window-item value="general" eager>
            <v-row class="mx-0">
              <v-col cols="12">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <TextField v-model="fullname" :placeholder="$t('t-enter-name')"
                  :rules="applyServerErrorsToRules('name', requiredRules.name)" />
              </v-col>
            </v-row>
            <v-row class="mx-0 mt-n6">
              <v-col cols="12">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-description') }} <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <TextField v-model="description" :placeholder="$t('t-enter-description')"
                  :rules="applyServerErrorsToRules('description', requiredRules.description)" />
              </v-col>
            </v-row>
            <v-row class="mx-0 mt-n6">
              <v-col cols="12">
                <div class="font-weight-bold">{{ $t('t-availability') }}</div>
                <v-checkbox v-model="enabled" density="compact" color="primary" class="d-inline-flex">
                  <template #label>
                    <span>{{ $t('t-is-enabled') }}</span>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>
          </v-window-item>
          <v-window-item value="integration" eager>
            <v-row class="mx-0">
              <v-col cols="12">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-cost-center-account') }}
                </div>
                <TextField v-model="costCenterAccount" :placeholder="$t('t-enter-cost-center-account')"
                  :rules="applyServerErrorsToRules('costCenterAccount', costCenterAccountRules)"
                  :disabled="!canEditPaymentOrderData"
                  :error-messages="getServerErrors('costCenterAccount')" />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t('t-saving') : $t('t-save') }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-form>
  </v-dialog>
</template>

<style scoped>
.department-window {
  overflow: visible;
}

.department-window :deep(.v-window__container) {
  overflow: visible;
}
</style>
