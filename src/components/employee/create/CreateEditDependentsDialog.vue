<script lang="ts" setup>
import { PropType, computed, ref, watch, nextTick } from "vue";
import { v4 as uuidv4 } from "uuid";
import {
  DependentInsertType,
  DependentListingType,
  DependentAttachmentType,
  DependentAttachmentUploadType,
  DependentDocumentType
} from "@/components/employee/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiValidationErrors, getApiErrorMessages } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import FileUploader from "@/app/common/components/FileUploader.vue";
import { dependentEmployeeService } from "@/app/http/httpServiceProvider";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

import {
  genderOptions,
  relationshipOptions,
  dependentDocumentTypeOptions
} from "@/components/employee/create/utils";

import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";

type AttachmentUploadRow = {
  id: string;
  dependentDocumentType: DependentDocumentType | "";
  files: any[];
};

const PROOF_OF_ENROLLMENT: DependentDocumentType = "PROOF_OF_ENROLLMENT";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<DependentInsertType | DependentListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      firstName: "",
      middleName: "",
      gender: "",
      birthDate: undefined,
      relationship: "",
      isUnivesityStudent: false,
      employee: "",
      idCardNumber: "",
      idCardIssuer: "",
      idCardExpiryDate: undefined,
      isLifeTimeCard: false,
      idCardIssuanceDate: undefined,
      enabled: true,
      attachmentUploads: []
    })
  },
});

const localLoading = ref(false);
const saveLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});

const id = ref("");
const firstName = ref("");
const middleName = ref("");
const lastName = ref("");
const gender = ref("");
const birthDate = ref<Date | undefined>();
const relationship = ref("");
const isUnivesityStudent = ref(false);
const employee = ref<string | { id: string; employeeNumber: string; firstName: string; lastName: string; }>("");
const idCardNumber = ref("");
const idCardIssuer = ref("");
const idCardExpiryDate = ref<Date | undefined>();
const idCardIssuanceDate = ref<Date | undefined>();
const isLifeTimeCard = ref(false);
const enabled = ref(true);
const attachmentUploads = ref<AttachmentUploadRow[]>([]);
const currentAttachments = ref<DependentAttachmentType[]>([]);
const attachmentActionLoadingId = ref<string | null>(null);
const downloadAttachmentLoadingId = ref<string | null>(null);
const deleteAttachmentDialog = ref(false);
const attachmentToDelete = ref<DependentAttachmentType | null>(null);
const birthDatePicker = ref();
const idCardExpiryDatePicker = ref();
const idCardIssuanceDatePicker = ref();

const createAttachmentUploadRow = (): AttachmentUploadRow => ({
  id: uuidv4(),
  dependentDocumentType: "",
  files: []
});

watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  firstName.value = newData.firstName || "";
  middleName.value = newData.middleName || "";
  lastName.value = newData.lastName || "";
  gender.value = newData.gender || "";
  birthDate.value = newData.birthDate ? new Date(newData.birthDate) : undefined;
  relationship.value = newData.relationship || "";
  isUnivesityStudent.value = !!newData.isUnivesityStudent;
  employee.value = typeof newData.employee === 'string'
    ? newData.employee
    : newData.employee
      ? { ...newData.employee }
      : "";
  idCardNumber.value = newData.idCardNumber || "";
  idCardIssuer.value = newData.idCardIssuer || "";
  idCardExpiryDate.value = newData.idCardExpiryDate ? new Date(newData.idCardExpiryDate) : undefined;
  idCardIssuanceDate.value = newData.idCardIssuanceDate ? new Date(newData.idCardIssuanceDate) : undefined;
  isLifeTimeCard.value = !!newData.isLifeTimeCard;
  enabled.value = newData.enabled !== undefined ? newData.enabled : true;
  attachmentUploads.value = [];
  currentAttachments.value = [];
}, { immediate: true });

