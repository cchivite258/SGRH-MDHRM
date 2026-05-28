<script lang="ts" setup>
/**
 * TabPeriods - Componente para  de pessoas de contato de contratos
 * 
 * Funcionalidades:
 * - Listagem de períodos de cobertura
 * - Criação/Edição de períodos de cobertura
 * - Visualização de detalhes
 * - Exclusão de períodos de cobertura
 */

import { ref, watch, computed, onMounted, onBeforeUnmount, PropType } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { v4 as uuidv4 } from "uuid";

// Components
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import ListMenuWithIcon from "@/app/common/components/ListMenuWithIcon.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import CreateEditCoveragePeriodDialog from "@/components/institution/create/CreateEditCoveragePeriodDialog.vue";
import ViewCoveragePeriodDialog from "@/components/institution/create/ViewCoveragePeriodDialog.vue";
import CoveragePeriodExtensionsDialog from "@/components/institution/create/CoveragePeriodExtensionsDialog.vue";
import CreateEditBudgetDialog from "@/components/institution/create/editCoveragePeriod/CreateEditBudgetDialog.vue";
import ViewBudgetModal from "@/components/institution/create/editCoveragePeriod/ViewBudgetModal.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import StartConfirmationDialog from "@/app/common/components/StartConfirmationDialog.vue";
import CloseConfirmationDialog from "@/app/common/components/CloseConfirmationDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import { formateDate } from "@/app/common/dateFormate";
// Stores e Services
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import { budgetService, coveragePeriodsService } from "@/app/http/httpServiceProvider";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";

// Types
import type {
  CoveragePeriodListingType,
  CoveragePeriodInsertType,
  BudgetInsertType,
  BudgetListingType
} from "@/components/institution/types";

// Utils
import { coveragePeriodHeader } from "@/components/institution/create/utils";
import { coverageperiodOptions as Options } from "@/components/institution/create/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const coveragePeriodStore = useCoveragePeriodStore();

// props
const props = defineProps({
  institutionId: {
    type: String as PropType<string | null>,
    default: null
  },
  isViewMode: {
    type: Boolean,
    default: false
  }
});

// Modifique a lógica para usar o prop institutionId
const institutionId = ref(props.institutionId);

// constants
const dialog = ref(false);
const viewDialog = ref(false);
const coveragePeriodExtensionDialog = ref(false);
const budgetDialog = ref(false);
const budgetViewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const coveragePeriodData = ref<CoveragePeriodInsertType | CoveragePeriodListingType | null>(null);
const selectedCoveragePeriodForExtension = ref<CoveragePeriodListingType | null>(null);
const budgetFormData = ref<BudgetInsertType | BudgetListingType | null>(null);
const budgetSummaryByCoveragePeriod = ref<Record<string, {
  loaded: boolean;
  hasBudget: boolean;
  latestBudget: BudgetListingType | null;
}>>({});
const deleteId = ref<string | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "name,endDate,startDate"; // Propriedades de busca
const itemsPerPage = ref(10);
const selectedCoveragePeriods = ref<CoveragePeriodListingType[]>([]);
const customerDetail = ref<any>(null); // Adicionado para resolver o erro
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const periodStartDialog = ref(false);
const periodCloseDialog = ref(false);
const periodId = ref<string | null>(null);
const periodStartLoading = ref(false);
const periodCloseLoading = ref(false);
// Computed properties
const loadingList = computed(() => coveragePeriodStore.loading);
const totalItems = computed(() => coveragePeriodStore.pagination.totalElements);

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

/**
 * Busca períodos de cobertura com paginação e filtros
 */
const fetchCoveragePeriods = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!institutionId.value) return;

  await coveragePeriodStore.fetchCoveragePeriods(
    institutionId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );

  await preloadBudgetSummaries(coveragePeriodStore.coverage_periods);
};

