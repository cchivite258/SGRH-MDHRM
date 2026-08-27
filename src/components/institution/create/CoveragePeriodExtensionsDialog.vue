<script lang="ts" setup>
import { computed, nextTick, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import FileUploader from "@/app/common/components/FileUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import Status from "@/app/common/components/Status.vue";
import MenuDatePicker from "@/app/common/components/MenuDatePicker.vue";
import ViewCoveragePeriodExtensionDialog from "@/components/institution/create/ViewCoveragePeriodExtensionDialog.vue";
import { formateDate } from "@/app/common/dateFormate";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { contractAttachmentService, coveragePeriodExtensionService, reasonService } from "@/app/http/httpServiceProvider";
import type { ReasonListing } from "@/components/baseTables/reason/types";
import { coveragePeriodExtensionHeader } from "@/components/institution/create/utils";
import type {
  ContractAttachmentType,
  CoveragePeriodExtensionPayloadType,
  CoveragePeriodExtensionType
} from "@/components/institution/types";

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  coveragePeriodId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null
  },
  contractId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null
  },
  coveragePeriodName: {
    type: String,
    default: ""
  },
  currentEndDate: {
    type: [String, Date] as PropType<string | Date | null>,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "saved"): void;
}>();

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
  search: string;
}

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  }
});

const tableHeaders = computed(() =>
  coveragePeriodExtensionHeader.map(item => ({ ...item, title: t(`t-${item.title}`) }))
);

const formDialog = ref(false);
const viewDialog = ref(false);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const endDatePickerRef = ref<{ validate: () => boolean } | null>(null);
const loading = ref(false);
const formLoading = ref(false);
const reasonsLoading = ref(false);
const errorMsg = ref("");
const fileError = ref("");
const extensionAttachmentLoading = ref(false);
const serverErrors = ref<Record<string, string[]>>({});
const selectedExtensions = ref<CoveragePeriodExtensionType[]>([]);
const extensions = ref<CoveragePeriodExtensionType[]>([]);
const selectedExtension = ref<CoveragePeriodExtensionType | null>(null);
const existingExtensionAttachment = ref<ContractAttachmentType | null>(null);
const periodExtensionReasons = ref<ReasonListing[]>([]);
const extensionFile = ref<any[]>([]);
const itemsPerPage = ref(10);
const pagination = ref({
  totalElements: 0,
  currentPage: 0,
  itemsPerPage: 10,
  totalPages: 0
});
const extensionForm = ref<CoveragePeriodExtensionPayloadType>({
  id: undefined,
  coveragePeriodId: "",
  endDate: new Date().toISOString().split("T")[0],
  budgetAmount: undefined,
  reasonId: "",
  notes: ""
});

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const isCreate = computed(() => !extensionForm.value.id);
const totalItems = computed(() => pagination.value.totalElements);
const periodExtensionReasonOptions = computed(() =>
  periodExtensionReasons.value
    .filter(reason => reason.enabled)
    .map(reason => ({
      label: reason.name,
      value: reason.id
    }))
);

const toDateOnly = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;

  const parsed = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const getDefaultEndDate = () => {
  const currentEndDate = toDateOnly(props.currentEndDate);
  if (!currentEndDate) {
    return new Date().toISOString().split("T")[0];
  }

  const nextDay = new Date(currentEndDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.toISOString().split("T")[0];
};

const clearErrorLater = () => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
  }

  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