watch(
  () => props.data?.id,
  async (dependentId) => {
    attachmentUploads.value = [];
    currentAttachments.value = [];

    if (!dependentId) return;

    try {
      const response = await dependentEmployeeService.getAttachmentsByDependent(dependentId);
      if (response.status === "success") {
        currentAttachments.value = response.data || [];
      }
    } catch (error) {
      console.error("Erro ao carregar anexos do dependente:", error);
    }
  },
  { immediate: true }
);

const isCreate = computed(() => !id.value);
const isChildDependent = computed(() => relationship.value === "CHILD");
const canUseLifetimeIdCard = computed(() => !isChildDependent.value);
const canBeUniversityStudent = computed(() => isChildDependent.value);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

const requiredRules = {
  firstName: [
    (v: string) => !!v || t('t-please-enter-firstname'),
  ],
  lastName: [
    (v: string) => !!v || t('t-please-enter-lastname'),
  ],
  gender: [
    (v: string) => !!v || t('t-please-enter-email-address'),
  ],
  birthDate: [
    (v: Date | string | null) => !!v || t('t-please-enter-birth-date'),
  ],
  relationship: [
    (v: string) => !!v || t('t-please-enter-relationship'),
  ],
  idCardNumber: [
    (v: string) => !!v || t('t-please-enter-id-card-number'),
  ],
  idCardIssuer: [
    (v: string) => !!v || t('t-please-enter-id-card-issuer'),
  ],
  idCardExpiryDate: [
    (v: Date | string | null) => isLifeTimeCard.value || !!v || t('t-please-enter-id-card-expiry-date'),
    (v: Date | string | null) => {
      if (isLifeTimeCard.value) return true;
      if (!v) return true;
      const expiryDate = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) return t('t-invalid-id-card-expiry-date');
      if (idCardIssuanceDate.value) {
        const issuanceDate = new Date(idCardIssuanceDate.value);
        if (expiryDate <= issuanceDate) return t('t-invalid-id-card-expiry-date');
      }
      return true;
    }
  ],
  idCardIssuanceDate: [
    (v: Date | string | null) => !!v || t('t-please-enter-id-card-issuance-date'),
    (v: Date | string | null) => {
      if (!v) return true;
      const issuanceDate = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (issuanceDate > today) return t('t-invalid-id-card-issuance-date');
      if (idCardExpiryDate.value) {
        const expiryDate = new Date(idCardExpiryDate.value);
        if (issuanceDate >= expiryDate) return t('t-invalid-id-card-issuance-date');
      }
      return true;
    }
  ]
};

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const toast = useToast();
const getServerErrors = (field: string) => serverErrors.value[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

watch(firstName, () => delete serverErrors.value.firstName);
watch(middleName, () => delete serverErrors.value.middleName);
watch(lastName, () => delete serverErrors.value.lastName);
watch(gender, () => delete serverErrors.value.gender);
watch(birthDate, () => delete serverErrors.value.birthDate);
watch(relationship, () => delete serverErrors.value.relationship);
watch(isUnivesityStudent, () => delete serverErrors.value.isUnivesityStudent);
watch(idCardNumber, () => delete serverErrors.value.idCardNumber);
watch(idCardIssuer, () => delete serverErrors.value.idCardIssuer);
watch(idCardExpiryDate, () => delete serverErrors.value.idCardExpiryDate);
watch(idCardIssuanceDate, () => delete serverErrors.value.idCardIssuanceDate);
watch(isLifeTimeCard, (newValue, oldValue) => {
  delete serverErrors.value.isLifeTimeCard;
  delete serverErrors.value.idCardExpiryDate;
  if (newValue && !oldValue) {
    idCardExpiryDate.value = undefined;
  }
});
watch(relationship, () => {
  delete serverErrors.value.relationship;
  delete serverErrors.value.idCardExpiryDate;
  if (!canUseLifetimeIdCard.value) {
    isLifeTimeCard.value = false;
  }
  if (!canBeUniversityStudent.value) {
    isUnivesityStudent.value = false;
  }
}, { immediate: true });
watch(attachmentUploads, () => delete serverErrors.value.attachmentUploads, { deep: true });

const normalizedPendingUploads = computed<DependentAttachmentUploadType[]>(() =>
  attachmentUploads.value
    .map((item) => ({
      dependentDocumentType: item.dependentDocumentType,
      file: item.files.find((fileItem) => fileItem?.file instanceof File)?.file || null
    }))
    .filter((item) => item.dependentDocumentType || item.file)
);

const duplicateDocumentTypes = computed(() => {
  const types = [
    ...currentAttachments.value.map((item) => item.dependentDocumentType),
    ...normalizedPendingUploads.value
      .map((item) => item.dependentDocumentType)
      .filter((value): value is DependentDocumentType => value !== "")
  ];

  return [...new Set(types.filter((value, index) => types.indexOf(value) !== index))];
});

const hasRequiredUniversityDocument = computed(() => {
  if (!isUnivesityStudent.value) return true;

  const allTypes = [
    ...currentAttachments.value.map((item) => item.dependentDocumentType),
    ...normalizedPendingUploads.value
      .map((item) => item.dependentDocumentType)
      .filter((value): value is DependentDocumentType => value !== "")
  ];

  return allTypes.includes(PROOF_OF_ENROLLMENT);
});

const hasRequiredRelationshipDocuments = computed(() => {
  if (!relationship.value) return true;

  const allTypes = [
    ...currentAttachments.value.map((item) => item.dependentDocumentType),
    ...normalizedPendingUploads.value
      .map((item) => item.dependentDocumentType)
      .filter((value): value is DependentDocumentType => value !== "")
  ];

  if (isChildDependent.value) {
    return allTypes.includes("BIRTH_CERTIFICATE") || allTypes.includes("ID_CARD");
  }

  return allTypes.includes("ID_CARD");
});

const pendingUploadsValidationMessage = computed(() => {
  const hasIncompleteRow = attachmentUploads.value.some((item) => {
    const selectedFile = item.files.find((fileItem) => fileItem?.file instanceof File)?.file || null;
    return (!!item.dependentDocumentType && !selectedFile) || (!item.dependentDocumentType && !!selectedFile);
  });

  if (hasIncompleteRow) {
    return t('t-complete-document-row');
  }

  if (duplicateDocumentTypes.value.length > 0) {
    return t('t-duplicate-document-type-not-allowed');
  }

  return "";
});

const saveAttachmentValidationMessage = computed(() => {
  if (pendingUploadsValidationMessage.value) {
    return pendingUploadsValidationMessage.value;
  }

  if (!hasRequiredRelationshipDocuments.value) {
    return isChildDependent.value
      ? t('t-child-dependent-required-documents')
      : t('t-non-child-dependent-required-id-card');
  }

  if (!hasRequiredUniversityDocument.value) {
    return t('t-proof-of-enrollment-required');
  }

  return "";
});

const getDocumentTypeLabel = (value: string | null | undefined) => {
  const option = dependentDocumentTypeOptions.find((item) => item.value === value);
  return option?.label || value || '-';
};

const addAttachmentUploadRow = () => {
  attachmentUploads.value = [...attachmentUploads.value, createAttachmentUploadRow()];
};

const removeAttachmentUploadRow = (rowId: string) => {
  attachmentUploads.value = attachmentUploads.value.filter((item) => item.id !== rowId);
};

const onDownloadAttachment = async (attachment: DependentAttachmentType) => {
  const attachmentId = attachment.dependentAttachmentId || attachment.id;
  const fileName = attachment.fileMetadata?.originalFilename
    || attachment.fileMetadata?.name
    || 'dependent-document';
  const extension = attachment.fileMetadata?.extension || '';

  downloadAttachmentLoadingId.value = attachmentId;
  try {
    const response = await dependentEmployeeService.downloadAttachment(attachmentId, fileName, extension);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t('t-message-download-error')).forEach((message) => toast.error(message));
    }
  } finally {
    downloadAttachmentLoadingId.value = null;
  }
};

