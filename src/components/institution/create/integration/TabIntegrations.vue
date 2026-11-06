<script lang="ts" setup>
import { computed, PropType, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { contractIntegrationService } from "@/app/http/httpServiceProvider";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import { integrationUsageOptions } from "@/components/settings/integration/listView/utils";
import CreateEditContractIntegrationDialog from "@/components/institution/create/integration/CreateEditContractIntegrationDialog.vue";
import ViewContractIntegrationDialog from "@/components/institution/create/integration/ViewContractIntegrationDialog.vue";
import type {
  ContractIntegration,
  ContractIntegrationForm,
  ContractIntegrationId,
} from "@/components/institution/create/integration/types";
import {
  classificationTypeOptions,
  contractIntegrationHeader,
  integrationModelOptions,
  settledAmountModeOptions,
} from "@/components/institution/create/integration/utils";

const { t } = useI18n();
const toast = useToast();
const { can, canAny } = usePermissions();

const props = defineProps({
  institutionId: {
    type: String as PropType<string | null>,
    default: null,
  },
  isViewMode: {
    type: Boolean,
    default: false,
  },
  previousStep: {
    type: Number as PropType<number | null>,
    default: null,
  },
  nextStep: {
    type: Number as PropType<number | null>,
    default: null,
  },
});

const contractId = ref(props.institutionId);
const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const loadingList = ref(false);
const formData = ref<ContractIntegrationForm | null>(null);
const viewData = ref<ContractIntegration | null>(null);
const deleteId = ref<ContractIntegrationId | null>(null);
const searchQuery = ref("");
const searchProps = "integrationDefinition.name,integrationDefinition.code,integrationDefinition.application,usage";
const itemsPerPage = ref(10);
const integrations = ref<ContractIntegration[]>([]);
const totalItems = ref(0);

const canCreate = computed(() => can(PERMISSIONS.CONTRACT_INTEGRATIONS.CREATE));
const canUpdate = computed(() => can(PERMISSIONS.CONTRACT_INTEGRATIONS.UPDATE));
const canDelete = computed(() => can(PERMISSIONS.CONTRACT_INTEGRATIONS.DELETE));
const canView = computed(() => canAny([
  PERMISSIONS.CONTRACT_INTEGRATIONS.READ,
  PERMISSIONS.CONTRACT_INTEGRATIONS.CREATE,
  PERMISSIONS.CONTRACT_INTEGRATIONS.UPDATE,
  PERMISSIONS.CONTRACT_INTEGRATIONS.DELETE,
]));

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
  search: string;
}

const optionLabel = (
  options: { label: string; value: string | number }[],
  value?: string | null
) => {
  if (!value) return "-";
  const option = options.find((item) => item.value === value);
  return option ? t(option.label) : value;
};

const definitionLabel = (item: ContractIntegration) => {
  const definition = item.integrationDefinition;
  if (!definition) return "-";
  const identity = [definition.code, definition.name].filter(Boolean).join(" - ");
  const application = definition.application ? ` (${definition.application})` : "";
  return `${identity || definition.id}${application}`;
};

const readPath = (item: ContractIntegration, path: string) =>
  path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, item);

const matchesSearch = (item: ContractIntegration, search: string) => {
  if (!search) return true;
  const haystack = searchProps
    .split(",")
    .map((path) => readPath(item, path))
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
};

const compareValues = (left: unknown, right: unknown) =>
  String(left ?? "").localeCompare(String(right ?? ""), undefined, { numeric: true, sensitivity: "base" });

const loadIntegrations = async ({ page, itemsPerPage: pageSize, sortBy, search }: FetchParams) => {
  if (!contractId.value) {
    integrations.value = [];
    totalItems.value = 0;
    return;
  }

  loadingList.value = true;
  try {
    const response = await contractIntegrationService.getByContract(contractId.value);
    if (response.status === "error") {
      integrations.value = [];
      totalItems.value = 0;
      getApiErrorMessages(response.error, t("t-contract-integration-load-error")).forEach((message) => toast.error(message));
      return;
    }

    const query = search.trim().toLowerCase();
    let content = (response.data ?? []).filter((item) => matchesSearch(item, query));
    const sort = sortBy?.[0];

    if (sort?.key) {
      content = [...content].sort((left, right) => {
        const result = compareValues(readPath(left, sort.key), readPath(right, sort.key));
        return sort.order === "desc" ? -result : result;
      });
    }

    totalItems.value = content.length;
    const start = Math.max(page - 1, 0) * pageSize;
    integrations.value = content.slice(start, start + pageSize);
  } finally {
    loadingList.value = false;
  }
};

const reload = () => loadIntegrations({
  page: 1,
  itemsPerPage: itemsPerPage.value,
  sortBy: [],
  search: searchQuery.value,
});

watch(
  () => props.institutionId,
  (value) => {
    contractId.value = value;
    if (value) reload();
  },
  { immediate: true }
);

watch(dialog, (open) => {
  if (!open) formData.value = null;
});

watch(viewDialog, (open) => {
  if (!open) viewData.value = null;
});

const emptyForm = (): ContractIntegrationForm => ({
  contractId: contractId.value || "",
  integrationDefinitionId: "",
  usage: "PAYMENT_ORDERS",
  integrationModel: "",
  classificationType: "",
  projectCostAccount: "",
  companyCostAccount: "",
  settledAmountMode: "",
  deductionLimitPercentage: null,
  deductionBase: "",
});

