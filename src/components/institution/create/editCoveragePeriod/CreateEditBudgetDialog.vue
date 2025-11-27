<script lang="ts" setup>
import { PropType, computed, ref, watch } from "vue";
import { BudgetInsertType, CoveragePeriodListingType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { useCoveragePeriodStore } from '@/store/institution/coveragePeriodStore';
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";


const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);
const coveragePeriodStore = useCoveragePeriodStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // No CreateEditBudgetDialog.vue
  data: {
    type: Object as PropType<BudgetInsertType | null>,
    required: false,
    default: () => ({
      id: undefined,
      name: "",
      budgetAmount: 0,
      coveragePeriod: undefined,
      enabled: true,
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");

// Form fields
const id = ref("");
const name = ref("");
const budgetAmount = ref(0);
const coveragePeriod = ref<string | undefined>(undefined);
const enabled = ref(true);

// Watch for data changes
watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  name.value = newData.name || "";
  budgetAmount.value = newData.budgetAmount || 0;
  coveragePeriod.value = newData.coveragePeriod || undefined;
  enabled.value = newData.enabled;
}, { immediate: true });

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
    (v: string) => !!v || t('t-please-enter-name'),
  ],
  budgetAmount: [
    (v: number) => !!v || t('t-please-enter-budget-amount'),
  ],
  coveragePeriod: [
    (v: string) => !!v || t('t-please-enter-coverage-period'),
  ]
};

/**
 * Submete dados do formulário
 */

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

  const payload: BudgetInsertType = {
    id: id.value || undefined,
    name: name.value,
    budgetAmount: budgetAmount.value,
    coveragePeriod: coveragePeriod.value, 
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
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" :persistent="true"
  :click:outside="false">
    <v-form ref="form" @submit.prevent="onSubmit"> 
    <Card :title="isCreate ? $t('t-add-budget') : $t('t-edit-budget')" title-class="py-0">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
      <v-card-text >
        <v-row class="">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="name" :placeholder="$t('t-enter-name')" :rules="requiredRules.name" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-budget-amount') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model.number="budgetAmount" :placeholder="t('t-enter-budget-amount')"
                type="number" :rules="requiredRules.budgetAmount" class="mb-2" />
          </v-col>
        </v-row>
        <v-row class="mt-n9">
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
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t('t-saving') : $t('t-save') }}
          </v-btn>
        </div>
      </v-card-actions> 
    </Card>
  </v-form>
  </v-dialog>
</template>