const reloadCoveragePeriods = async () => {
  if (!institutionId.value) return;

  await coveragePeriodStore.fetchCoveragePeriods(
    institutionId.value,
    0,
    itemsPerPage.value,
    "createdAt",
    "asc",
    searchQuery.value,
    searchProps
  );

  await preloadBudgetSummaries(coveragePeriodStore.coverage_periods);
};

watch(
  () => props.institutionId,
  async (newInstitutionId) => {
    institutionId.value = newInstitutionId;

    if (!newInstitutionId) {
      coveragePeriodStore.coverage_periods = [];
      budgetSummaryByCoveragePeriod.value = {};
      return;
    }

    await reloadCoveragePeriods();
  },
  { immediate: true }
);

const refreshSelectedCoveragePeriod = async () => {
  if (!selectedCoveragePeriodForExtension.value?.id) return;

  const response = await coveragePeriodsService.getCoveragePeriodById(selectedCoveragePeriodForExtension.value.id);
  selectedCoveragePeriodForExtension.value = {
    ...selectedCoveragePeriodForExtension.value,
    ...response.data
  };
};

const onCoveragePeriodExtensionSaved = async () => {
  await refreshSelectedCoveragePeriod();
  await reloadCoveragePeriods();
};

const findLatestEnabledBudgetForCoveragePeriod = async (coveragePeriodId: string) => {
  const pageSize = 50;
  let page = 0;
  let totalPages = 1;
  let latestEnabledBudget: BudgetListingType | null = null;

  const getBudgetTimestamp = (budget: BudgetListingType) => {
    const createdAt = budget.createdAt ? new Date(String(budget.createdAt)).getTime() : 0;
    const updatedAt = budget.updatedAt ? new Date(String(budget.updatedAt)).getTime() : 0;
    return Math.max(createdAt, updatedAt);
  };

  while (page < totalPages) {
    const { content, meta } = await budgetService.getBudgetByCoveragePeriodForDropdown(
      coveragePeriodId,
      page,
      pageSize,
      "name",
      "asc"
    );
    const budgets = Array.isArray(content) ? content : content ? [content] : [];

    const enabledBudgets = budgets.filter((budget) => budget.enabled);
    for (const budget of enabledBudgets) {
      if (!latestEnabledBudget || getBudgetTimestamp(budget) > getBudgetTimestamp(latestEnabledBudget)) {
        latestEnabledBudget = budget;
      }
    }

    const resolvedTotalPages = Number(meta?.totalPages);
    if (Number.isFinite(resolvedTotalPages) && resolvedTotalPages > 0) {
      totalPages = resolvedTotalPages;
    } else if (budgets.length < pageSize) {
      totalPages = page + 1;
    } else {
      totalPages = page + 2;
    }

    page += 1;
  }

  return latestEnabledBudget;
};

const loadBudgetSummaryForCoveragePeriod = async (coveragePeriodId: string) => {
  try {
    const latestEnabledBudget = await findLatestEnabledBudgetForCoveragePeriod(coveragePeriodId);

    budgetSummaryByCoveragePeriod.value = {
      ...budgetSummaryByCoveragePeriod.value,
      [coveragePeriodId]: {
        loaded: true,
        hasBudget: !!latestEnabledBudget,
        latestBudget: latestEnabledBudget
      }
    };
  } catch (error) {
    budgetSummaryByCoveragePeriod.value = {
      ...budgetSummaryByCoveragePeriod.value,
      [coveragePeriodId]: {
        loaded: false,
        hasBudget: false,
        latestBudget: null
      }
    };
  }
};

const preloadBudgetSummaries = async (periods: CoveragePeriodListingType[]) => {
  const idsToLoad = periods.map(period => period.id);

  if (idsToLoad.length === 0) return;

  await Promise.all(idsToLoad.map((id) => loadBudgetSummaryForCoveragePeriod(id)));
};

/**
 * Alterna seleção de pessoas de contato
 */