const refreshDependentAttachments = async () => {
  if (!id.value) return;

  try {
    const response = await dependentEmployeeService.getAttachmentsByDependent(id.value);
    if (response.status === "success") {
      currentAttachments.value = response.data || [];
    }
  } catch (error) {
    console.error("Erro ao actualizar anexos do dependente:", error);
  }
};

const onDeleteAttachment = (attachment: DependentAttachmentType) => {
  attachmentToDelete.value = attachment;
  deleteAttachmentDialog.value = true;
};

const onConfirmDeleteAttachment = async () => {
  if (!attachmentToDelete.value) return;

  const attachmentId = attachmentToDelete.value.dependentAttachmentId || attachmentToDelete.value.id;
  attachmentActionLoadingId.value = attachmentId;

  try {
    const response = await dependentEmployeeService.deleteAttachment(attachmentId);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t('t-message-delete-error')).forEach((message) => toast.error(message));
      return;
    }

    currentAttachments.value = currentAttachments.value.filter((item) => item.id !== attachmentToDelete.value?.id);
    toast.success(t('t-toast-message-deleted'));
    await refreshDependentAttachments();
  } catch (error) {
    getApiErrorMessages(error, t('t-message-delete-error')).forEach((message) => toast.error(message));
  } finally {
    attachmentActionLoadingId.value = null;
    deleteAttachmentDialog.value = false;
    attachmentToDelete.value = null;
  }
};