const toTime = (value: Date | string | null | undefined) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortByEndDateDesc = (items: CoveragePeriodExtensionType[]) =>
  [...items].sort((first, second) => toTime(second.endDate) - toTime(first.endDate));

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
  endDate: [
    (v: Date | string | null) => !!v || t("t-please-enter-end-date"),
    (v: Date | string | null) => {
      if (!isCreate.value) return true;

      const selectedEndDate = toDateOnly(v);
      const currentEndDate = toDateOnly(props.currentEndDate);

      if (!selectedEndDate || !currentEndDate) return true;
      return selectedEndDate > currentEndDate || t("t-end-date-must-be-after-current-end-date");
    }
  ],
  budgetAmount: [
    (v: number | string | null | undefined) => {
      if (v === null || v === undefined || v === "") return true;
      return Number(v) >= 0 || t("t-min-zero-amount");
    }
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

const getAttachmentFileName = (attachment: ContractAttachmentType) =>
  attachment.attachment?.originalFilename
  || attachment.originalFilename
  || attachment.fileMetadata?.originalFilename
  || attachment.name
  || attachment.fileMetadata?.name
  || "documento";

const getAttachmentFileSize = (attachment: ContractAttachmentType) =>
  Math.ceil(Number(
    attachment.attachment?.fileSize
    || attachment.fileSize
    || attachment.fileMetadata?.fileSize
    || attachment.size
    || attachment.fileMetadata?.size
    || 0
  ) / 1024);

const loadExistingExtensionAttachment = async (coveragePeriodExtensionId: string | number) => {
  existingExtensionAttachment.value = null;
  extensionAttachmentLoading.value = true;

  try {
    const response = await contractAttachmentService.getAttachmentsByCoveragePeriodExtension(coveragePeriodExtensionId);
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

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

const fetchExtensions = async ({
  page,
  itemsPerPage,
  sortBy
}: FetchParams) => {
  if (!props.coveragePeriodId) return;

  try {
    loading.value = true;
    const { content, meta } = await coveragePeriodExtensionService.getByCoveragePeriod(
      props.coveragePeriodId,
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "endDate",
      sortBy[0]?.order || "desc"
    );

    extensions.value = sortBy[0]?.key ? content : sortByEndDateDesc(content);
    pagination.value = {
      totalElements: meta.totalElements ?? content.length,
      currentPage: meta.page ?? page - 1,
      itemsPerPage: meta.size ?? itemsPerPage,
      totalPages: meta.totalPages ?? Math.ceil((meta.totalElements ?? content.length) / itemsPerPage)
    };
  } catch (error) {
    console.error("Erro ao carregar adendas do perÃ­odo de cobertura:", error);
    getApiErrorMessages(error, t("t-error-loading-period-extensions")).forEach((message) => {
      toast.error(message);
      setError(message);
    });
  } finally {
    loading.value = false;
  }
};

const reloadExtensions = async () => {
  await fetchExtensions({
    page: pagination.value.currentPage + 1 || 1,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
    search: ""
  });
};

const fetchPeriodExtensionReasons = async () => {
  reasonsLoading.value = true;
  try {
    const { content } = await reasonService.getReasonsByType("COVERAGE_PERIOD_EXTENSION");
    periodExtensionReasons.value = content;
  } catch (error) {
    periodExtensionReasons.value = [];
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    reasonsLoading.value = false;
  }
};

const resetForm = () => {
  extensionForm.value = {
    id: undefined,
    coveragePeriodId: props.coveragePeriodId || "",
    endDate: getDefaultEndDate(),
    budgetAmount: undefined,
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

const openCreateDialog = () => {
  resetForm();
  formDialog.value = true;
};

const openViewDialog = (item: CoveragePeriodExtensionType) => {
  selectedExtension.value = { ...item };
  viewDialog.value = true;
};

const openEditDialog = async (item: CoveragePeriodExtensionType) => {
  try {
    formLoading.value = true;
    serverErrors.value = {};
    extensionFile.value = [];
    existingExtensionAttachment.value = null;
    fileError.value = "";
    const response = await coveragePeriodExtensionService.getById(item.id);
    const extension = response.data;

    extensionForm.value = {
      id: extension.id,
      coveragePeriodId: extension.coveragePeriodId || props.coveragePeriodId || "",
      endDate: extension.endDate,
      budgetAmount: extension.budgetAmount ?? undefined,
      reasonId: extension.reasonId || extension.reason?.id || "",
      notes: extension.notes || ""
    };
    await loadExistingExtensionAttachment(extension.id);
    formDialog.value = true;
  } catch (error) {
    console.error("Erro ao carregar adenda do perÃ­odo:", error);
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    formLoading.value = false;
  }
};

const closeFormDialog = () => {
  formDialog.value = false;
};

const onSubmit = async () => {
  if (!form.value || !props.coveragePeriodId) return;
  serverErrors.value = {};

  const { valid } = await form.value.validate();
  const isEndDateValid = endDatePickerRef.value?.validate() ?? true;

  if (!valid || !isEndDateValid || !hasExtensionDocument.value) {
    if (!hasExtensionDocument.value) {
      fileError.value = t("t-please-select-file");
    }
    toast.error(t("t-validation-error"));
    setError(t("t-please-correct-errors"));
    return;
  }

  try {
    formLoading.value = true;
    const payload: CoveragePeriodExtensionPayloadType = {
      coveragePeriodId: props.coveragePeriodId,
      endDate: extensionForm.value.endDate,
      budgetAmount:
        extensionForm.value.budgetAmount === null ||
        extensionForm.value.budgetAmount === undefined
          ? undefined
          : Number(extensionForm.value.budgetAmount),
      reasonId: extensionForm.value.reasonId,
      notes: extensionForm.value.notes.trim(),
      file: selectedExtensionFile.value || undefined
    };

    const response = extensionForm.value.id
      ? await coveragePeriodExtensionService.update(extensionForm.value.id, payload)
      : await coveragePeriodExtensionService.create(payload);

    if (response.status === "error") {
      serverErrors.value = getApiValidationErrors(response.error);
      getApiErrorMessages(response.error, t("t-message-save-error")).forEach((message) => toast.error(message));
      return;
    }

    toast.success(extensionForm.value.id ? t("t-period-extension-updated-success") : t("t-period-extension-created-success"));
    formDialog.value = false;
    await reloadExtensions();
    emit("saved");
  } catch (error) {
    console.error("Erro ao gravar adenda do perÃ­odo:", error);
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    formLoading.value = false;
  }
};

watch(dialogValue, async (isOpen) => {
  if (isOpen) {
    resetForm();
    await fetchExtensions({
      page: 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
      search: ""
    });
  }
});

watch(formDialog, (isOpen) => {
  if (isOpen) {
    fetchPeriodExtensionReasons();
  } else {
    resetForm();
  }
});

watch(extensionFile, () => {
  fileError.value = "";
  const nextServerErrors = { ...serverErrors.value };
  delete nextServerErrors.file;
  serverErrors.value = nextServerErrors;
}, { deep: true });

watch(viewDialog, (isOpen) => {
  if (!isOpen) {
    selectedExtension.value = null;
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="960">
    <Card :title="$t('t-period-extension')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <div class="d-flex align-center" style="gap: 8px">
          <v-btn v-if="!readOnly" color="primary" variant="elevated" @click="openCreateDialog" :disabled="!coveragePeriodId">
            <i class="ph-plus-circle me-1" /> {{ $t('t-extend-period') }}
          </v-btn>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </div>
      </template>
      <v-divider />

      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />

      <v-card-text>
        <v-row class="mb-2">
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-coverage-period') }}</div>
            <div>{{ coveragePeriodName || '-' }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-end-date') }}</div>
            <div>{{ formateDate(currentEndDate || undefined) || '-' }}</div>
          </v-col>
        </v-row>

        <DataTableServer
          v-model="selectedExtensions"
          :headers="tableHeaders"
          :items="extensions"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
          :loading="loading"
          :show-select="false"
          @load-items="fetchExtensions"
          item-value="id"
        >
          <template #body="{ items }">
            <template v-if="(items as CoveragePeriodExtensionType[]).length > 0">
              <tr v-for="item in items as CoveragePeriodExtensionType[]" :key="item.id" height="50">
                <td>{{ formateDate(item.startDate || undefined) || '-' }}</td>
                <td>{{ formateDate(item.endDate || undefined) || '-' }}</td>
                <td>{{ item.notes || '-' }}</td>
                <td>
                  <Status :status="item.status || 'INACTIVE'" />
                </td>
                <td class="text-end">
                  <v-btn
                    v-if="!readOnly"
                    icon="ph-pencil-simple ph-sm"
                    color="primary"
                    density="compact"
                    variant="tonal"
                    rounded
                    class="me-1"
                    :title="$t('t-edit')"
                    @click="openEditDialog(item)"
                  />
                  <v-btn
                    icon="ph-eye ph-sm"
                    color="secondary"
                    density="compact"
                    variant="tonal"
                    rounded
                    :title="$t('t-view')"
                    @click="openViewDialog(item)"
                  />
                </td>
              </tr>
            </template>
            <tr v-else>
              <td :colspan="tableHeaders.length" class="text-center py-10">
                <v-avatar size="80" color="primary" variant="tonal">
                  <i class="ph-magnifying-glass" style="font-size: 30px" />
                </v-avatar>
                <div class="text-subtitle-1 font-weight-bold mt-3">
                  {{ $t('t-search-not-found-message') }}
                </div>
              </td>
            </tr>
          </template>
        </DataTableServer>
      </v-card-text>
    </Card>
  </v-dialog>

  <v-dialog v-model="formDialog" width="760" :persistent="true" :retain-focus="false" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-period-extension') : $t('t-edit-period-extension')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closeFormDialog" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />

        <v-card-text class="overflow-y-auto" style="max-height: calc(90vh - 132px)">
          <v-row>
            <v-col cols="12" md="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-end-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuDatePicker
                ref="endDatePickerRef"
                v-model="extensionForm.endDate"
                :placeholder="$t('t-enter-end-date')"
                :rules="applyServerErrorsToRules('endDate', requiredRules.endDate)"
                :error-messages="getServerErrors('endDate')"
              />
            </v-col>
            <v-col cols="12" md="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-budget-amount') }}
              </div>
              <TextField
                v-model.number="extensionForm.budgetAmount"
                :placeholder="$t('t-enter-budget-amount')"
                type="number"
                :rules="applyServerErrorsToRules('budgetAmount', requiredRules.budgetAmount)"
              />
            </v-col>
            <v-col cols="12" md="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-reason') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="extensionForm.reasonId"
                :items="periodExtensionReasonOptions"
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
            <v-col cols="12" >
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-document-file') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <FileUploader
                v-model="extensionFile"
                :multiple="false"
                :text="$t('t-upload-document-file')"
                :disabled="formLoading"
              />
              <div v-if="displayedFileError" class="coverage-period-extension__file-error">
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
                <v-card-text class="coverage-period-extension__existing-file">
                  <div class="coverage-period-extension__existing-file-info">
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

  <ViewCoveragePeriodExtensionDialog
    v-if="selectedExtension"
    v-model="viewDialog"
    :data="selectedExtension"
    :contract-id="contractId"
  />
</template>

<style scoped>
.coverage-period-extension__file-error {
  color: #ff5252;
  font-size: 0.65rem;
  margin-left: 15px;
  margin-top: 4px;
}

.coverage-period-extension__existing-file {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.coverage-period-extension__existing-file-info {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
