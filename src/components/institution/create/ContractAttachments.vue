<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import FileUploader from "@/app/common/components/FileUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { contractAttachmentService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import type {
  ContractAttachmentType,
  ContractAttachmentUploadType,
  ContractDocumentType
} from "@/components/institution/types";
import { contractDocumentTypeOptions } from "@/components/institution/create/utils";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

type AttachmentUploadRow = {
  id: string;
  contractDocumentType: ContractDocumentType | "";
  files: any[];
};

const props = defineProps({
  contractId: {
    type: String,
    default: ""
  }
});

const { t } = useI18n();
const toast = useToast();
const { can, canAny } = usePermissions();

const loading = ref(false);
const uploadLoading = ref(false);
const errorMsg = ref("");
const attachmentUploads = ref<AttachmentUploadRow[]>([]);
const currentAttachments = ref<ContractAttachmentType[]>([]);
const attachmentActionLoadingId = ref<string | null>(null);
const downloadAttachmentLoadingId = ref<string | null>(null);
const deleteAttachmentDialog = ref(false);
const attachmentToDelete = ref<ContractAttachmentType | null>(null);
const canConsultContractAttachments = computed(() => canAny([
  PERMISSIONS.CONTRACT_ATTACHMENTS.READ,
  PERMISSIONS.CONTRACT_ATTACHMENTS.CREATE,
  PERMISSIONS.CONTRACT_ATTACHMENTS.DELETE,
]));
const canAttachContractDocuments = computed(() => can(PERMISSIONS.CONTRACT_ATTACHMENTS.CREATE));
const canDeleteContractDocuments = computed(() => can(PERMISSIONS.CONTRACT_ATTACHMENTS.DELETE));

const createAttachmentUploadRow = (): AttachmentUploadRow => ({
  id: uuidv4(),
  contractDocumentType: "",
  files: []
});

const resolveUploadedFile = (files: any[]) =>
  files.find((fileItem) => fileItem instanceof File)
  || files.find((fileItem) => fileItem?.file instanceof File)?.file
  || null;

const normalizedPendingUploads = computed<ContractAttachmentUploadType[]>(() =>
  attachmentUploads.value
    .map((item) => ({
      contractDocumentType: item.contractDocumentType,
      file: resolveUploadedFile(item.files)
    }))
    .filter((item) => item.contractDocumentType || item.file)
);

const pendingUploadsValidationMessage = computed(() => {
  const hasIncompleteRow = attachmentUploads.value.some((item) => {
    const selectedFile = resolveUploadedFile(item.files);
    return (!!item.contractDocumentType && !selectedFile) || (!item.contractDocumentType && !!selectedFile);
  });

  if (hasIncompleteRow) {
    return t("t-complete-document-row");
  }

  return "";
});

const getAttachmentId = (attachment: ContractAttachmentType) =>
  String((attachment as any).contractAttachmentId || attachment.id || "");

const getDocumentTypeLabel = (value: string | null | undefined) => {
  const option = contractDocumentTypeOptions.find((item) => item.value === value);
  return option?.label || value || "-";
};

const getAttachmentFileName = (attachment: ContractAttachmentType) =>
  attachment.attachment?.originalFilename
  || attachment.originalFilename
  || attachment.fileMetadata?.originalFilename
  || attachment.name
  || attachment.fileMetadata?.name
  || "contract-document";

const getAttachmentFileSize = (attachment: ContractAttachmentType) =>
  Math.ceil(Number(
    attachment.attachment?.fileSize
    || attachment.fileSize
    || attachment.fileMetadata?.fileSize
    || attachment.size
    || attachment.fileMetadata?.size
    || 0
  ) / 1024);

const getAttachmentExtension = (attachment: ContractAttachmentType) =>
  attachment.attachment?.extension || attachment.extension || attachment.fileMetadata?.extension || "";