const toggleSelection = (item: CoveragePeriodListingType) => {
  const index = selectedCoveragePeriods.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedCoveragePeriods.value = [...selectedCoveragePeriods.value, item];
  } else {
    selectedCoveragePeriods.value = selectedCoveragePeriods.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Prepara dados para criação/edição
 */
watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    coveragePeriodData.value = null;
  }
});
const onCreateEditClick = (data: CoveragePeriodInsertType | CoveragePeriodListingType | null) => {
  const company = institutionId.value || "";

  coveragePeriodData.value = data
    ? {
      ...data,
      company: company // sobrescreve com o institutionId atual
    }
    : {
      id: undefined,
      name: "",
      endDate: new Date(),
      startDate: new Date(),
      company: company,
      enabled: true
    };

  dialog.value = true; 
};


/**
 * Submete dados do formulário
 */
interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

const onSubmit = async (
  data: CoveragePeriodInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {
    let response: ServiceResponse<CoveragePeriodListingType>;

    if (!data.id) {
      response = await coveragePeriodsService.createCoveragePeriod(data);
    } else {
      response = await coveragePeriodsService.updateCoveragePeriod(data.id, data);
    }

    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      getApiErrorMessages(response.error, t('t-message-save-error')).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error });
      return;
    }

    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(data.id ? t('t-toast-message-update') : t('t-toast-message-created'));

    await reloadCoveragePeriods();
    callbacks?.onSuccess?.();

  } catch (error: any) {
    console.error("Erro ao gravar periodo de cobertura:", error);
    getApiErrorMessages(error, t('t-message-save-error')).forEach((message) => toast.error(message));
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

/*
Opcoes da lista
*/
const getDynamicOptions = (invoice: CoveragePeriodListingType) => {
  const status = invoice.status?.toString().toUpperCase();
  const budgetSummary = budgetSummaryByCoveragePeriod.value[invoice.id];
  const budgetOption = budgetSummary?.loaded
    ? (
        budgetSummary.hasBudget
          ? { title: "view-budget", icon: "ph-eye", value: "view-budget" }
          : status === "INACTIVE"
            ? { title: "add-budget", icon: "ph-wallet", value: "add-budget" }
            : null
      )
    : status === "INACTIVE"
      ? { title: "view-budget", icon: "ph-eye", value: "view-budget" }
      : null;
  const contractAddendumOption = status === "RUNNING"
    ? { title: "extend-period", icon: "ph-file-plus", value: "contract-addendum" }
    : null;

  if (props.isViewMode) {
    return [
      ...Options.filter((option) => option.title === "view"),
      ...(budgetOption?.value === "view-budget" ? [budgetOption] : [])
    ].map((option) => ({
      ...option,
      title: t(`t-${option.title}`)
    }));
  }

  let availableOptions = [...Options];
  if (contractAddendumOption) {
    availableOptions.splice(2, 0, contractAddendumOption);
  }

  if (budgetOption) {
    availableOptions.splice(contractAddendumOption ? 3 : 2, 0, budgetOption);
  }

  if (status === "CLOSED") {
    availableOptions = availableOptions.filter(option =>
      option.title === "view" || option.value === "view-budget"
    );
  } else if (status === "INACTIVE") {
    availableOptions = availableOptions.filter(option =>
      option.title !== "close"
    );
  } else if (status === "RUNNING") {
    availableOptions = availableOptions.filter(option =>
      option.title !== "start" && option.title !== "edit" && option.title !== "delete"
    );
  }

  return availableOptions.map(option => ({
    ...option,
    title: t(`t-${option.title}`)
  }));
};

const onSelect = (option: string, data: CoveragePeriodListingType) => {
  switch (option) {
    case "view":
      onViewClick(data.id);
      break;
    case "edit":
      onEditClick(data.id);
      break;
    case "contract-addendum":
      onCoveragePeriodExtensionClick(data);
      break;
    case "add-budget":
      onRegisterBudgetClick(data);
      break;
    case "view-budget":
      onViewBudgetClick(data);
      break;
    case "start":
      onStart(data.id);
      break;
    case "close":
      onClose(data.id);
      break;
    case "delete":
      onDelete(data.id);
      break;
  }
};

const onCoveragePeriodExtensionClick = (data: CoveragePeriodListingType) => {
  selectedCoveragePeriodForExtension.value = { ...data };
  coveragePeriodExtensionDialog.value = true;
};

const onRegisterBudgetClick = (data: CoveragePeriodListingType) => {
  budgetFormData.value = {
    id: undefined,
    name: data.name || "",
    budgetAmount: 0,
    coveragePeriod: data.id,
    enabled: true
  };
  budgetDialog.value = true;
};

const onViewBudgetClick = async (data: CoveragePeriodListingType) => {
  try {
    const budget = await findLatestEnabledBudgetForCoveragePeriod(data.id);

    budgetSummaryByCoveragePeriod.value = {
      ...budgetSummaryByCoveragePeriod.value,
      [data.id]: {
        loaded: true,
        hasBudget: !!budget,
        latestBudget: budget
      }
    };

    if (!budget) {
      if (data.status?.toString().toUpperCase() === "INACTIVE") {
        onRegisterBudgetClick(data);
        return;
      }

      toast.error(t("t-search-not-found-message"));
      return;
    }

    budgetFormData.value = { ...budget };
    budgetViewDialog.value = true;
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  }
};

const onSubmitBudget = async (
  data: BudgetInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {
    const response = data.id
      ? await budgetService.updateBudget(data.id, data)
      : await budgetService.createBudget(data);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-message-save-error")).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error });
      return;
    }

    toast.success(data.id ? t("t-toast-message-update") : t("t-toast-message-created"));
    if (data.coveragePeriod) {
      await loadBudgetSummaryForCoveragePeriod(String(data.coveragePeriod));
    }
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

/* 
Prepara dados para fechar o periodo
*/
// Abre o diálogo de confirmação para do lançamento
const onClose = (id: string) => {
  periodId.value = id;
  periodCloseDialog.value = true;
}

const onConfirmClose = async () => {
  if (!periodId.value) return;

  periodCloseLoading.value = true;
  try {
    await coveragePeriodsService.closeCoveragePeriod(periodId.value);
    toast.success(t('t-toast-message-close'));
    await reloadCoveragePeriods();
  } catch (error: unknown) {
    console.log('Erro completo:', error); // Para debugging
    getApiErrorMessages(error, t('t-toast-message-error')).forEach((message) => toast.error(message));
  } finally {
    periodCloseLoading.value = false;
    periodCloseDialog.value = false;
  }
};


/* 
Prepara dados para iniciar o periodo
*/
const onStart = (id: string) => {
  periodId.value = id;
  periodStartDialog.value = true; // Usa a variável específica para start
}

const onConfirmStart = async () => {
  if (!periodId.value) return;

  periodStartLoading.value = true;
  try {
    await coveragePeriodsService.startCoveragePeriod(periodId.value);
    toast.success(t('t-toast-message-start'));
    await reloadCoveragePeriods();
  } catch (error: unknown) {
    console.log('Erro completo:', error); // Para debugging
    getApiErrorMessages(error, t('t-toast-message-error')).forEach((message) => toast.error(message));
  } finally {
    periodStartLoading.value = false;
    periodStartDialog.value = false;
  }
};


const onEditClick = async (coveragePeriodId: string) => {
  console.log("Navigating to edit coverage period:------------------", coveragePeriodId);
  await router.push({
    path: `/institution/coveragePeriod/${coveragePeriodId}`,
    query: { institutionId: institutionId.value || undefined, tab: "2" }
  });
}

/**
 * Prepara dados para visualização
 */
watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    coveragePeriodData.value = null;
  }
});
const onViewClick = async (coveragePeriodId: string) => {
  //coveragePeriodData.value = { ...data };
  //viewDialog.value = true;
  console.log("Navigating to view coverage period:------------------", coveragePeriodId);
  await router.push({
    path: `/institution/coveragePeriod/view/${coveragePeriodId}`,
    query: { institutionId: institutionId.value || undefined, tab: "2" }
  });
};

