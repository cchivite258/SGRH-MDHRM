<script lang="ts" setup>
import { computed, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import CreateEditServiceProviderContractExtensionDialog from "@/components/serviceProvider/create/CreateEditServiceProviderContractExtensionDialog.vue";
import ViewServiceProviderContractExtensionDialog from "@/components/serviceProvider/create/ViewServiceProviderContractExtensionDialog.vue";
import { formateDate } from "@/app/common/dateFormate";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { serviceProviderContractExtensionService } from "@/app/http/httpServiceProvider";
import { serviceProviderContractExtensionHeader } from "@/components/serviceProvider/create/utils";
import type { ServiceProviderContractExtensionType } from "@/components/serviceProvider/types";

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
  serviceProviderContractExtensionHeader.map(item => ({ ...item, title: t(`t-${item.title}`) }))
);

const formDialog = ref(false);
const viewDialog = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const selectedExtensions = ref<ServiceProviderContractExtensionType[]>([]);
const extensions = ref<ServiceProviderContractExtensionType[]>([]);
const formExtension = ref<ServiceProviderContractExtensionType | null>(null);
const viewExtension = ref<ServiceProviderContractExtensionType | null>(null);
const itemsPerPage = ref(10);
const pagination = ref({
  totalElements: 0,
  currentPage: 0,
  itemsPerPage: 10,
  totalPages: 0
});

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

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
    console.error("Erro ao carregar adendas do provedor de servico:", error);
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

const openCreateDialog = () => {
  formExtension.value = null;
  formDialog.value = true;
};

const canEditExtension = (item: ServiceProviderContractExtensionType) =>
  String(item.status || "").toUpperCase() === "ACTIVE";

const openEditDialog = (item: ServiceProviderContractExtensionType) => {
  formExtension.value = { ...item };
  formDialog.value = true;
};

const openViewDialog = (item: ServiceProviderContractExtensionType) => {
  viewExtension.value = { ...item };
  viewDialog.value = true;
};

const onFormSaved = async () => {
  await reloadContractExtensions();
  emit("saved");
};

watch(dialogValue, async (isOpen) => {
  if (isOpen) {
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
    formExtension.value = null;
  }
});

watch(viewDialog, (isOpen) => {
  if (!isOpen) {
    viewExtension.value = null;
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
                <td>{{ item.notes || '-' }}</td>
                <td>
                  <Status :status="item.status || 'INACTIVE'" />
                </td>
                <td class="text-end contract-extension-actions-cell">
                  <div class="contract-extension-actions">
                    <v-btn
                      v-if="!readOnly && canEditExtension(item)"
                      icon="ph-pencil-simple ph-sm"
                      color="primary"
                      density="compact"
                      variant="tonal"
                      rounded
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
                  </div>
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

  <CreateEditServiceProviderContractExtensionDialog
    v-model="formDialog"
    :data="formExtension"
    :service-provider-id="serviceProviderId"
    @saved="onFormSaved"
  />

  <ViewServiceProviderContractExtensionDialog
    v-if="viewExtension"
    v-model="viewDialog"
    :data="viewExtension"
    :service-provider-id="serviceProviderId"
  />
</template>

<style scoped>
.contract-extension-actions-cell {
  width: 110px;
  min-width: 110px;
  white-space: nowrap;
}

.contract-extension-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  white-space: nowrap;
}
</style>
