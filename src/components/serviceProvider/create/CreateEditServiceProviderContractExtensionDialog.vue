<script lang="ts" setup>
import { computed, nextTick, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import FileUploader from "@/app/common/components/FileUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import MenuDatePicker from "@/app/common/components/MenuDatePicker.vue";
import ConfirmCreateServiceProviderContractExtensionDialog from "@/components/serviceProvider/create/ConfirmCreateServiceProviderContractExtensionDialog.vue";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { reasonService, serviceProviderAttachmentService, serviceProviderContractExtensionService } from "@/app/http/httpServiceProvider";
import type { ReasonListing } from "@/components/baseTables/reason/types";
import type {
  ServiceProviderAttachmentType,
  ServiceProviderContractExtensionPayloadType,
  ServiceProviderContractExtensionType
} from "@/components/serviceProvider/types";

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object as PropType<ServiceProviderContractExtensionType | null>,
    default: null
  },
  serviceProviderId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null
  }
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "saved"): void;
}>();

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  }
});

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const contractEndDatePickerRef = ref<{ validate: () => boolean } | null>(null);
const formLoading = ref(false);
const reasonsLoading = ref(false);
const errorMsg = ref("");
const fileError = ref("");
const createConfirmationDialog = ref(false);
const extensionAttachmentLoading = ref(false);
const serverErrors = ref<Record<string, string[]>>({});
const contractExtensionReasons = ref<ReasonListing[]>([]);
const existingExtensionAttachment = ref<ServiceProviderAttachmentType | null>(null);
const extensionFile = ref<any[]>([]);
const extensionForm = ref<ServiceProviderContractExtensionPayloadType>({
  id: undefined,
  serviceProviderId: "",
  contractEndDate: new Date().toISOString().split("T")[0],
  reasonId: "",
  notes: ""
});

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const isCreate = computed(() => !extensionForm.value.id);
const contractExtensionReasonOptions = computed(() =>
  contractExtensionReasons.value
    .filter(reason => reason.enabled)
    .map(reason => ({
      label: reason.name,
      value: reason.id
    }))
);

const clearErrorLater = () => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
  }

  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

const setError = (message: string) => {
  errorMsg.value = message;
  clearErrorLater();
};

const getServerErrors = (field: string) => serverErrors.value[field] || [];
const displayedFileError = computed(() => fileError.value || getServerErrors("file")[0] || "");
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

const requiredRules = {
  contractEndDate: [
    (v: Date | string | null) => !!v || t("t-please-enter-contract-end-date")
  ],
  reasonId: [
    (v: string | number | null | undefined) => !!v || t("t-please-select-reason")
  ],
  notes: []
};

const resolveUploadedFile = (files: any[]) =>
  files.find((fileItem) => fileItem instanceof File)
  || files.find((fileItem) => fileItem?.file instanceof File)?.file
  || null;

const selectedExtensionFile = computed(() => resolveUploadedFile(extensionFile.value));
const hasExtensionDocument = computed(() => !!selectedExtensionFile.value || !!existingExtensionAttachment.value);

const getAttachmentFileName = (attachment: ServiceProviderAttachmentType) =>
  attachment.fileMetadata?.originalFilename
  || attachment.attachment?.originalFilename
  || attachment.originalFilename
  || attachment.name
  || attachment.fileMetadata?.name
  || "documento";

const getAttachmentFileSize = (attachment: ServiceProviderAttachmentType) =>
  Math.ceil(Number(
    attachment.fileMetadata?.fileSize
    || attachment.attachment?.fileSize
    || attachment.fileSize
    || attachment.size
    || attachment.fileMetadata?.size
    || 0
  ) / 1024);

const fetchContractExtensionReasons = async () => {
  reasonsLoading.value = true;
  try {
    const { content } = await reasonService.getReasonsByType("SERVICE_PROVIDER_CONTRACT_EXTENSION");
    contractExtensionReasons.value = content;
  } catch (error) {
    contractExtensionReasons.value = [];
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    reasonsLoading.value = false;
  }
};

const loadExistingExtensionAttachment = async (serviceProviderContractExtensionId: string | number) => {
  existingExtensionAttachment.value = null;
  extensionAttachmentLoading.value = true;

  try {
    const response = await serviceProviderAttachmentService.getAttachmentsByServiceProviderContractExtension(String(serviceProviderContractExtensionId));
    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-load-error")).forEach((message) => toast.error(message));
      return;
    }

    existingExtensionAttachment.value = response.data?.[0] || null;
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    extensionAttachmentLoading.value = false;
  }
};

const resetForm = () => {
  extensionForm.value = {
    id: undefined,
    serviceProviderId: props.serviceProviderId || "",
    contractEndDate: new Date().toISOString().split("T")[0],
    reasonId: "",
    notes: ""
  };
  extensionFile.value = [];
  existingExtensionAttachment.value = null;
  extensionAttachmentLoading.value = false;
  fileError.value = "";
  serverErrors.value = {};
  errorMsg.value = "";
};

const loadExtension = async () => {
  resetForm();

  if (!props.data?.id) return;

  try {
    formLoading.value = true;
    const response = await serviceProviderContractExtensionService.getById(props.data.id);
    const extension = response.data;

    extensionForm.value = {
      id: extension.id,
      serviceProviderId: extension.serviceProviderId || props.serviceProviderId || "",
      contractEndDate: extension.contractEndDate,
      reasonId: extension.reasonId || extension.reason?.id || "",
      notes: extension.notes || ""
    };
    await loadExistingExtensionAttachment(extension.id);
  } catch (error) {
    console.error("Erro ao carregar adenda:", error);
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    formLoading.value = false;
  }
};

