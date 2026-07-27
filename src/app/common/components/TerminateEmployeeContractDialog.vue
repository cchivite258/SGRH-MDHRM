<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import MenuDatePicker from "@/app/common/components/MenuDatePicker.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { reasonService } from "@/app/http/httpServiceProvider";
import type { ReasonListing } from "@/components/baseTables/reason/types";


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
  (e: "onConfirm", payload: { terminationDate: string; reasonId: string | number }): void;
  (e: "clear-server-error", field: string): void;
}>();

const { t } = useI18n();
const toast = useToast();
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const terminationDatePicker = ref<{ validate: () => boolean } | null>(null);

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const terminationForm = ref({
  terminationDate: getTodayInputValue(),
  reasonId: "" as string | number
});
const reasons = ref<ReasonListing[]>([]);
const reasonsLoading = ref(false);
const step = ref<"confirm" | "form">("confirm");

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

const openFormStep = () => {
  step.value = "form";
  terminationForm.value = {
    terminationDate: getTodayInputValue(),
    reasonId: ""
  };
  fetchReasons();
};

const reasonOptions = computed(() =>
  reasons.value
    .filter(reason => reason.enabled)
    .map(reason => ({
      label: reason.name,
      value: reason.id
    }))
);

const reasonRules = [
  (value: string | number | null) => !!value || t("t-please-select-reason")
];

const terminationDateRules = [
  (value: Date | string | null) => !!value || t("t-please-enter-termination-date")
];

const fetchReasons = async () => {
  reasonsLoading.value = true;
  try {
    const { content } = await reasonService.getReasonsByType("EMPLOYEE_TERMINATION");
    reasons.value = content;
  } catch (error) {
    reasons.value = [];
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    reasonsLoading.value = false;
  }
};

const confirm = async () => {
  const formResult = await form.value?.validate();
  const isTerminationDateValid = terminationDatePicker.value?.validate?.() ?? true;

  if (!formResult?.valid || !isTerminationDateValid || !terminationForm.value.terminationDate || !terminationForm.value.reasonId) return;

  emit("onConfirm", {
    terminationDate: String(terminationForm.value.terminationDate).split("T")[0],
    reasonId: terminationForm.value.reasonId
  });
};

watch(dialogValue, (isOpen) => {
  if (isOpen) {
    step.value = "confirm";
    terminationForm.value = {
      terminationDate: getTodayInputValue(),
      reasonId: ""
    };
  }
});

watch(() => terminationForm.value.terminationDate, () => {
  emit("clear-server-error", "terminationDate");
});
watch(() => terminationForm.value.reasonId, () => emit("clear-server-error", "reasonId"));
</script>

<template>
  <v-dialog v-model="dialogValue" :width="step === 'confirm' ? 500 : 700" persistent :retain-focus="false">
    <v-card v-if="step === 'confirm'">
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        :disabled="loading"
        @click="closeDialog"
      />

      <v-card-text class="text-center px-7 pt-8 pb-4">
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
      </v-card-text>

      <v-card-actions class="d-flex justify-center pt-1 pb-6">
        <v-btn class="me-2" flat variant="tonal" :disabled="loading" @click="closeDialog">
          {{ $t("t-close") }}
        </v-btn>
        <v-btn color="danger" flat variant="elevated" :loading="loading" :disabled="loading" @click="openFormStep">
          {{ $t("t-yes-terminate-contract") }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-form v-else ref="form" @submit.prevent="confirm">
      <Card :title="$t('t-termination-data')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" :disabled="loading" @click="closeDialog" />
        </template>

        <v-divider />

        <v-card-text class="overflow-y-auto" style="max-height: 70vh">
          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-termination-date") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              
              <MenuDatePicker
                ref="terminationDatePicker"
                v-model="terminationForm.terminationDate"
                :placeholder="$t('t-enter-termination-date')"
                :rules="applyServerErrorsToRules('terminationDate', terminationDateRules)"
                :error-messages="getServerErrors('terminationDate')"
                :disabled="loading"
              />
            </v-col>

            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-reason") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="terminationForm.reasonId"
                :items="reasonOptions"
                :placeholder="$t('t-select-reason')"
                :rules="applyServerErrorsToRules('reasonId', reasonRules)"
                :disabled="loading || reasonsLoading"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn type="button" color="danger" class="me-1" :disabled="loading" @click="closeDialog">
              <i class="ph-x me-1" /> {{ $t("t-close") }}
            </v-btn>
            <v-btn color="danger" variant="elevated" :loading="loading" :disabled="loading" @click="confirm">
              {{ $t("t-submit-termination") }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