const toForm = (item: ContractIntegration): ContractIntegrationForm => ({
  id: item.id,
  contractId: item.contractId || contractId.value || "",
  integrationDefinitionId: item.integrationDefinition?.id || "",
  usage: item.usage,
  integrationModel: item.integrationModel,
  classificationType: item.classificationType,
  projectCostAccount: item.projectCostAccount || "",
  companyCostAccount: item.companyCostAccount || "",
  settledAmountMode: item.settledAmountMode,
  deductionLimitPercentage: item.deductionLimitPercentage ?? null,
  deductionBase: item.deductionBase || "",
  integrationDefinition: item.integrationDefinition,
});

const onCreateEditClick = (item: ContractIntegration | null) => {
  formData.value = item ? toForm(item) : emptyForm();
  dialog.value = true;
};

const onViewClick = (item: ContractIntegration) => {
  viewData.value = item;
  viewDialog.value = true;
};

const onSubmit = async (
  data: ContractIntegrationForm,
  callbacks?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
    onFinally?: () => void;
  }
) => {
  try {
    const response = data.id
      ? await contractIntegrationService.update(data.id, data)
      : await contractIntegrationService.create(data);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-save-error")).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error, response: { data: response.error } });
      return;
    }

    toast.success(data.id ? t("t-toast-message-update") : t("t-toast-message-created"));
    await reload();
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (id: ContractIntegrationId) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    const response = await contractIntegrationService.remove(deleteId.value);
    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-toast-message-deleted-erros")).forEach((message) => toast.error(message));
      return;
    }

    toast.success(t("t-toast-message-deleted"));
    await reload();
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null;
  }
};
</script>

<template>
  <Card :title="$t('t-contract-integration-list')" title-class="py-5">
    <template v-if="!props.isViewMode && canCreate" #title-action>
      <v-btn color="secondary" class="mx-1" @click="onCreateEditClick(null)">
        <i class="ph-plus-circle me-1" /> {{ $t("t-add-contract-integration") }}
      </v-btn>
    </template>
  </Card>

  <v-row class="mt-5">
    <v-col cols="12">
      <v-card-text>
        <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-contract-integration')" />
      </v-card-text>

      <DataTableServer
        :headers="contractIntegrationHeader.map(item => ({ ...item, title: item.title ? $t(`t-${item.title}`) : '' }))"
        :items="integrations"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        :loading="loadingList"
        :search-query="searchQuery"
        :search-props="searchProps"
        item-value="id"
        :show-select="false"
        @load-items="loadIntegrations"
      >
        <template #body="{ items }">
          <tr v-for="item in items as ContractIntegration[]" :key="item.id" height="50">
            <td>{{ definitionLabel(item) }}</td>
            <td>{{ optionLabel(integrationUsageOptions, item.usage) }}</td>
            <td>{{ optionLabel(integrationModelOptions, item.integrationModel) }}</td>
            <td>{{ optionLabel(classificationTypeOptions, item.classificationType) }}</td>
            <td>{{ optionLabel(settledAmountModeOptions, item.settledAmountMode) }}</td>
            <td><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
            <td>
              <v-btn
                v-if="props.isViewMode"
                icon
                size="small"
                variant="tonal"
                color="primary"
                @click="onViewClick(item)"
              >
                <i class="ph-eye" />
              </v-btn>
              <TableAction
                v-else
                :can-view="canView"
                :can-edit="canUpdate"
                :can-delete="canDelete && item.removable !== false"
                @onEdit="onCreateEditClick(item)"
                @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)"
              />
            </td>
          </tr>
        </template>

        <template v-if="!integrations.length" #body>
          <tr>
            <td :colspan="contractIntegrationHeader.length" class="text-center py-10">
              <v-avatar size="80" color="primary" variant="tonal">
                <i class="ph-magnifying-glass" style="font-size: 30px" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold mt-3">
                {{ $t("t-search-not-found-message") }}
              </div>
              <div class="text-medium-emphasis mt-1">
                {{ $t("t-contract-integration-empty-subtitle") }}
              </div>
            </td>
          </tr>
        </template>
      </DataTableServer>
    </v-col>
  </v-row>

  <CreateEditContractIntegrationDialog
    v-if="dialog && formData"
    v-model="dialog"
    :data="formData"
    @onSubmit="onSubmit"
  />
  <ViewContractIntegrationDialog
    v-if="viewDialog && viewData"
    v-model="viewDialog"
    :data="viewData"
  />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />

  <v-card-actions v-if="!props.isViewMode && (previousStep || nextStep)" class="d-flex justify-space-between mt-5">
    <v-btn
      v-if="previousStep"
      color="secondary"
      variant="outlined"
      class="me-2"
      @click="$emit('onStepChange', previousStep)"
    >
      <i class="ph-arrow-left me-2" /> {{ $t("t-back") }}
    </v-btn>
    <v-btn v-if="nextStep" color="secondary" variant="elevated" @click="$emit('onStepChange', nextStep)">
      {{ $t("t-proceed") }} <i class="ph-arrow-right ms-2" />
    </v-btn>
  </v-card-actions>
</template>
