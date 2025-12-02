<script lang="ts" setup>
import { PropType, computed, ref, watch } from "vue";
import { CoveragePeriodInsertType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // No CreateEditCoveragePeriodDialog.vue
  data: {
    type: Object as PropType<CoveragePeriodInsertType | null>,
    required: false,
    default: () => ({
      id: undefined,
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      company: ""
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");

// Form fields
const id = ref("");
const name = ref("");
const startDate = ref(new Date());
const endDate = ref(new Date());
const company = ref("");
const enabled = ref(true);

// Watch for data changes
watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  name.value = newData.name || "";
  startDate.value = newData.startDate || new Date();
  endDate.value = newData.endDate || new Date();
  company.value = newData.company || "";
  enabled.value = newData.enabled;
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
    (v: string) => !!v || t('t-please-enter-name'),
  ],
  startDate: [
    (v: Date) => !!v || t('t-please-enter-start-date'),
  ],
  endDate: [
    (v: Date) => !!v || t('t-please-enter-end-date'),
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

  const payload: CoveragePeriodInsertType = {
    id: id.value || undefined,
    name: name.value,
    startDate: startDate.value,
    endDate: endDate.value,
    company: props.data?.company ?? "",
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
    <Card :title="isCreate ? $t('t-add-coverage-period') : $t('t-edit-coverage-period')" title-class="py-0">
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
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-start-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker v-model="startDate" :placeholder="$t('t-enter-start-date')" :rules="requiredRules.startDate" :teleport="true" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-end-date') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <ValidatedDatePicker v-model="endDate"  :placeholder="$t('t-enter-end-date')" :rules="requiredRules.endDate" :teleport="true" />
          </v-col>
        </v-row>
        <v-row class="">
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