const onAttachDocuments = async () => {
  if (!id.value) {
    toast.error(t('t-save-dependent-before-attach'));
    return;
  }

  await uploadPendingDocuments();
};

const uploadPendingDocuments = async () => {
  const pendingUploads = normalizedPendingUploads.value;
  if (pendingUploads.length === 0) {
    toast.error(t('t-add-at-least-one-document'));
    return false;
  }

  if (pendingUploadsValidationMessage.value) {
    toast.error(pendingUploadsValidationMessage.value);
    errorMsg.value = pendingUploadsValidationMessage.value;
    return false;
  }

  localLoading.value = true;
  try {
    for (const attachmentUpload of pendingUploads) {
      if (!attachmentUpload.file || !attachmentUpload.dependentDocumentType) continue;

      const response = await dependentEmployeeService.uploadAttachment(
        id.value,
        attachmentUpload.file,
        attachmentUpload.dependentDocumentType
      );

      if (response.status === "error") {
        const messages = getApiErrorMessages(response.error, t('t-message-save-error'));
        messages.forEach((message) => toast.error(message));
        errorMsg.value = messages[0] || t('t-message-save-error');
        return false;
      }
    }

    attachmentUploads.value = [];
    await refreshDependentAttachments();
    errorMsg.value = "";
    toast.success(t('t-documents-attached-success'));
    return true;
  } catch (error) {
    const messages = getApiErrorMessages(error, t('t-message-save-error'));
    messages.forEach((message) => toast.error(message));
    errorMsg.value = messages[0] || t('t-message-save-error');
    return false;
  } finally {
    localLoading.value = false;
  }
};

