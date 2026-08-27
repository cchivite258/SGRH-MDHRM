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
  ContractDocumentType
} from "@/components/institution/types";
import { contractDocumentTypeOptions } from "@/components/institution/create/utils";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

type AttachmentUploadRow = {
  id: string;
  contractDocumentType: ContractDocumentType | "";
  files: any[];
  status: "idle" | "uploading" | "error";
  errorMessage: string;
  lastUploadKey: string;
};

const props = defineProps({
  contractId: {
    type: String,
    default: ""
  },
  coveragePeriodExtensionId: {
    type: [String, Number],
    default: null
  },
  title: {
    type: String,
    default: "Documentos do Contrato"
  },
  documentType: {
    type: String as () => ContractDocumentType | "",
    default: ""
  },
  showDocumentType: {
    type: Boolean,
    default: true
  },
  allowAttach: {
    type: Boolean,
    default: true
  }
});

const { t } = useI18n();
const toast = useToast();
const { can, canAny } = usePermissions();

const loading = ref(false);
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
const canShowAttachDocuments = computed(() => props.allowAttach && canAttachContractDocuments.value);
const hasCoveragePeriodExtensionFilter = computed(() =>
  props.coveragePeriodExtensionId !== undefined
  && props.coveragePeriodExtensionId !== null
  && props.coveragePeriodExtensionId !== ""
);
const coveragePeriodExtensionIdValue = computed(() =>
  hasCoveragePeriodExtensionFilter.value ? String(props.coveragePeriodExtensionId) : ""
);

const createAttachmentUploadRow = (): AttachmentUploadRow => ({
  id: uuidv4(),
  contractDocumentType: props.documentType,
  files: [],
  status: "idle",
  errorMessage: "",
  lastUploadKey: ""
});

const resolveUploadedFile = (files: any[]) =>
  files.find((fileItem) => fileItem instanceof File)
  || files.find((fileItem) => fileItem?.file instanceof File)?.file
  || null;

const pendingUploadsValidationMessage = computed(() => {
  const hasIncompleteRow = attachmentUploads.value.some((item) => {
    const selectedFile = resolveUploadedFile(item.files);
    if (!props.showDocumentType) {
      return item.files.length > 0 && !selectedFile;
    }

    return (!!item.contractDocumentType && !selectedFile) || (!item.contractDocumentType && !!selectedFile);
  });

  if (hasIncompleteRow) {
    return t("t-complete-document-row");
  }

  return "";
});

const getUploadKey = (contractDocumentType: ContractDocumentType | "", file: File) =>
  `${contractDocumentType}-${coveragePeriodExtensionIdValue.value}-${file.name}-${file.size}-${file.lastModified || ""}`;

const resetAttachmentUploadRowState = (row: AttachmentUploadRow) => {
  row.status = "idle";
  row.errorMessage = "";
  row.lastUploadKey = "";
};

const isEmptyAttachmentUploadRow = (row: AttachmentUploadRow) =>
  (!row.contractDocumentType || !props.showDocumentType) && row.files.length === 0 && row.status === "idle";

const ensureEmptyAttachmentUploadRow = () => {
  if (!canShowAttachDocuments.value) return;
  if (attachmentUploads.value.some(isEmptyAttachmentUploadRow)) return;

  attachmentUploads.value = [...attachmentUploads.value, createAttachmentUploadRow()];
};

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
  if ((!props.contractId && !hasCoveragePeriodExtensionFilter.value) || !canConsultContractAttachments.value) return;

  loading.value = true;
  try {
    const response = hasCoveragePeriodExtensionFilter.value
      ? await contractAttachmentService.getAttachmentsByCoveragePeriodExtension(coveragePeriodExtensionIdValue.value)
      : await contractAttachmentService.getAttachmentsByContract(props.contractId);
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
  [() => props.contractId, () => props.coveragePeriodExtensionId, () => props.documentType, canConsultContractAttachments],
  async ([contractId, _coveragePeriodExtensionId, _documentType, canConsult]) => {
    attachmentUploads.value = [];
    currentAttachments.value = [];
    errorMsg.value = "";

    if ((!contractId && !hasCoveragePeriodExtensionFilter.value) || !canConsult) return;
    await refreshContractAttachments();
  },
  { immediate: true }
);

const addAttachmentUploadRow = () => {
  if (!canShowAttachDocuments.value) return;
  attachmentUploads.value = [...attachmentUploads.value, createAttachmentUploadRow()];
};

const removeAttachmentUploadRow = (rowId: string) => {
  attachmentUploads.value = attachmentUploads.value.filter((item) => item.id !== rowId);
};

