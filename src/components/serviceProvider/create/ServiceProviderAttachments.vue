<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import FileUploader from "@/app/common/components/FileUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { serviceProviderAttachmentService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import type {
  ServiceProviderAttachmentType,
  ServiceProviderDocumentType
} from "@/components/serviceProvider/types";
import { serviceProviderDocumentTypeOptions } from "@/components/serviceProvider/create/utils";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

type AttachmentUploadRow = {
  id: string;
  serviceProviderDocumentType: ServiceProviderDocumentType | "";
  files: any[];
  status: "idle" | "uploading" | "error";
  errorMessage: string;
  lastUploadKey: string;
};

const props = defineProps({
  serviceProviderId: {
    type: String,
    default: ""
  }
});

const { t } = useI18n();
const toast = useToast();
const { can, canAny } = usePermissions();

const loading = ref(false);
const errorMsg = ref("");
const attachmentUploads = ref<AttachmentUploadRow[]>([]);
const currentAttachments = ref<ServiceProviderAttachmentType[]>([]);
const attachmentActionLoadingId = ref<string | null>(null);
const downloadAttachmentLoadingId = ref<string | null>(null);
const deleteAttachmentDialog = ref(false);
const attachmentToDelete = ref<ServiceProviderAttachmentType | null>(null);
const canConsultAttachments = computed(() => canAny([
  PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.READ,
  PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.CREATE,
  PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.DELETE,
]));
const canAttachDocuments = computed(() => can(PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.CREATE));
const canDeleteDocuments = computed(() => can(PERMISSIONS.SERVICE_PROVIDER_ATTACHMENTS.DELETE));

const createAttachmentUploadRow = (): AttachmentUploadRow => ({
  id: uuidv4(),
  serviceProviderDocumentType: "",
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
    return (!!item.serviceProviderDocumentType && !selectedFile) || (!item.serviceProviderDocumentType && !!selectedFile);
  });

  if (hasIncompleteRow) {
    return t("t-complete-document-row");
  }

  return "";
});

const getUploadKey = (serviceProviderDocumentType: ServiceProviderDocumentType | "", file: File) =>
  `${serviceProviderDocumentType}-${file.name}-${file.size}-${file.lastModified || ""}`;

const resetAttachmentUploadRowState = (row: AttachmentUploadRow) => {
  row.status = "idle";
  row.errorMessage = "";
  row.lastUploadKey = "";
};

const isEmptyAttachmentUploadRow = (row: AttachmentUploadRow) =>
  !row.serviceProviderDocumentType && row.files.length === 0 && row.status === "idle";

const ensureEmptyAttachmentUploadRow = () => {
  if (!canAttachDocuments.value) return;
  if (attachmentUploads.value.some(isEmptyAttachmentUploadRow)) return;

  attachmentUploads.value = [...attachmentUploads.value, createAttachmentUploadRow()];
};

const getServiceProviderAttachmentId = (attachment: ServiceProviderAttachmentType) => {
  return attachment.id !== undefined && attachment.id !== null
    ? String(attachment.id)
    : "";
};

const getDocumentTypeLabel = (value: string | null | undefined) => {
  const option = serviceProviderDocumentTypeOptions.find((item) => item.value === value);
  return option?.label || value || "-";
};

const getAttachmentFileName = (attachment: ServiceProviderAttachmentType) =>
  attachment.attachment?.originalFilename
  || attachment.originalFilename
  || attachment.fileMetadata?.originalFilename
  || attachment.name
  || attachment.fileMetadata?.name
  || "service-provider-document";

const getAttachmentFileSize = (attachment: ServiceProviderAttachmentType) =>
  Math.ceil(Number(
    attachment.attachment?.fileSize
    || attachment.fileSize
    || attachment.fileMetadata?.fileSize
    || attachment.size
    || attachment.fileMetadata?.size
    || 0
  ) / 1024);

const getAttachmentExtension = (attachment: ServiceProviderAttachmentType) =>
  attachment.attachment?.extension || attachment.extension || attachment.fileMetadata?.extension || "";

