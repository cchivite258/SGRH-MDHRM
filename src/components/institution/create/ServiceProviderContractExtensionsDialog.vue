<script lang="ts" setup>
import { computed, nextTick, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import { formateDate } from "@/app/common/dateFormate";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { serviceProviderContractExtensionService } from "@/app/http/httpServiceProvider";
import { serviceProviderContractExtensionHeader } from "@/components/institution/create/utils";
import type {
  ServiceProviderContractExtensionPayloadType,
  ServiceProviderContractExtensionType
} from "@/components/institution/types";

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  serviceProviderId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null
  },
  serviceProviderName: {
    type: String,
    default: ""
  },
  currentContractEndDate: {
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
  serviceProviderContractExtensionHeader.map(item => ({ ...item, title: t(`t-${item.title}`) }))
);

const formDialog = ref(false);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const contractEndDatePickerRef = ref<{ validate: () => boolean } | null>(null);
const loading = ref(false);
const formLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});
const selectedExtensions = ref<ServiceProviderContractExtensionType[]>([]);
const extensions = ref<ServiceProviderContractExtensionType[]>([]);
const itemsPerPage = ref(10);
const pagination = ref({
  totalElements: 0,
  currentPage: 0,
  itemsPerPage: 10,
  totalPages: 0
});
const extensionForm = ref<ServiceProviderContractExtensionPayloadType>({
  id: undefined,
  serviceProviderId: "",
  contractEndDate: new Date().toISOString().split("T")[0]
});

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const isCreate = computed(() => !extensionForm.value.id);
const totalItems = computed(() => pagination.value.totalElements);

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
  contractEndDate: [
    (v: Date | string | null) => !!v || t("t-please-enter-contract-end-date")
  ]
};

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

const fetchContractExtensions = async ({
  page,
  itemsPerPage,
  sortBy
}: FetchParams) => {
  if (!props.serviceProviderId) return;

  try {
    loading.value = true;
    const { content, meta } = await serviceProviderContractExtensionService.getByServiceProvider(
      props.serviceProviderId,
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "contractStartDate",
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
    console.error("Erro ao carregar adendas do provedor de serviço:", error);
    getApiErrorMessages(error, t("t-error-loading-contract-addenda")).forEach((message) => {
      toast.error(message);
      setError(message);
    });
  } finally {
    loading.value = false;
  }
};

const reloadContractExtensions = async () => {
  await fetchContractExtensions({
    page: pagination.value.currentPage + 1 || 1,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
    search: ""
  });
};

const resetForm = () => {
  extensionForm.value = {
    id: undefined,
    serviceProviderId: props.serviceProviderId || "",
    contractEndDate: new Date().toISOString().split("T")[0]
  };
  serverErrors.value = {};
  errorMsg.value = "";
};

const openCreateDialog = () => {
  resetForm();
  formDialog.value = true;
};

const openEditDialog = async (item: ServiceProviderContractExtensionType) => {
  try {
    formLoading.value = true;
    serverErrors.value = {};
    const response = await serviceProviderContractExtensionService.getById(item.id);
    const extension = response.data;

    extensionForm.value = {
      id: extension.id,
      serviceProviderId: extension.serviceProviderId || props.serviceProviderId || "",
      contractEndDate: extension.contractEndDate
    };
    formDialog.value = true;
  } catch (error) {
    console.error("Erro ao carregar adenda:", error);
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    formLoading.value = false;
  }
};

const closeFormDialog = () => {
  formDialog.value = false;
};

const onSubmit = async () => {
  if (!form.value || !props.serviceProviderId) return;
  serverErrors.value = {};

  const { valid } = await form.value.validate();
  const isContractEndDateValid = contractEndDatePickerRef.value?.validate() ?? true;

  if (!valid || !isContractEndDateValid) {
    toast.error(t("t-validation-error"));
    setError(t("t-please-correct-errors"));
    return;
  }

  try {
    formLoading.value = true;
    const payload: ServiceProviderContractExtensionPayloadType = {
      serviceProviderId: props.serviceProviderId,
      contractEndDate: extensionForm.value.contractEndDate
    };

    const response = extensionForm.value.id
      ? await serviceProviderContractExtensionService.update(extensionForm.value.id, payload)
      : await serviceProviderContractExtensionService.create(payload);

    if (response.status === "error") {
      serverErrors.value = getApiValidationErrors(response.error);
      getApiErrorMessages(response.error, t("t-message-save-error")).forEach((message) => toast.error(message));
      return;
    }

    toast.success(extensionForm.value.id ? t("t-contract-addendum-updated-success") : t("t-contract-addendum-created-success"));
    formDialog.value = false;
    await reloadContractExtensions();
  } catch (error) {
    console.error("Erro ao gravar adenda:", error);
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    formLoading.value = false;
  }
};

watch(dialogValue, async (isOpen) => {
  if (isOpen) {
    resetForm();
    await fetchContractExtensions({
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
    <Card :title="$t('t-contract-addenda')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <div class="d-flex align-center" style="gap: 8px">
          <v-btn v-if="!readOnly" color="primary" variant="elevated" @click="openCreateDialog" :disabled="!serviceProviderId">
            <i class="ph-plus-circle me-1" /> {{ $t('t-add-contract-addendum') }}
          </v-btn>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </div>
      </template>
      <v-divider />

      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />

      <v-card-text>
        <v-row class="mb-2">
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-service-provider') }}</div>
            <div>{{ serviceProviderName || '-' }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-contract-end-date') }}</div>
            <div>{{ formateDate(currentContractEndDate || undefined) || '-' }}</div>
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
          @load-items="fetchContractExtensions"
          item-value="id"
        >
          <template #body="{ items }">
            <template v-if="(items as ServiceProviderContractExtensionType[]).length > 0">
              <tr v-for="item in items as ServiceProviderContractExtensionType[]" :key="item.id" height="50">
                <td>{{ formateDate(item.contractStartDate || undefined) || '-' }}</td>
                <td>{{ formateDate(item.contractEndDate || undefined) || '-' }}</td>
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
      <Card :title="isCreate ? $t('t-add-contract-addendum') : $t('t-edit-contract-addendum')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closeFormDialog" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-contract-end-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <ValidatedDatePicker
                ref="contractEndDatePickerRef"
                v-model="extensionForm.contractEndDate"
                :placeholder="$t('t-enter-contract-end-date')"
                :rules="applyServerErrorsToRules('contractEndDate', requiredRules.contractEndDate)"
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