const tryAutoUploadAttachmentRow = async (rowId: string, force = false) => {
  if (!canShowAttachDocuments.value || !props.contractId) return;

  const row = attachmentUploads.value.find((item) => item.id === rowId);
  if (!row || row.status === "uploading") return;

  const selectedFile = resolveUploadedFile(row.files);
  const contractDocumentType = row.contractDocumentType || props.documentType;
  if (!contractDocumentType || !selectedFile) return;

  const uploadKey = getUploadKey(contractDocumentType, selectedFile);
  if (!force && row.status === "error" && row.lastUploadKey === uploadKey) return;

  row.status = "uploading";
  row.errorMessage = "";
  row.lastUploadKey = uploadKey;
  errorMsg.value = "";

  try {
    const response = await contractAttachmentService.uploadAttachment(
      props.contractId,
      selectedFile,
      contractDocumentType,
      props.coveragePeriodExtensionId
    );

    if (response.status === "error") {
      const messages = getApiErrorMessages(response.error, t("t-message-save-error"));
      messages.forEach((message) => toast.error(message));
      row.status = "error";
      row.errorMessage = messages[0] || t("t-message-save-error");
      errorMsg.value = row.errorMessage;
      return;
    }

    attachmentUploads.value = attachmentUploads.value.filter((item) => item.id !== rowId);
    await refreshContractAttachments();
    ensureEmptyAttachmentUploadRow();
    toast.success(t("t-documents-attached-success"));
  } catch (error) {
    const messages = getApiErrorMessages(error, t("t-message-save-error"));
    messages.forEach((message) => toast.error(message));
    row.status = "error";
    row.errorMessage = messages[0] || t("t-message-save-error");
    errorMsg.value = row.errorMessage;
  }
};

const setAttachmentUploadDocumentType = (rowId: string, value: unknown) => {
  if (!props.showDocumentType) return;

  const row = attachmentUploads.value.find((item) => item.id === rowId);
  if (!row || row.status === "uploading" || typeof value !== "string") return;

  row.contractDocumentType = value as ContractDocumentType | "";
  resetAttachmentUploadRowState(row);
  void tryAutoUploadAttachmentRow(rowId);
};

const setAttachmentUploadFiles = (rowId: string, files: unknown) => {
  const row = attachmentUploads.value.find((item) => item.id === rowId);
  if (!row || row.status === "uploading" || !Array.isArray(files)) return;

  row.files = files;
  resetAttachmentUploadRowState(row);
  void tryAutoUploadAttachmentRow(rowId);
};

const retryAttachmentUploadRow = (rowId: string) => {
  void tryAutoUploadAttachmentRow(rowId, true);
};

const getUploadStatusColor = (status: AttachmentUploadRow["status"]) => {
  if (status === "uploading") return "primary";
  if (status === "error") return "danger";
  return "warning";
};

const getUploadStatusText = (row: AttachmentUploadRow) => {
  if (row.status === "uploading") return t("t-saving");
  if (row.status === "error") return row.errorMessage || t("t-message-save-error");
  return t("t-pending");
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
  <Card v-if="canConsultContractAttachments" :title="title" elevation="0" title-class="pb-0">
    <v-card-text class="pt-0">
      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mb-3" density="compact" />

      <div class="d-flex align-center justify-space-between mb-3">
        <div class="font-weight-bold text-caption">
          {{ $t('t-document-file') }}
        </div>
        <div v-if="canShowAttachDocuments" class="d-flex ga-2">
          <v-btn
            color="secondary"
            size="small"
            variant="elevated"
            :disabled="loading"
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
        <v-card-text class="contract-attachment__content">
          <div class="contract-attachment__info">
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
          <div class="contract-attachment__actions">
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

      <template v-if="canShowAttachDocuments">
        <v-card v-for="row in attachmentUploads" :key="row.id" class="border mt-3" elevation="0">
          <v-card-text class="position-relative">
            <div class="d-flex align-center justify-space-between ga-2 flex-wrap mb-3 pe-8">
              <v-chip
                :color="getUploadStatusColor(row.status)"
                size="small"
                variant="tonal"
              >
                <v-progress-circular
                  v-if="row.status === 'uploading'"
                  indeterminate
                  size="14"
                  width="2"
                  class="me-2"
                />
                {{ getUploadStatusText(row) }}
              </v-chip>
              <v-btn
                v-if="row.status === 'error'"
                color="secondary"
                size="small"
                variant="tonal"
                @click="retryAttachmentUploadRow(row.id)"
              >
                {{ $t('t-retry') }}
              </v-btn>
            </div>

          <v-btn
            icon="ph-x"
            variant="text"
            color="danger"
            size="small"
            class="position-absolute"
            style="top: 14px; right: 14px; z-index: 1;"
            :disabled="row.status === 'uploading'"
            @click="removeAttachmentUploadRow(row.id)"
          />
          <v-row>
            <v-col v-if="showDocumentType" cols="12">
              <div class="font-weight-bold text-caption">
                {{ $t('t-document-type') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                :model-value="row.contractDocumentType"
                :items="contractDocumentTypeOptions"
                :disabled="row.status === 'uploading'"
                @update:modelValue="setAttachmentUploadDocumentType(row.id, $event)"
              />
            </v-col>
            <v-col cols="12">
              <div class="font-weight-bold text-caption" :class="{ 'mt-n6': showDocumentType }">
                {{ $t('t-document-file') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <FileUploader
                :model-value="row.files"
                :multiple="false"
                :disabled="row.status === 'uploading'"
                :text="$t('t-upload-document-file')"
                @update:modelValue="setAttachmentUploadFiles(row.id, $event)"
              />
            </v-col>
          </v-row>
          </v-card-text>
        </v-card>
      </template>

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

<style scoped>
.contract-attachment__content {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.contract-attachment__info {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  overflow-wrap: anywhere;
}

.contract-attachment__actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: flex-end;
}

.contract-attachment__actions :deep(.v-btn) {
  white-space: nowrap;
}
</style>