const refreshServiceProviderAttachments = async () => {
  if (!props.serviceProviderId) return;

  loading.value = true;
  try {
    const response = await serviceProviderAttachmentService.getAttachmentsByServiceProvider(props.serviceProviderId);
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
  () => props.serviceProviderId,
  async (serviceProviderId) => {
    attachmentUploads.value = [];
    currentAttachments.value = [];
    errorMsg.value = "";

    if (!serviceProviderId) return;
    await refreshServiceProviderAttachments();
  },
  { immediate: true }
);

const addAttachmentUploadRow = () => {
  attachmentUploads.value = [...attachmentUploads.value, createAttachmentUploadRow()];
};

const removeAttachmentUploadRow = (rowId: string) => {
  attachmentUploads.value = attachmentUploads.value.filter((item) => item.id !== rowId);
};

const tryAutoUploadAttachmentRow = async (rowId: string, force = false) => {
  if (!props.serviceProviderId) return;

  const row = attachmentUploads.value.find((item) => item.id === rowId);
  if (!row || row.status === "uploading") return;

  const selectedFile = resolveUploadedFile(row.files);
  if (!row.serviceProviderDocumentType || !selectedFile) return;

  const uploadKey = getUploadKey(row.serviceProviderDocumentType, selectedFile);
  if (!force && row.status === "error" && row.lastUploadKey === uploadKey) return;

  row.status = "uploading";
  row.errorMessage = "";
  row.lastUploadKey = uploadKey;
  errorMsg.value = "";

  try {
    const response = await serviceProviderAttachmentService.uploadAttachment(
      props.serviceProviderId,
      selectedFile,
      row.serviceProviderDocumentType
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
    errorMsg.value = "";
    await refreshServiceProviderAttachments();
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
  const row = attachmentUploads.value.find((item) => item.id === rowId);
  if (!row || row.status === "uploading" || typeof value !== "string") return;

  row.serviceProviderDocumentType = value as ServiceProviderDocumentType | "";
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

const onDownloadAttachment = async (attachment: ServiceProviderAttachmentType) => {
  const serviceProviderAttachmentId = getServiceProviderAttachmentId(attachment);
  if (!serviceProviderAttachmentId) {
    toast.error(t("t-message-download-error"));
    return;
  }

  const fileName = getAttachmentFileName(attachment);
  const extension = getAttachmentExtension(attachment);

  downloadAttachmentLoadingId.value = serviceProviderAttachmentId;
  try {
    const response = await serviceProviderAttachmentService.downloadAttachment(serviceProviderAttachmentId, fileName, extension);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-download-error")).forEach((message) => toast.error(message));
    }
  } catch (error) {
    getApiErrorMessages(error, t("t-message-download-error")).forEach((message) => toast.error(message));
  } finally {
    downloadAttachmentLoadingId.value = null;
  }
};

const onDeleteAttachment = (attachment: ServiceProviderAttachmentType) => {
  attachmentToDelete.value = attachment;
  deleteAttachmentDialog.value = true;
};

const onConfirmDeleteAttachment = async () => {
  if (!attachmentToDelete.value) return;

  const serviceProviderAttachmentId = getServiceProviderAttachmentId(attachmentToDelete.value);
  if (!serviceProviderAttachmentId) {
    toast.error(t("t-toast-message-deleted-erros"));
    return;
  }

  attachmentActionLoadingId.value = serviceProviderAttachmentId;

  try {
    const response = await serviceProviderAttachmentService.deleteAttachment(serviceProviderAttachmentId);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-toast-message-deleted-erros")).forEach((message) => toast.error(message));
      return;
    }

    currentAttachments.value = currentAttachments.value.filter((item) => getServiceProviderAttachmentId(item) !== serviceProviderAttachmentId);
    toast.success(t("t-toast-message-deleted"));
    await refreshServiceProviderAttachments();
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
  <Card title="Documentos do Contrato do Provedor" elevation="0" title-class="pb-0">
    <v-card-text class="pt-0">
      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mb-3" density="compact" />

      <div class="d-flex align-center justify-space-between mb-3">
        <div class="font-weight-bold text-caption">
          {{ $t('t-document-file') }}
        </div>
        <div v-if="canAttachDocuments" class="d-flex ga-2">
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

      <v-card v-for="attachment in currentAttachments" :key="getServiceProviderAttachmentId(attachment)" class="border mb-3" elevation="0">
        <v-card-text class="d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between ga-3">
          <div class="d-flex flex-column">
            <span class="font-weight-bold">
              {{ getAttachmentFileName(attachment) }}
            </span>
            <span class="text-caption">
              {{ getDocumentTypeLabel(attachment.serviceProviderDocumentType) }}
            </span>
            <span>
              {{ getAttachmentFileSize(attachment) }} kb
            </span>
          </div>
          <div class="d-flex ga-2 flex-wrap justify-end">
            <v-btn
              v-if="canConsultAttachments"
              color="black"
              variant="elevated"
              size="small"
              :loading="downloadAttachmentLoadingId === getServiceProviderAttachmentId(attachment)"
              :disabled="downloadAttachmentLoadingId === getServiceProviderAttachmentId(attachment) || attachmentActionLoadingId === getServiceProviderAttachmentId(attachment)"
              @click="onDownloadAttachment(attachment)"
            >
              <i class="ph-download-simple me-1" /> {{ $t('t-download-attachment') }}
            </v-btn>
            <v-btn
              v-if="canDeleteDocuments"
              color="danger"
              variant="elevated"
              size="small"
              :loading="attachmentActionLoadingId === getServiceProviderAttachmentId(attachment)"
              :disabled="attachmentActionLoadingId === getServiceProviderAttachmentId(attachment)"
              @click="onDeleteAttachment(attachment)"
            >
              <i class="ph-trash me-1" /> {{ $t('t-delete') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <template v-if="canAttachDocuments">
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
            <v-col cols="12">
              <div class="font-weight-bold text-caption">
                {{ $t('t-document-type') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                :model-value="row.serviceProviderDocumentType"
                :items="serviceProviderDocumentTypeOptions"
                :disabled="row.status === 'uploading'"
                @update:modelValue="setAttachmentUploadDocumentType(row.id, $event)"
              />
            </v-col>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mt-n6">
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
