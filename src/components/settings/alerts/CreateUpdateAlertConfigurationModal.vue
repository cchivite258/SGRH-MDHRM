<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import type { AlertConfigurationForm, ScheduledJobRepeatUnit } from "@/components/settings/alerts/types";
import { alertTypeOptions } from "@/components/settings/alerts/listView/utils";

type EditableAlertConfiguration = AlertConfigurationForm & {
  cronExpression?: string | null;
};

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
    type: Object as PropType<AlertConfigurationForm>,
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

const parseStepValue = (segment?: string) => {
  if (!segment) return null;
  const match = segment.match(/^.+\/(\d+)$/);
  return match ? Number(match[1]) : null;
};

const getRepeatFromCronExpression = (cronExpression?: string | null): {
  repeatUnit: ScheduledJobRepeatUnit;
  repeatValue: number | null;
} => {
  const parts = (cronExpression || "").trim().split(/\s+/);

  if (parts.length < 6) {
    return {
      repeatUnit: "DAYS",
      repeatValue: null,
    };
  }

  const [, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const minuteStep = parseStepValue(minute);
  const hourStep = parseStepValue(hour);
  const dayStep = parseStepValue(dayOfMonth);
  const monthStep = parseStepValue(month);
  const weekStep = parseStepValue(dayOfWeek);

  if (minuteStep) return { repeatUnit: "MINUTES", repeatValue: minuteStep };
  if (hourStep) return { repeatUnit: "HOURS", repeatValue: hourStep };
  if (dayStep) return { repeatUnit: "DAYS", repeatValue: dayStep };
  if (weekStep) return { repeatUnit: "WEEKS", repeatValue: weekStep };
  if (monthStep) return { repeatUnit: "MONTHS", repeatValue: monthStep };

  return {
    repeatUnit: "DAYS",
    repeatValue: null,
  };
};

const cronRepeat = getRepeatFromCronExpression((prop.data as EditableAlertConfiguration).cronExpression);

const id = ref(prop.data.id || "");
const name = ref(prop.data.name || "");
const description = ref(prop.data.description || "");
const type = ref(prop.data.type || "SERVICE_PROVIDER_EXPIRING");
const repeatUnit = ref<ScheduledJobRepeatUnit>(prop.data.repeatUnit || cronRepeat.repeatUnit);
const repeatValue = ref<number | null>(prop.data.repeatValue ?? cronRepeat.repeatValue);
const maxRetryCount = ref<number | null>(prop.data.maxRetryCount ?? null);
const enabled = ref(prop.data.enabled ?? true);
const errorMessage = computed(() => prop.error);

const repeatUnitOptions = computed(() => [
  { label: t("t-repeat-unit-minutes"), value: "MINUTES" },
  { label: t("t-repeat-unit-hours"), value: "HOURS" },
  { label: t("t-repeat-unit-days"), value: "DAYS" },
  { label: t("t-repeat-unit-weeks"), value: "WEEKS" },
  { label: t("t-repeat-unit-months"), value: "MONTHS" },
]);

const alertTypeSelectOptions = computed(() =>
  alertTypeOptions.map(option => ({
    ...option,
    label: t(option.label),
  }))
);

const requiredRules = {
  name: [(v: string) => !!v?.trim() || t("t-please-enter-name")],
  type: [(v: string) => !!v || t("t-please-select-alert-type")],
  repeatUnit: [(v: string) => !!v || t("t-please-select-repeat-unit")],
  repeatValue: [
    (v: number | string | null) => v !== null && v !== "" || t("t-please-enter-repeat-value"),
    (v: number | string | null) => Number(v) > 0 || t("t-repeat-value-minimum"),
  ],
  maxRetryCount: [
    (v: number | string | null) => v !== null && v !== "" || t("t-please-enter-max-retry-count"),
    (v: number | string | null) => Number(v) >= 0 || t("t-max-retry-count-minimum"),
  ],
};

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data: AlertConfigurationForm = {
    ...(!isCreate.value && { id: id.value }),
    name: name.value,
    description: description.value,
    type: type.value,
    maxRetryCount: Number(maxRetryCount.value),
    enabled: enabled.value,
    repeatUnit: repeatUnit.value,
    repeatValue: Number(repeatValue.value),
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    name: "trimToEmpty",
    description: "trimToNull",
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
  <v-dialog v-model="dialogValue" width="560" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card
        :title="isCreate ? $t('t-add-alert') : $t('t-edit-alert')"
        title-class="py-0"
        style="overflow: hidden"
      >
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="alert-configuration-form overflow-y-auto" style="max-height: 70vh">
          <v-alert
            v-if="errorMessage"
            :text="errorMessage"
            type="error"
            class="mb-4"
            variant="tonal"
            color="danger"
            density="compact"
          />

          <v-row class="alert-configuration-form__row">
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-name") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="name" :placeholder="$t('t-enter-name')" :rules="requiredRules.name" />
            </v-col>

            <v-col cols="12" lg="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-type") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="type"
                :items="alertTypeSelectOptions"
                :placeholder="$t('t-select-alert-type')"
                :rules="requiredRules.type"
              />
            </v-col>

            <v-col cols="12" lg="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-repeat-unit") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="repeatUnit"
                :items="repeatUnitOptions"
                :placeholder="$t('t-select-repeat-unit')"
                :rules="requiredRules.repeatUnit"
              />
            </v-col>

            <v-col cols="12" lg="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-repeat-value") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model.number="repeatValue"
                type="number"
                min="1"
                :placeholder="$t('t-enter-repeat-value')"
                :rules="requiredRules.repeatValue"
              />
            </v-col>

            <v-col cols="12" lg="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-max-retry-count") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model.number="maxRetryCount"
                type="number"
                min="0"
                :placeholder="$t('t-enter-max-retry-count')"
                :rules="requiredRules.maxRetryCount"
              />
            </v-col>

            <v-col cols="12"  class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-description") }}
              </div>
              <TextArea
                v-model="description"
                :placeholder="$t('t-enter-description')"
                density="compact"
                rows="3"
                hide-details
              />
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold">{{ $t("t-availability") }}</div>
              <v-checkbox v-model="enabled" density="compact" color="primary" hide-details class="d-inline-flex">
                <template #label>
                  <span>{{ $t("t-is-enabled") }}</span>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.alert-configuration-form {
  padding-top: 16px;
  padding-bottom: 12px;
}

.alert-configuration-form__row {
  margin: -6px;
}

.alert-configuration-form__row > :deep(.v-col),
.alert-configuration-form__row > [class*="v-col-"] {
  padding: 6px !important;
}

.alert-configuration-form :deep(.v-input__details) {
  min-height: 18px;
  padding-top: 5px;
}

.alert-configuration-form :deep(.v-messages) {
  min-height: 0;
}

.alert-configuration-form :deep(.v-messages__message) {
  line-height: 1.25;
  margin-top: 2px !important;
}

.alert-configuration-form :deep(.text-area-component .v-field__input) {
  min-height: 92px;
}
</style>