const refreshContractAttachments = async () => {
  if (!props.contractId || !canConsultContractAttachments.value) return;

  loading.value = true;
  try {
    const response = await contractAttachmentService.getAttachmentsByContract(props.contractId);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-load-error")).forEach((message) => toast.error(message));
      return;
    }

    currentAttachments.value = response.data || [];
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    loading.value = false;
  }
};

watch(
  [() => props.contractId, canConsultContractAttachments],
  async ([contractId, canConsult]) => {
    attachmentUploads.value = [];
    currentAttachments.value = [];
    errorMsg.value = "";

    if (!contractId || !canConsult) return;
    await refreshContractAttachments();
  },
  { immediate: true }
);

const addAttachmentUploadRow = () => {
  if (!canAttachContractDocuments.value) return;
  attachmentUploads.value = [...attachmentUploads.value, createAttachmentUploadRow()];
};

const removeAttachmentUploadRow = (rowId: string) => {
  attachmentUploads.value = attachmentUploads.value.filter((item) => item.id !== rowId);
};

const onAttachDocuments = async () => {
  if (!canAttachContractDocuments.value) return;

  const pendingUploads = normalizedPendingUploads.value;
  if (pendingUploads.length === 0) {
    toast.error(t("t-add-at-least-one-document"));
    return;
  }

  if (pendingUploadsValidationMessage.value) {
    toast.error(pendingUploadsValidationMessage.value);
    errorMsg.value = pendingUploadsValidationMessage.value;
    return;
  }

  uploadLoading.value = true;
  try {
    for (const attachmentUpload of pendingUploads) {
      if (!attachmentUpload.file || !attachmentUpload.contractDocumentType) continue;

      const response = await contractAttachmentService.uploadAttachment(
        props.contractId,
        attachmentUpload.file,
        attachmentUpload.contractDocumentType
      );

      if (response.status === "error") {
        const messages = getApiErrorMessages(response.error, t("t-message-save-error"));
        messages.forEach((message) => toast.error(message));
        errorMsg.value = messages[0] || t("t-message-save-error");
        return;
      }
    }

    attachmentUploads.value = [];
    errorMsg.value = "";
    await refreshContractAttachments();
    toast.success(t("t-documents-attached-success"));
  } catch (error) {
    const messages = getApiErrorMessages(error, t("t-message-save-error"));
    messages.forEach((message) => toast.error(message));
    errorMsg.value = messages[0] || t("t-message-save-error");
  } finally {
    uploadLoading.value = false;
  }
};

const onDownloadAttachment = async (attachment: ContractAttachmentType) => {
  if (!canConsultContractAttachments.value) return;

  const attachmentId = getAttachmentId(attachment);
  const fileName = getAttachmentFileName(attachment);
  const extension = getAttachmentExtension(attachment);

  downloadAttachmentLoadingId.value = attachmentId;
  try {
    const response = await contractAttachmentService.downloadAttachment(attachmentId, fileName, extension);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-download-error")).forEach((message) => toast.error(message));
    }
  } catch (error) {
    getApiErrorMessages(error, t("t-message-download-error")).forEach((message) => toast.error(message));
  } finally {
    downloadAttachmentLoadingId.value = null;
  }
};

const onDeleteAttachment = (attachment: ContractAttachmentType) => {
  if (!canDeleteContractDocuments.value) return;

  attachmentToDelete.value = attachment;
  deleteAttachmentDialog.value = true;
};

const onConfirmDeleteAttachment = async () => {
  if (!attachmentToDelete.value) return;

  const attachmentId = getAttachmentId(attachmentToDelete.value);
  attachmentActionLoadingId.value = attachmentId;

  try {
    const response = await contractAttachmentService.deleteAttachment(attachmentId);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-toast-message-deleted-erros")).forEach((message) => toast.error(message));
      return;
    }

    currentAttachments.value = currentAttachments.value.filter((item) => getAttachmentId(item) !== attachmentId);
    toast.success(t("t-toast-message-deleted"));
    await refreshContractAttachments();
  } catch (error) {
    getApiErrorMessages(error, t("t-toast-message-deleted-erros")).forEach((message) => toast.error(message));
  } finally {
    attachmentActionLoadingId.value = null;
    deleteAttachmentDialog.value = false;
    attachmentToDelete.value = null;
  }
};
</script>