const onSubmit = async () => {
  if (!form.value) return;
  serverErrors.value = {};
  const isBirthDateValid = birthDatePicker.value?.validate?.() ?? true;
  const isIdCardExpiryDateValid = idCardExpiryDatePicker.value?.validate?.() ?? true;
  const isIdCardIssuanceDateValid = idCardIssuanceDatePicker.value?.validate?.() ?? true;

  const { valid } = await form.value.validate();

  if (!valid || !isBirthDateValid || !isIdCardExpiryDateValid || !isIdCardIssuanceDateValid || !!saveAttachmentValidationMessage.value) {
    toast.error(t('t-validation-error'));
    errorMsg.value = saveAttachmentValidationMessage.value || t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  saveLoading.value = true;

  const payload: DependentInsertType = {
    id: id.value || undefined,
    firstName: firstName.value,
    middleName: middleName.value,
    lastName: lastName.value,
    gender: gender.value,
    birthDate: birthDate.value,
    relationship: relationship.value,
    isUnivesityStudent: isUnivesityStudent.value,
    employee: typeof employee.value === 'string'
      ? employee.value
      : employee.value?.id ?? "",
    idCardNumber: idCardNumber.value,
    idCardIssuer: idCardIssuer.value,
    idCardExpiryDate: idCardExpiryDate.value,
    isLifeTimeCard: isLifeTimeCard.value,
    idCardIssuanceDate: idCardIssuanceDate.value,
    enabled: enabled.value,
    attachmentUploads: normalizedPendingUploads.value
  };
  normalizeObjectStringFieldsInPlace(payload as Record<string, any>, {
    firstName: "trimToEmpty",
    middleName: "trimToNull",
    lastName: "trimToEmpty",
    idCardNumber: "trimToEmpty",
    idCardIssuer: "trimToEmpty"
  });

  emit("onSubmit", payload, {
    onSuccess: (savedData?: DependentListingType) => {
      if (savedData?.id) {
        id.value = savedData.id;
      }
      dialogValue.value = false;
    },
    onError: (error: { error?: ApiErrorResponse }) => {
      serverErrors.value = getApiValidationErrors(error);
      const messages = getApiErrorMessages(error, t('t-message-save-error'));
      const primaryMessage = messages[0] || t('t-message-save-error');

      messages.forEach((message) => toast.error(message));
      errorMsg.value = Object.keys(serverErrors.value).length === 0 ? primaryMessage : "";
      alertTimeout = setTimeout(() => {
        errorMsg.value = "";
        alertTimeout = null;
      }, 5000);
    },
    onFinally: () => saveLoading.value = false
  });
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="900">
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-dependent') : $t('t-edit-dependent')" title-class="py-0"
        style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
        <v-card-text class="overflow-y-auto" style="max-height: 70vh">
          <v-row>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-firstname') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="firstName" :placeholder="$t('t-enter-firstname')"
                :rules="applyServerErrorsToRules('firstName', requiredRules.firstName)" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-middle-name') }}
              </div>
              <TextField v-model="middleName" :placeholder="$t('t-enter-middle-name')" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-lastname') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="lastName" :placeholder="$t('t-enter-lastname')"
                :rules="applyServerErrorsToRules('lastName', requiredRules.lastName)" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-relationship') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="relationship" :items="relationshipOptions"
                :rules="requiredRules.relationship" :error-messages="getServerErrors('relationship')" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-gender') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect v-model="gender" :items="genderOptions" :rules="requiredRules.gender"
                :error-messages="getServerErrors('gender')" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-birth-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="birthDatePicker" v-model="birthDate" :placeholder="$t('t-enter-birth-date')"
                :rules="applyServerErrorsToRules('birthDate', requiredRules.birthDate)" format="dd/MM/yyyy" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-number') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="idCardNumber" :placeholder="$t('t-enter-id-card-number')"
                :rules="applyServerErrorsToRules('idCardNumber', requiredRules.idCardNumber)" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-issuer') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="idCardIssuer" :placeholder="$t('t-enter-id-card-issuer')"
                :rules="applyServerErrorsToRules('idCardIssuer', requiredRules.idCardIssuer)" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-is-lifetime-id-card') }}
              </div>
              <v-checkbox v-model="isLifeTimeCard" density="compact" color="primary" class="d-inline-flex"
                :disabled="!canUseLifetimeIdCard">
                <template #label>
                  <span>{{ $t('t-is-lifetime-id-card') }}</span>
                </template>
              </v-checkbox>
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-issuance-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="idCardIssuanceDatePicker" v-model="idCardIssuanceDate"
                :placeholder="$t('t-enter-id-card-issuance-date')"
                :rules="applyServerErrorsToRules('idCardIssuanceDate', requiredRules.idCardIssuanceDate)"
                format="dd/MM/yyyy" />
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-id-card-expiry-date') }} <i v-if="!isLifeTimeCard" class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker ref="idCardExpiryDatePicker" v-model="idCardExpiryDate"
                :placeholder="$t('t-enter-id-card-expiry-date')"
                :rules="applyServerErrorsToRules('idCardExpiryDate', requiredRules.idCardExpiryDate)"
                format="dd/MM/yyyy" :disabled="isLifeTimeCard" />
            </v-col>
          </v-row>
          <v-row class="mt-3">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold">{{ $t('t-university-student') }}</div>
              <v-checkbox v-model="isUnivesityStudent" density="compact" color="primary" class="d-inline-flex"
                :disabled="!canBeUniversityStudent">
                <template #label>
                  <span>{{ $t('t-is-university-student') }}</span>
                </template>
              </v-checkbox>
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold">{{ $t('t-enabled') }}</div>
              <v-checkbox v-model="enabled" density="compact" color="primary" class="d-inline-flex">
                <template #label>
                  <span>{{ $t('t-is-enabled') }}</span>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>

          <v-row class="mt-n3">
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="font-weight-bold text-caption">
                  {{ $t('t-dependent-documents') }}
                </div>
                <div class="d-flex ga-2">
                  <v-btn v-if="!isCreate && attachmentUploads.length > 0" color="secondary" size="small"
                    variant="outlined"
                    @click="onAttachDocuments" :loading="localLoading" :disabled="localLoading">
                    {{ localLoading ? $t('t-saving') : $t('t-attach') }}
                  </v-btn>
                  <v-btn color="secondary" size="small" variant="elevated" @click="addAttachmentUploadRow">
                    <i class="ph-plus me-1" /> {{ $t('t-add-document') }}
                  </v-btn>
                </div>
              </div>

              <v-card v-for="attachment in currentAttachments" :key="attachment.id" class="border mb-3" elevation="0">
                <v-card-text class="d-flex align-center justify-space-between">
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold">
                      {{ attachment.fileMetadata?.originalFilename || attachment.fileMetadata?.name || 'dependent-document' }}
                    </span>
                    <span class="text-caption">
                      {{ getDocumentTypeLabel(attachment.dependentDocumentType) }}
                    </span>
                    <span>
                      {{ Math.ceil(Number(attachment.fileMetadata?.fileSize || attachment.fileMetadata?.size || 0) / 1024) }}
                      kb
                    </span>
                  </div>
                  <div class="d-flex ga-2">
                    <v-btn color="black" variant="elevated" size="small"
                      @click="onDownloadAttachment(attachment)"
                      :loading="downloadAttachmentLoadingId === (attachment.dependentAttachmentId || attachment.id)"
                      :disabled="downloadAttachmentLoadingId === (attachment.dependentAttachmentId || attachment.id) || attachmentActionLoadingId === (attachment.dependentAttachmentId || attachment.id)">
                      <i class="ph-download-simple me-1" /> {{ $t('t-download-attachment') }}
                    </v-btn>
                    <v-btn color="danger" variant="elevated" size="small"
                      @click="onDeleteAttachment(attachment)"
                      :loading="attachmentActionLoadingId === (attachment.dependentAttachmentId || attachment.id)"
                      :disabled="attachmentActionLoadingId === (attachment.dependentAttachmentId || attachment.id)">
                      <i class="ph-trash me-1" /> {{ $t('t-delete') }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <v-card v-for="row in attachmentUploads" :key="row.id" class="border mt-3" elevation="0">
                <v-card-text class="position-relative">
                  <v-btn icon="ph-x" variant="text" color="danger" size="small"
                    class="position-absolute"
                    style="top: 14px; right: 14px; z-index: 1;"
                    @click="removeAttachmentUploadRow(row.id)" />
                  <v-row>
                    <v-col cols="12">
                      <div class="font-weight-bold text-caption mt-6">
                        {{ $t('t-document-type') }} <i class="ph-asterisk ph-xs text-danger" />
                      </div>
                      <MenuSelect v-model="row.dependentDocumentType" :items="dependentDocumentTypeOptions" />
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

              <div v-if="saveAttachmentValidationMessage" class="text-caption text-danger mt-2">
                {{ saveAttachmentValidationMessage }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="dialogValue = false">
              <i class="ph-x me-1" /> {{ $t('t-close') }}
            </v-btn>
            <v-btn color="black" variant="elevated" @click="onSubmit" :loading="saveLoading"
              :disabled="saveLoading || localLoading">
              {{ saveLoading ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
  <RemoveItemConfirmationDialog v-model="deleteAttachmentDialog"
    :loading="!!attachmentActionLoadingId" @onConfirm="onConfirmDeleteAttachment" />
</template>
