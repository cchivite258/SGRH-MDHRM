<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import type {
  PeriodConfigForm,
  PeriodConfigType,
  PeriodMonthReference,
} from "@/components/settings/periodConfig/types";
import {
  periodConfigTypeOptions,
  periodMonthReferenceOptions,
} from "@/components/settings/periodConfig/listView/utils";

const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);
const toast = useToast();
const { t } = useI18n();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<PeriodConfigForm>,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

const isCreate = computed(() => prop.data.id === "-1" || !prop.data.id);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const id = ref(prop.data.id || "");
const type = ref<PeriodConfigType>(prop.data.type || "PAYMENT_ORDER");
const description = ref(prop.data.description || "");
const startDayOfMonth = ref<number | null>(prop.data.startDayOfMonth ?? 1);
const startMonthReference = ref<PeriodMonthReference>(prop.data.startMonthReference || "CURRENT");
const endDayOfMonth = ref<number | null>(prop.data.endDayOfMonth ?? null);
const endMonthReference = ref<PeriodMonthReference>(prop.data.endMonthReference || "CURRENT");
const endDayLastDayOfMonth = ref(Boolean(prop.data.endDayLastDayOfMonth));
const errorMessage = computed(() => prop.error);

const periodConfigTypeSelectOptions = computed(() =>
  periodConfigTypeOptions.map(option => ({
    ...option,
    label: t(option.label),
  }))
);

const monthReferenceSelectOptions = computed(() =>
  periodMonthReferenceOptions.map(option => ({
    ...option,
    label: t(option.label),
  }))
);

const dayRules = (requiredMessage: string) => [
  (v: number | string | null) => (v !== null && v !== "") || requiredMessage,
  (v: number | string | null) => {
    const value = Number(v);
    return (Number.isInteger(value) && value >= 1 && value <= 28) || t("t-day-of-month-range");
  },
];

const requiredRules = {
  type: [(v: string) => !!v || t("t-please-select-period-config-type")],
  startDayOfMonth: dayRules(t("t-please-enter-start-day-of-month")),
  startMonthReference: [(v: string) => !!v || t("t-please-select-month-reference")],
  endDayOfMonth: dayRules(t("t-please-enter-end-day-of-month")),
  endMonthReference: [(v: string) => !!v || t("t-please-select-month-reference")],
};

const monthOrder: Record<PeriodMonthReference, number> = {
  PREVIOUS: 0,
  CURRENT: 1,
};

const periodOrderError = computed(() => {
  if (!startMonthReference.value || !endMonthReference.value) return "";

  if (monthOrder[endMonthReference.value] < monthOrder[startMonthReference.value]) {
    return t("t-period-end-before-start");
  }

  if (
    monthOrder[endMonthReference.value] === monthOrder[startMonthReference.value]
    && !endDayLastDayOfMonth.value
    && endDayOfMonth.value != null
    && startDayOfMonth.value != null
    && Number(endDayOfMonth.value) < Number(startDayOfMonth.value)
  ) {
    return t("t-period-end-before-start");
  }

  return "";
});

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid || periodOrderError.value) {
    toast.error(periodOrderError.value || t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data: PeriodConfigForm = {
    ...(!isCreate.value && { id: id.value }),
    type: type.value,
    description: description.value,
    startDayOfMonth: Number(startDayOfMonth.value),
    startMonthReference: startMonthReference.value,
    endDayOfMonth: endDayLastDayOfMonth.value ? null : Number(endDayOfMonth.value),
    endMonthReference: endMonthReference.value,
    endDayLastDayOfMonth: endDayLastDayOfMonth.value,
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    type: "trimToEmpty",
    description: "trimToEmpty",
    startMonthReference: "trimToEmpty",
    endMonthReference: "trimToEmpty",
  });

  emit("onSubmit", data, {
    onSuccess: () => {
      dialogValue.value = false;
    },
    onFinally: () => {
      localLoading.value = false;
    },
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="720" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card
        :title="isCreate ? $t('t-add-period-config') : $t('t-edit-period-config')"
        title-class="py-0"
        style="overflow: hidden"
      >
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="period-config-form overflow-y-auto" style="max-height: 70vh">
          <p class="period-config-form__hint mb-4">
            {{ $t("t-period-config-hint") }}
          </p>

          <v-alert
            v-if="errorMessage || periodOrderError"
            :text="errorMessage || periodOrderError"
            type="error"
            class="mb-4"
            variant="tonal"
            color="danger"
            density="compact"
          />

          <v-row class="period-config-form__row">
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-type") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="type"
                :items="periodConfigTypeSelectOptions"
                :placeholder="$t('t-select-period-config-type')"
                :rules="requiredRules.type"
              />
            </v-col>

            <v-col cols="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-start-day-of-month") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model.number="startDayOfMonth"
                type="number"
                min="1"
                max="28"
                :placeholder="$t('t-enter-start-day-of-month')"
                :rules="requiredRules.startDayOfMonth"
              />
            </v-col>

            <v-col cols="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-start-month-reference") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="startMonthReference"
                :items="monthReferenceSelectOptions"
                :placeholder="$t('t-select-month-reference')"
                :rules="requiredRules.startMonthReference"
              />
            </v-col>

            <v-col v-if="!endDayLastDayOfMonth" cols="4" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-end-day-of-month") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model.number="endDayOfMonth"
                type="number"
                min="1"
                max="28"
                :placeholder="$t('t-enter-end-day-of-month')"
                :rules="requiredRules.endDayOfMonth"
              />
            </v-col>

            <v-col :cols="endDayLastDayOfMonth ? 6 : 4" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-end-month-reference") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="endMonthReference"
                :items="monthReferenceSelectOptions"
                :placeholder="$t('t-select-month-reference')"
                :rules="requiredRules.endMonthReference"
              />
            </v-col>

            <v-col :cols="endDayLastDayOfMonth ? 6 : 4" class="mt-n3 d-flex align-end">
              <v-checkbox
                v-model="endDayLastDayOfMonth"
                density="compact"
                color="primary"
                hide-details
                class="period-config-form__last-day"
              >
                <template #label>
                  <span>{{ $t("t-period-last-day-of-month") }}</span>
                </template>
              </v-checkbox>
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-description") }}
              </div>
              <TextArea
                v-model="description"
                :placeholder="$t('t-enter-description')"
                rows="2"
                density="compact"
                hide-details
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

<style scoped>
.period-config-form {
  padding-top: 16px;
  padding-bottom: 12px;
}

.period-config-form__hint {
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0;
}

.period-config-form__last-day {
  margin-bottom: 18px;
}

.period-config-form__row {
  margin: -6px;
}

.period-config-form__row > :deep(.v-col),
.period-config-form__row > [class*="v-col-"] {
  padding: 6px !important;
}

.period-config-form :deep(.v-input__details) {
  min-height: 18px;
  padding-top: 5px;
}

.period-config-form :deep(.v-messages) {
  min-height: 0;
}

.period-config-form :deep(.v-messages__message) {
  line-height: 1.25;
  margin-top: 2px !important;
}
</style>