<template>
  <Card v-if="canConsultContractAttachments" title="Documentos do Contrato" elevation="0" title-class="pb-0">
    <v-card-text class="pt-0">
      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mb-3" density="compact" />

      <div class="d-flex align-center justify-space-between mb-3">
        <div class="font-weight-bold text-caption">
          {{ $t('t-document-file') }}
        </div>
        <div v-if="canAttachContractDocuments" class="d-flex ga-2">
          <v-btn
            v-if="attachmentUploads.length > 0"
            color="secondary"
            size="small"
            variant="outlined"
            :loading="uploadLoading"
            :disabled="uploadLoading || loading"
            @click="onAttachDocuments"
          >
            {{ uploadLoading ? $t('t-saving') : $t('t-attach') }}
          </v-btn>
          <v-btn
            color="secondary"
            size="small"
            variant="elevated"
            :disabled="uploadLoading || loading"
            @click="addAttachmentUploadRow"
          >
            <i class="ph-plus me-1" /> {{ $t('t-add-document') }}
          </v-btn>
        </div>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

      <v-alert
        v-if="!loading && currentAttachments.length === 0 && attachmentUploads.length === 0"
        variant="tonal"
        color="info"
        density="compact"
      >
        Nenhum documento anexado.
      </v-alert>

      <v-card v-for="attachment in currentAttachments" :key="getAttachmentId(attachment)" class="border mb-3" elevation="0">
        <v-card-text class="d-flex align-center justify-space-between">
          <div class="d-flex flex-column">
            <span class="font-weight-bold">
              {{ getAttachmentFileName(attachment) }}
            </span>
            <span class="text-caption">
              {{ getDocumentTypeLabel(attachment.contractDocumentType) }}
            </span>
            <span>
              {{ getAttachmentFileSize(attachment) }} kb
            </span>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              v-if="canConsultContractAttachments"
              color="black"
              variant="elevated"
              size="small"
              :loading="downloadAttachmentLoadingId === getAttachmentId(attachment)"
              :disabled="downloadAttachmentLoadingId === getAttachmentId(attachment) || attachmentActionLoadingId === getAttachmentId(attachment)"
              @click="onDownloadAttachment(attachment)"
            >
              <i class="ph-download-simple me-1" /> {{ $t('t-download-attachment') }}
            </v-btn>
            <v-btn
              v-if="canDeleteContractDocuments"
              color="danger"
              variant="elevated"
              size="small"
              :loading="attachmentActionLoadingId === getAttachmentId(attachment)"
              :disabled="attachmentActionLoadingId === getAttachmentId(attachment)"
              @click="onDeleteAttachment(attachment)"
            >
              <i class="ph-trash me-1" /> {{ $t('t-delete') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-card v-for="row in attachmentUploads" v-if="canAttachContractDocuments" :key="row.id" class="border mt-3" elevation="0">
        <v-card-text class="position-relative">
          <v-btn
            icon="ph-x"
            variant="text"
            color="danger"
            size="small"
            class="position-absolute"
            style="top: 14px; right: 14px; z-index: 1;"
            @click="removeAttachmentUploadRow(row.id)"
          />
          <v-row>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mt-6">
                {{ $t('t-document-type') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="row.contractDocumentType" :items="contractDocumentTypeOptions" />
            </v-col>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mt-n6">
                {{ $t('t-document-file') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <FileUploader v-model="row.files" :multiple="false" :text="$t('t-upload-document-file')" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <div v-if="pendingUploadsValidationMessage" class="text-caption text-danger mt-2">
        {{ pendingUploadsValidationMessage }}
      </div>
    </v-card-text>
  </Card>

  <RemoveItemConfirmationDialog
    v-model="deleteAttachmentDialog"
    :loading="!!attachmentActionLoadingId"
    @onConfirm="onConfirmDeleteAttachment"
  />
</template>