/**
 * Prepara exclusão de contato
 */
const onDelete = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

/**
 * Confirma exclusão de contato
 */
const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await coveragePeriodsService.deleteCoveragePeriod(deleteId.value);
    selectedCoveragePeriods.value = selectedCoveragePeriods.value.filter(
      period => period.id !== deleteId.value
    );
    await reloadCoveragePeriods();
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    toast.error(t('t-toast-message-deleted-erros'));
    console.error("Delete error:", error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null;
  }
};
// Limpeza ao desmontar
onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});
</script>

<template>
  <Card :title="$t('t-coverage-period-list')" title-class="py-5">
    <template v-if="!props.isViewMode" #title-action>
      <div>
        <v-btn color="secondary" class="mx-1" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-coverage-period') }}
        </v-btn>
        <!--<v-btn color="secondary" class="mx-1">
          <i class="ph-download-simple me-1" /> {{ $t('t-import') }}
        </v-btn>
        <v-btn color="info" class="mx-1" variant="tonal">
          <i class="ph-upload-simple me-1" /> {{ $t('t-export') }}
        </v-btn>-->
      </div>
    </template>
  </Card>

  <v-row class="mt-5">
    <v-col cols="12" lg="12">
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="12">
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-coverage-period')" />
          </v-col>
        </v-row>
      </v-card-text>
      <DataTableServer v-model="selectedCoveragePeriods"
        :headers="coveragePeriodHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="coveragePeriodStore.coverage_periods" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps"
        @load-items="fetchCoveragePeriods" item-value="id" :show-select="!props.isViewMode">
        <template #body="{ items }">
          <tr v-for="item in items as CoveragePeriodListingType[]" :key="item.id" height="50">
            <td v-if="!props.isViewMode">
              <v-checkbox :model-value="selectedCoveragePeriods.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ item.name }}</td>
            <td>{{ formateDate(item.startDate) }}</td>
            <td>{{ formateDate(item.endDate) }}</td>
            <td>
              <Status :status="item.status" />
            </td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td>
              <ListMenuWithIcon :menuItems="getDynamicOptions(item)" @onSelect="onSelect($event, item)" />
            </td>
          </tr>
        </template>

        <template v-if="coveragePeriodStore.coverage_periods.length === 0" #body>
          <tr>
            <td :colspan="coveragePeriodHeader.length" class="text-center py-10">
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
    </v-col>
  </v-row>

  <!-- Dialogs -->
  <CreateEditCoveragePeriodDialog v-model="dialog" :data="coveragePeriodData" @onSubmit="onSubmit" />
  <ViewCoveragePeriodDialog v-model="viewDialog" :data="coveragePeriodData" />
  <CoveragePeriodExtensionsDialog
    v-model="coveragePeriodExtensionDialog"
    :coverage-period-id="selectedCoveragePeriodForExtension?.id || null"
    :coverage-period-name="selectedCoveragePeriodForExtension?.name || ''"
    :current-end-date="selectedCoveragePeriodForExtension?.endDate || null"
    @saved="onCoveragePeriodExtensionSaved"
  />
  <CreateEditBudgetDialog
    v-if="budgetFormData"
    v-model="budgetDialog"
    :data="budgetFormData"
    @onSubmit="onSubmitBudget"
  />
  <ViewBudgetModal
    v-if="budgetFormData"
    v-model="budgetViewDialog"
    :data="budgetFormData"
  />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />
  <StartConfirmationDialog v-model="periodStartDialog" :loading="periodStartLoading" @onConfirm="onConfirmStart" />
  <CloseConfirmationDialog v-model="periodCloseDialog" :loading="periodCloseLoading" @onConfirm="onConfirmClose" />

  <v-card-actions v-if="!props.isViewMode" class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 1)">
      <i class="ph-arrow-left me-2" /> {{ $t('t-back') }}
    </v-btn>
    <v-btn color="secondary" variant="elevated" @click="$emit('onStepChange', 3)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>

  </v-card-actions>
</template>



