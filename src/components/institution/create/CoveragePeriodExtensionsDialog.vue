<script lang="ts" setup>
import { computed, nextTick, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import { formateDate } from "@/app/common/dateFormate";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { coveragePeriodExtensionService } from "@/app/http/httpServiceProvider";
import { coveragePeriodExtensionHeader } from "@/components/institution/create/utils";
import type {
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
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const endDatePickerRef = ref<{ validate: () => boolean } | null>(null);
const loading = ref(false);
const formLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});
const selectedExtensions = ref<CoveragePeriodExtensionType[]>([]);
const extensions = ref<CoveragePeriodExtensionType[]>([]);
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
  endDate: new Date().toISOString().split("T")[0]
});

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const isCreate = computed(() => !extensionForm.value.id);
const totalItems = computed(() => pagination.value.totalElements);

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

const setError = (message: string) => {
  errorMsg.value = message;
  clearErrorLater();
};

const getServerErrors = (field: string) => serverErrors.value[field] || [];
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
  ]
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
      sortBy[0]?.key || "startDate",
      sortBy[0]?.order || "desc"
    );

    extensions.value = content;
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

const resetForm = () => {
  extensionForm.value = {
    id: undefined,
    coveragePeriodId: props.coveragePeriodId || "",
    endDate: getDefaultEndDate()
  };
  serverErrors.value = {};
  errorMsg.value = "";
};

const openCreateDialog = () => {
  resetForm();
  formDialog.value = true;
};

const openEditDialog = async (item: CoveragePeriodExtensionType) => {
  try {
    formLoading.value = true;
    serverErrors.value = {};
    const response = await coveragePeriodExtensionService.getById(item.id);
    const extension = response.data;

    extensionForm.value = {
      id: extension.id,
      coveragePeriodId: extension.coveragePeriodId || props.coveragePeriodId || "",
      endDate: extension.endDate
    };
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

  if (!valid || !isEndDateValid) {
    toast.error(t("t-validation-error"));
    setError(t("t-please-correct-errors"));
    return;
  }

  try {
    formLoading.value = true;
    const payload: CoveragePeriodExtensionPayloadType = {
      coveragePeriodId: props.coveragePeriodId,
      endDate: extensionForm.value.endDate
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
  if (!isOpen) {
    resetForm();
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="900">
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
                <td>
                  <Status :status="item.status || 'INACTIVE'" />
                </td>
                <td class="text-end">
                  <v-btn
                    v-if="!readOnly"
                    icon="ph-pencil ph-sm"
                    color="secondary"
                    density="compact"
                    variant="tonal"
                    rounded
                    :loading="formLoading"
                    @click="openEditDialog(item)"
                  />
                  <span v-else>-</span>
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

  <v-dialog v-model="formDialog" width="500" :persistent="true">
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-period-extension') : $t('t-edit-period-extension')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closeFormDialog" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-end-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker
                ref="endDatePickerRef"
                v-model="extensionForm.endDate"
                :placeholder="$t('t-enter-end-date')"
                :rules="applyServerErrorsToRules('endDate', requiredRules.endDate)"
                :teleport="true"
                format="dd/MM/yyyy"
              />
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
</template>