const closeFormDialog = () => {
  dialogValue.value = false;
};

const saveExtension = async () => {
  if (!props.serviceProviderId) return;

  const serviceProviderId = props.serviceProviderId;

  try {
    formLoading.value = true;
    const payload: ServiceProviderContractExtensionPayloadType = {
      serviceProviderId,
      contractEndDate: extensionForm.value.contractEndDate,
      reasonId: extensionForm.value.reasonId,
      notes: String(extensionForm.value.notes || "").trim(),
      file: selectedExtensionFile.value || undefined
    };

    const response = extensionForm.value.id
      ? await serviceProviderContractExtensionService.update(extensionForm.value.id, payload)
      : await serviceProviderContractExtensionService.create(payload);

    if (response.status === "error") {
      createConfirmationDialog.value = false;
      serverErrors.value = getApiValidationErrors(response.error);
      getApiErrorMessages(response.error, t("t-message-save-error")).forEach((message) => toast.error(message));
      return;
    }

    toast.success(extensionForm.value.id ? t("t-contract-addendum-updated-success") : t("t-contract-addendum-created-success"));
    createConfirmationDialog.value = false;
    dialogValue.value = false;
    emit("saved");
  } catch (error) {
    createConfirmationDialog.value = false;
    console.error("Erro ao gravar adenda:", error);
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    formLoading.value = false;
  }
};

const onSubmit = async () => {
  if (!form.value || !props.serviceProviderId) return;
  serverErrors.value = {};

  const { valid } = await form.value.validate();
  const isContractEndDateValid = contractEndDatePickerRef.value?.validate() ?? true;

  if (!valid || !isContractEndDateValid || !hasExtensionDocument.value) {
    if (!hasExtensionDocument.value) {
      fileError.value = t("t-please-select-file");
    }
    toast.error(t("t-validation-error"));
    setError(t("t-please-correct-errors"));
    return;
  }

  if (isCreate.value) {
    createConfirmationDialog.value = true;
    return;
  }

  await saveExtension();
};

const onConfirmCreate = async () => {
  await saveExtension();
};

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

watch([dialogValue, () => props.data?.id], async ([isOpen]) => {
  if (!isOpen) return;
  await fetchContractExtensionReasons();
  await loadExtension();
});

watch(extensionFile, () => {
  fileError.value = "";
  const nextServerErrors = { ...serverErrors.value };
  delete nextServerErrors.file;
  serverErrors.value = nextServerErrors;
}, { deep: true });

watch(dialogValue, (isOpen) => {
  if (!isOpen) {
    createConfirmationDialog.value = false;
    resetForm();
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="620" :persistent="true" :retain-focus="false" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-contract-addendum') : $t('t-edit-contract-addendum')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closeFormDialog" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />

        <v-card-text class="overflow-y-auto" style="max-height: calc(90vh - 132px)">
          <v-row>
            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-contract-end-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuDatePicker
                ref="contractEndDatePickerRef"
                v-model="extensionForm.contractEndDate"
                :placeholder="$t('t-enter-contract-end-date')"
                :rules="applyServerErrorsToRules('contractEndDate', requiredRules.contractEndDate)"
                :error-messages="getServerErrors('contractEndDate')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-reason') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="extensionForm.reasonId"
                :items="contractExtensionReasonOptions"
                :placeholder="$t('t-select-reason')"
                :rules="applyServerErrorsToRules('reasonId', requiredRules.reasonId)"
                :disabled="formLoading || reasonsLoading"
              />
            </v-col>
            <v-col cols="12" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-notes') }}
              </div>
              <TextArea
                v-model="extensionForm.notes"
                :placeholder="$t('t-enter-notes')"
                :rules="applyServerErrorsToRules('notes', requiredRules.notes)"
                rows="3"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-document-file') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <FileUploader
                v-model="extensionFile"
                :multiple="false"
                :text="$t('t-upload-document-file')"
                :disabled="formLoading"
              />
              <div v-if="displayedFileError" class="service-provider-contract-extension__file-error">
                {{ displayedFileError }}
              </div>
              <v-progress-linear
                v-if="extensionAttachmentLoading && !selectedExtensionFile"
                indeterminate
                color="primary"
                class="mt-2"
              />
              <v-card
                v-else-if="existingExtensionAttachment && !selectedExtensionFile"
                class="border"
                elevation="0"
              >
                <v-card-text class="service-provider-contract-extension__existing-file">
                  <div class="service-provider-contract-extension__existing-file-info">
                    <span class="font-weight-bold">
                      {{ getAttachmentFileName(existingExtensionAttachment) }}
                    </span>
                    <span>{{ getAttachmentFileSize(existingExtensionAttachment) }} kb</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="closeFormDialog">
              <i class="ph-x me-1" /> {{ $t('t-close') }}
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="formLoading" :disabled="formLoading">
              {{ formLoading ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>

  <ConfirmCreateServiceProviderContractExtensionDialog
    v-model="createConfirmationDialog"
    :loading="formLoading"
    @onConfirm="onConfirmCreate"
  />
</template>

<style scoped>
.service-provider-contract-extension__file-error {
  color: #ff5252;
  font-size: 0.65rem;
  margin-left: 15px;
  margin-top: 4px;
}

.service-provider-contract-extension__existing-file {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.service-provider-contract-extension__existing-file-info {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
