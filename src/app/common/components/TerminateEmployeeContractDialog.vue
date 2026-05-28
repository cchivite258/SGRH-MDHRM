<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { formateDate } from "@/app/common/dateFormate";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  loading?: boolean;
  serverErrors?: Record<string, string[]>;
  width?: number;
}>(), {
  loading: false,
  serverErrors: () => ({}),
  width: 550
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "onConfirm", terminationDate: string): void;
  (e: "clear-server-error", field: string): void;
}>();

const { t } = useI18n();
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const terminationDate = ref<string | null>(formateDate(new Date(), "yyyy-mm-dd"));
const terminationDateMenu = ref(false);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
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

const closeDialog = () => {
  dialogValue.value = false;
};

const dateFromValue = (value: string | null) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return isNaN(date.getTime()) ? null : date;
};

const pickerDate = computed(() => dateFromValue(terminationDate.value) || new Date());

const formattedTerminationDate = computed(() => {
  const date = dateFromValue(terminationDate.value);
  return date ? formateDate(date, "dd/MM/yyyy") : "";
});

const terminationDateRules = [
  () => !!terminationDate.value || t("t-please-enter-termination-date"),
  () => {
    if (!terminationDate.value) return true;
    return !!dateFromValue(terminationDate.value) || t("t-invalid-date");
  }
];

const selectTerminationDate = (value: Date | string | Date[] | string[] | null) => {
  const selectedValue = Array.isArray(value) ? value[0] : value;
  if (!selectedValue) return;

  terminationDate.value = formateDate(selectedValue, "yyyy-mm-dd");
  terminationDateMenu.value = false;
};

const clearTerminationDate = () => {
  terminationDate.value = null;
};

const confirm = async () => {
  const formResult = await form.value?.validate();
  if (!formResult?.valid || !terminationDate.value) return;

  emit("onConfirm", formateDate(terminationDate.value, "yyyy-mm-dd"));
};

watch(dialogValue, (isOpen) => {
  if (isOpen && !terminationDate.value) {
    terminationDate.value = formateDate(new Date(), "yyyy-mm-dd");
  }
});

watch(terminationDate, () => emit("clear-server-error", "terminationDate"));
</script>

<template>
  <v-dialog v-model="dialogValue" :width="width" persistent :retain-focus="false">
    <v-card>
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        :disabled="loading"
        @click="closeDialog"
      />

      <v-card-text class="px-8 px-md-10 pt-7 pb-0">
        <div class="text-center">
          <div class="text-danger">
            <i class="ph ph-user-minus ph-3x" />
          </div>
          <div class="mt-3">
            <h4 class="text-h6 font-weight-bold">
              {{ $t("t-dialog-title-confirm-terminate-contract") }}
            </h4>
            <p class="text-muted mx-4 mb-0 text-subtitle-1">
              {{ $t("t-dialog-text-confirm-terminate-contract") }}
            </p>
          </div>
        </div>

        <v-form ref="form" class="mt-4" @submit.prevent="confirm">
          <div class="font-weight-bold mb-2">
            {{ $t("t-termination-date") }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <v-menu
            v-model="terminationDateMenu"
            :close-on-content-click="false"
            location="bottom center"
            :offset="8"
          >
            <template #activator="{ props: menuProps }">
              <v-text-field
                v-bind="menuProps"
                :model-value="formattedTerminationDate"
                :placeholder="$t('t-enter-termination-date')"
                :rules="applyServerErrorsToRules('terminationDate', terminationDateRules)"
                :error-messages="getServerErrors('terminationDate')"
                variant="solo"
                density="compact"
                class="text-field-component termination-date-field"
                prepend-inner-icon="ph-calendar"
                append-inner-icon="ph-x"
                readonly
                @click:append-inner.stop="clearTerminationDate"
              />
            </template>

            <v-date-picker
              :model-value="pickerDate"
              color="primary"
              hide-header
              width="360"
              @update:model-value="selectTerminationDate"
            />
          </v-menu>
        </v-form>
      </v-card-text>

      <v-card-actions class="d-flex justify-center mt-3 mb-6">
        <v-btn class="me-2" flat variant="tonal" :disabled="loading" @click="closeDialog">
          {{ $t("t-close") }}
        </v-btn>
        <v-btn
          color="danger"
          flat
          variant="elevated"
          :loading="loading"
          :disabled="loading"
          @click="confirm"
        >
          {{ $t("t-yes-terminate-contract") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.termination-date-field :deep(.v-messages__message) {
  color: #ff5252;
}

.termination-date-field :deep(.v-field--error .v-icon),
.termination-date-field :deep(.v-field--error .v-field__prepend-inner),
.termination-date-field :deep(.v-field--error .v-field__append-inner) {
  color: #ff5252 !important;
  opacity: 1;
}
</style>
