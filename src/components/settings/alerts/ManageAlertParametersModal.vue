<script lang="ts" setup>
import { computed, nextTick, PropType, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { scheduledParameterService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import type {
  AlertConfigurationListing,
  ScheduledParameterForm,
  ScheduledParameterListing,
  ScheduledParameterType,
} from "@/components/settings/alerts/types";

const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();
const toast = useToast();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  alert: {
    type: Object as PropType<AlertConfigurationListing>,
    required: true,
  },
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const form = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation: () => void;
} | null>(null);
const parameters = ref<ScheduledParameterListing[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleteLoading = ref(false);
const deleteId = ref<number | string | null>(null);
const editingId = ref<number | string | null>(null);
const type = ref<ScheduledParameterType>("DAYS_BEFORE_EXPIRATION");
const value = ref("");

const isEditing = computed(() => editingId.value !== null);
const scheduledParameterTypes: ScheduledParameterType[] = [
  "DAYS_BEFORE_EXPIRATION",
  "WEEKS_BEFORE_EXPIRATION",
  "MONTHS_BEFORE_EXPIRATION",
  "YEARS_BEFORE_EXPIRATION",
];

const deleteDialog = computed({
  get() {
    return deleteId.value !== null;
  },
  set(dialog: boolean) {
    if (!dialog) {
      deleteId.value = null;
    }
  },
});

const parameterTypeOptions = computed(() => [
  { label: t("t-parameter-type-days-before-expiration"), value: "DAYS_BEFORE_EXPIRATION" },
  { label: t("t-parameter-type-weeks-before-expiration"), value: "WEEKS_BEFORE_EXPIRATION" },
  { label: t("t-parameter-type-months-before-expiration"), value: "MONTHS_BEFORE_EXPIRATION" },
  { label: t("t-parameter-type-years-before-expiration"), value: "YEARS_BEFORE_EXPIRATION" },
]);

const isScheduledParameterType = (parameterType: string): parameterType is ScheduledParameterType => {
  return scheduledParameterTypes.includes(parameterType as ScheduledParameterType);
};

const getJobParameters = (): ScheduledParameterListing[] => {
  return (prop.alert.parameters ?? [])
    .filter(parameter => isScheduledParameterType(parameter.type))
    .map((parameter): ScheduledParameterListing => ({
      id: parameter.id,
      scheduledJobId: parameter.scheduledJobId ?? prop.alert.id,
      type: parameter.type as ScheduledParameterType,
      value: parameter.value,
      removable: true,
      enabled: true,
    }));
};

const requiredRules = {
  type: [(v: string) => !!v || t("t-please-select-parameter-type")],
  value: [(v: string) => !!String(v ?? "").trim() || t("t-please-enter-parameter-value")],
};

const resetForm = async () => {
  editingId.value = null;
  type.value = "DAYS_BEFORE_EXPIRATION";
  value.value = "";
  await nextTick();
  form.value?.resetValidation();
};

const fetchParameters = async () => {
  loading.value = true;
  const jobParameters = getJobParameters();
  parameters.value = jobParameters;

  try {
    const { content } = await scheduledParameterService.getScheduledParameters(prop.alert.id);
    parameters.value = content.length ? content : jobParameters;
  } catch (error) {
    parameters.value = jobParameters;
    getApiErrorMessages(error, t("t-message-load-error")).forEach(message => toast.error(message));
  } finally {
    loading.value = false;
  }
};

watch(
  dialogValue,
  async dialog => {
    if (dialog) {
      await resetForm();
      fetchParameters();
    }
  },
  { immediate: true }
);

const getParameterTypeLabel = (parameterType: string) => {
  return parameterTypeOptions.value.find(option => option.value === parameterType)?.label ?? parameterType;
};

const onEditParameter = async (parameter: ScheduledParameterListing) => {
  editingId.value = parameter.id;
  type.value = parameter.type;
  value.value = parameter.value || "";
  await nextTick();
  form.value?.resetValidation();
};

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  saving.value = true;

  const data: ScheduledParameterForm = {
    ...(editingId.value !== null && { id: editingId.value }),
    scheduledJobId: prop.alert.id,
    type: type.value,
    value: value.value.trim(),
  };

  try {
    const response = editingId.value === null
      ? await scheduledParameterService.createScheduledParameter(data)
      : await scheduledParameterService.updateScheduledParameter(editingId.value, data);

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(editingId.value === null ? t("t-toast-message-created") : t("t-toast-message-update"));
    await resetForm();
    await fetchParameters();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
  } finally {
    saving.value = false;
  }
};

const onDeleteParameter = (parameter: ScheduledParameterListing) => {
  if (!parameter.removable) {
    toast.error(t("t-alert-parameter-not-removable"));
    return;
}

  deleteId.value = parameter.id;
};

const onConfirmDelete = async () => {
  if (deleteId.value === null) return;

  deleteLoading.value = true;

  try {
    await scheduledParameterService.deleteScheduledParameter(deleteId.value);
    toast.success(t("t-toast-message-deleted"));
    await fetchParameters();

    if (editingId.value === deleteId.value) {
      await resetForm();
    }
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
  } finally {
    deleteLoading.value = false;
    deleteId.value = null;
  }
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="720" scrollable>
    <Card :title="$t('t-define-alert-parameters')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="alert-parameters-dialog overflow-y-auto" style="max-height: 72vh">
        <div class="alert-parameters-dialog__alert-name mb-4">
          {{ alert.name }}
        </div>

        <v-form ref="form" @submit.prevent="onSubmit">
          <v-row class="alert-parameters-dialog__row">
            <v-col cols="12" md="5">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-parameter-type") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="type"
                :items="parameterTypeOptions"
                :placeholder="$t('t-select-parameter-type')"
                :rules="requiredRules.type"
              />
            </v-col>

            <v-col cols="12" md="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-parameter-value") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="value" :placeholder="$t('t-enter-parameter-value')" :rules="requiredRules.value" />
            </v-col>

            <v-col cols="12" md="3" class="alert-parameters-dialog__actions-col">
              <div class="font-weight-bold text-caption mb-1 alert-parameters-dialog__action-spacer" aria-hidden="true">
                &nbsp;
              </div>
              <div class="d-flex w-100 justify-start" style="gap: 8px">
                <v-btn v-if="isEditing" type="button" variant="tonal" color="secondary" @click="resetForm">
                  {{ $t("t-cancel") }}
                </v-btn>
                <v-btn type="submit" color="primary" variant="elevated" :loading="saving" :disabled="saving">
                  {{ isEditing ? $t("t-save") : $t("t-add") }}
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="my-4" />

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

        <v-table density="compact" class="alert-parameters-dialog__table">
          <thead>
            <tr>
              <th>{{ $t("t-parameter-type") }}</th>
              <th>{{ $t("t-parameter-value") }}</th>
              <th class="text-center">{{ $t("t-action") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="parameter in parameters" :key="parameter.id">
              <td>{{ getParameterTypeLabel(parameter.type) }}</td>
              <td>{{ parameter.value || "-" }}</td>
              <td class="text-center">
                <v-btn icon="ph-pencil-simple" variant="text" density="compact" @click="onEditParameter(parameter)" />
                <v-btn icon="ph-trash" variant="text" density="compact" color="danger" @click="onDeleteParameter(parameter)" />
              </td>
            </tr>
            <tr v-if="!loading && !parameters.length">
              <td colspan="3" class="text-center py-8">
                <v-avatar size="56" color="secondary" variant="tonal" class="mb-2">
                  <i class="ph-magnifying-glass" style="font-size: 24px" />
                </v-avatar>
                <div class="font-weight-bold">{{ $t("t-no-alert-parameters-found") }}</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>

    <RemoveItemConfirmationDialog
      v-if="deleteDialog"
      v-model="deleteDialog"
      :loading="deleteLoading"
      @onConfirm="onConfirmDelete"
    />
  </v-dialog>
</template>

<style scoped>
.alert-parameters-dialog {
  padding-top: 16px;
}

.alert-parameters-dialog__alert-name {
  color: #334155;
  font-size: 0.85rem;
  font-weight: 600;
}

.alert-parameters-dialog__row {
  margin: -6px;
}

.alert-parameters-dialog__row > :deep(.v-col),
.alert-parameters-dialog__row > [class*="v-col-"] {
  padding: 6px !important;
}

.alert-parameters-dialog__actions-col {
  display: block;
}

.alert-parameters-dialog__action-spacer {
  visibility: hidden;
}

.alert-parameters-dialog :deep(.v-input__details) {
  min-height: 18px;
  padding-top: 5px;
}

.alert-parameters-dialog__table {
  border: 1px solid #e8edf3;
  border-radius: 8px;
  overflow: hidden;
}

.alert-parameters-dialog__table :deep(th) {
  background: #f3f6fa;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 700;
}

.alert-parameters-dialog__table :deep(td) {
  color: #334155;
  font-size: 0.8rem;
}
</style>
