<script lang="ts" setup>
import { computed, nextTick, PropType, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { integrationDefinitionService, integrationSourceCodeService } from "@/app/http/httpServiceProvider";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import { integrationUsageOptions } from "@/components/settings/integration/listView/utils";
import { integrationSourceCodeLabel } from "@/components/settings/integrationSourceCode/listView/utils";
import type { IntegrationSourceCodeId, IntegrationSourceCodeListing } from "@/components/settings/integrationSourceCode/types";
import type {
  IntegrationDefinitionId,
  IntegrationDefinitionListing,
  IntegrationDefinitionUsage,
  IntegrationUsageType,
} from "@/components/settings/integration/types";

const emit = defineEmits(["update:modelValue", "updated"]);
const { t } = useI18n();
const toast = useToast();
const { can } = usePermissions();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  definition: {
    type: Object as PropType<IntegrationDefinitionListing>,
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
const usages = ref<IntegrationDefinitionUsage[]>([]);
const sourceCodes = ref<IntegrationSourceCodeListing[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleteLoading = ref(false);
const deleteId = ref<IntegrationDefinitionId | null>(null);
const editingId = ref<IntegrationDefinitionId | null>(null);
const usage = ref<IntegrationUsageType | "">("PAYMENT_ORDERS");
const integrationSourceCodeId = ref<IntegrationSourceCodeId | "">("");

const isEditing = computed(() => editingId.value !== null);
const canCreate = computed(() => can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.CREATE));
const canUpdate = computed(() => can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.UPDATE));
const canDelete = computed(() => can(PERMISSIONS.SETTINGS.INTEGRATION_DEFINITION.DELETE));
const canManage = computed(() => canCreate.value || canUpdate.value || canDelete.value);
const showForm = computed(() => (isEditing.value ? canUpdate.value : canCreate.value));

const deleteDialog = computed({
  get() {
    return deleteId.value !== null;
  },
  set(dialog: boolean) {
    if (!dialog) deleteId.value = null;
  },
});

const usageOptions = computed(() => {
  const options = integrationUsageOptions.map(item => ({
    label: t(String(item.label)),
    value: item.value,
  }));

  if (usage.value && !options.some(item => item.value === usage.value)) {
    options.push({ label: usage.value, value: usage.value });
  }

  return options;
});

const sourceCodeOptions = computed(() => {
  const options = sourceCodes.value.map(code => ({
    label: integrationSourceCodeLabel(code),
    value: code.id,
  }));

  if (
    integrationSourceCodeId.value !== ""
    && !options.some(option => String(option.value) === String(integrationSourceCodeId.value))
  ) {
    options.push({
      label: String(integrationSourceCodeId.value),
      value: integrationSourceCodeId.value,
    });
  }

  return options;
});

const definitionLabel = computed(() => {
  const code = prop.definition.code?.trim();
  const name = prop.definition.name?.trim();
  if (code && name) return `${code} · ${name}`;
  return name || code || "";
});

const requiredRules = {
  usage: [(value: string) => !!value || t("t-please-select-contract-integration-usage")],
  integrationSourceCodeId: [
    (value: IntegrationSourceCodeId | "" | null) =>
      (value !== "" && value !== null && value !== undefined) || t("t-please-select-integration-source-code"),
  ],
};

const usageLabel = (value: string) => {
  const option = integrationUsageOptions.find(item => item.value === value);
  return option ? t(String(option.label)) : value;
};

const sourceCodeLabelFor = (id?: IntegrationSourceCodeId | null) => {
  if (id === null || id === undefined || id === "") return "-";
  const code = sourceCodes.value.find(item => String(item.id) === String(id));
  return code ? integrationSourceCodeLabel(code) : String(id);
};

const resetForm = async () => {
  editingId.value = null;
  usage.value = "PAYMENT_ORDERS";
  integrationSourceCodeId.value = "";
  await nextTick();
  form.value?.resetValidation();
};

const fetchSourceCodes = async () => {
  try {
    sourceCodes.value = await integrationSourceCodeService.getAvailableIntegrationSourceCodes();
  } catch (error) {
    sourceCodes.value = [];
    getApiErrorMessages(error, t("t-integration-source-codes-load-error")).forEach(message => toast.error(message));
  }
};

const fetchUsages = async () => {
  loading.value = true;
  usages.value = [...(prop.definition.usages ?? [])];

  try {
    usages.value = await integrationDefinitionService.getIntegrationDefinitionUsages(prop.definition.id);
    emit("updated", usages.value);
  } catch (error) {
    getApiErrorMessages(error, t("t-integration-usages-load-error")).forEach(message => toast.error(message));
  } finally {
    loading.value = false;
  }
};

watch(
  dialogValue,
  async dialog => {
    if (!dialog) return;
    await resetForm();
    fetchSourceCodes();
    fetchUsages();
  },
  { immediate: true }
);

const onEditUsage = async (item: IntegrationDefinitionUsage) => {
  if (!canUpdate.value) return;

  editingId.value = item.id;
  usage.value = item.usage;
  integrationSourceCodeId.value = item.integrationSourceCodeId ?? "";
  await nextTick();
  form.value?.resetValidation();
};

const onSubmit = async () => {
  if (!form.value || !showForm.value) return;

  const { valid } = await form.value.validate();
  if (!valid || !usage.value || integrationSourceCodeId.value === "") {
    toast.error(t("t-validation-error"));
    return;
  }

  saving.value = true;
  const sourceCodeId = integrationSourceCodeId.value;

  try {
    const response = editingId.value === null
      ? await integrationDefinitionService.createIntegrationDefinitionUsage(prop.definition.id, {
          usage: usage.value,
          integrationSourceCodeId: sourceCodeId,
        })
      : await integrationDefinitionService.updateIntegrationDefinitionUsage(
          prop.definition.id,
          editingId.value,
          { integrationSourceCodeId: sourceCodeId }
        );

    if (response.status === "error") {
      throw response.error;
    }

    toast.success(editingId.value === null ? t("t-toast-message-created") : t("t-toast-message-update"));
    await resetForm();
    await fetchUsages();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
  } finally {
    saving.value = false;
  }
};

const onDeleteUsage = (item: IntegrationDefinitionUsage) => {
  if (!canDelete.value || item.removable === false) return;
  deleteId.value = item.id;
};

const onConfirmDelete = async () => {
  if (deleteId.value === null) return;

  deleteLoading.value = true;
  const removedId = deleteId.value;

  try {
    await integrationDefinitionService.deleteIntegrationDefinitionUsage(prop.definition.id, removedId);
    toast.success(t("t-toast-message-deleted"));

    if (editingId.value === removedId) {
      await resetForm();
    }

    await fetchUsages();
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach(message => toast.error(message));
  } finally {
    deleteLoading.value = false;
    deleteId.value = null;
  }
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="860" scrollable>
    <Card :title="$t('t-manage-integration-usages')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="integration-usages-dialog overflow-y-auto" style="max-height: 72vh">
        <div v-if="definitionLabel" class="integration-usages-dialog__name mb-1">
          {{ definitionLabel }}
        </div>
        <p class="integration-usages-dialog__hint mb-4">
          {{ $t("t-integration-usages-hint") }}
        </p>

        <v-form v-if="showForm" ref="form" @submit.prevent="onSubmit">
          <v-row class="integration-usages-dialog__row">
            <v-col cols="12" md="5">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-integration-usage") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="usage"
                :items="usageOptions"
                :disabled="isEditing"
                :placeholder="$t('t-select-contract-integration-usage')"
                :rules="requiredRules.usage"
              />
              <div v-if="isEditing" class="integration-usages-dialog__note">
                {{ $t("t-integration-usage-cannot-change") }}
              </div>
            </v-col>

            <v-col cols="12" md="5">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-integration-source-code") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="integrationSourceCodeId"
                :items="sourceCodeOptions"
                :placeholder="$t('t-select-integration-source-code')"
                :rules="requiredRules.integrationSourceCodeId"
              />
            </v-col>

            <v-col cols="12" md="2" class="integration-usages-dialog__actions-col">
              <div class="font-weight-bold text-caption mb-1 integration-usages-dialog__action-spacer" aria-hidden="true">
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

        <v-divider v-if="showForm" class="my-4" />

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

        <v-table density="compact" class="integration-usages-dialog__table">
          <thead>
            <tr>
              <th>{{ $t("t-contract-integration-usage") }}</th>
              <th>{{ $t("t-integration-source-code") }}</th>
              <th v-if="canManage" class="text-center">{{ $t("t-action") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in usages" :key="item.id">
              <td>{{ usageLabel(item.usage) }}</td>
              <td>{{ sourceCodeLabelFor(item.integrationSourceCodeId) }}</td>
              <td v-if="canManage" class="text-center">
                <v-btn
                  v-if="canUpdate"
                  icon="ph-pencil-simple"
                  variant="text"
                  density="compact"
                  @click="onEditUsage(item)"
                />
                <v-btn
                  v-if="canDelete && item.removable !== false"
                  icon="ph-trash"
                  variant="text"
                  density="compact"
                  color="danger"
                  @click="onDeleteUsage(item)"
                />
              </td>
            </tr>
            <tr v-if="!loading && !usages.length">
              <td :colspan="canManage ? 3 : 2" class="text-center py-8">
                <v-avatar size="56" color="secondary" variant="tonal" class="mb-2">
                  <i class="ph-magnifying-glass" style="font-size: 24px" />
                </v-avatar>
                <div class="font-weight-bold">{{ $t("t-integration-usages-empty") }}</div>
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
.integration-usages-dialog {
  padding-top: 16px;
}

.integration-usages-dialog__name {
  color: #334155;
  font-size: 0.85rem;
  font-weight: 600;
}

.integration-usages-dialog__hint,
.integration-usages-dialog__note {
  color: #64748b;
  font-size: 0.8rem;
  margin-bottom: 0;
}

.integration-usages-dialog__note {
  margin-top: 4px;
}

.integration-usages-dialog__row {
  margin: -6px;
}

.integration-usages-dialog__row > :deep(.v-col),
.integration-usages-dialog__row > [class*="v-col-"] {
  padding: 6px !important;
}

.integration-usages-dialog__actions-col {
  display: block;
}

.integration-usages-dialog__action-spacer {
  visibility: hidden;
}

.integration-usages-dialog :deep(.v-input__details) {
  min-height: 18px;
  padding-top: 5px;
}

.integration-usages-dialog__table {
  border: 1px solid #e8edf3;
  border-radius: 8px;
  overflow: hidden;
}

.integration-usages-dialog__table :deep(th) {
  background: #f3f6fa;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 700;
}

.integration-usages-dialog__table :deep(td) {
  color: #334155;
  font-size: 0.8rem;
}
</style>
