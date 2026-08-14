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
import CreateEditHealthPlanDialog from "@/components/institution/create/CreateEditHealthPlanDialog.vue";
import ViewHealthPlanDialog from "@/components/institution/create/ViewHealthPlanDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import CloneHealthPlanDialog from "@/components/institution/create/CloneHealthPlanDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import { formateDate } from "@/app/common/dateFormate";
import { amountFormate } from "@/app/common/amountFormate";
// Stores e Services
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useHospitalProcedureStore } from "@/store/institution/hospitalProcedureStore";
import { healthPlanService } from "@/app/http/httpServiceProvider";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";

// Types
import type {
  HealthPlanListingType,
  HealthPlanInsertType,
  HealthPlanCloneType,
  HospitalProcedureListingType
} from "@/components/institution/types";

// Utils
import { healthPlanHeader, healthPlanLimitOptions, limitTypeDefinitionOptions, salaryComponentOptions } from "@/components/institution/create/utils";
import { healthPlanOptions as Options } from "@/components/institution/create/utils";
import { exportHealthPlanToPdf } from "@/components/institution/create/healthPlanPdfExporter";
import { groupHealthPlanProcedures, orderHealthPlanProcedures } from "@/components/institution/create/healthPlanProcedureOrdering";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const healthPlanStore = useHealthPlanStore();
const hospitalProcedureStore = useHospitalProcedureStore();
const { can } = usePermissions();

// props
const props = defineProps({
  institutionId: {
    type: String as PropType<string | null>,
    default: null
  },
  isViewMode: {
    type: Boolean,
    default: false
  },
  previousStep: {
    type: Number as PropType<number | null>,
    default: null
  },
  nextStep: {
    type: Number as PropType<number | null>,
    default: null
  }
});

// Modifique a lógica para usar o prop institutionId
const institutionId = ref(props.institutionId);

// constants
const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const healthPlanData = ref<HealthPlanInsertType | HealthPlanListingType | null>(null);
const healthPlanDataView = ref<HealthPlanListingType | null>(null);
const deleteId = ref<string | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "coveragePeriod.name,maxNumberOfDependents,childrenMaxAge,childrenInUniversityMaxAge,healthPlanLimit,fixedAmount,salaryComponent,companyContributionPercentage";
const itemsPerPage = ref(10);
const selectedHealthPlans = ref<HealthPlanListingType[]>([]);
const customerDetail = ref<any>(null); // Adicionado para resolver o erro
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const healthPlanCloneDialog = ref(false);
const healthPlanId = ref<string | null>(null);
const healthPlanCloneLoading = ref(false);
const healthPlanDialog = ref(false);
const healthPlanConsultLoading = ref(false);
const healthPlanPdfExporting = ref(false);
const healthPlanProcedureSearch = ref("");
// Computed properties
const loadingList = computed(() => healthPlanStore.loading);
const totalItems = computed(() => healthPlanStore.pagination.totalElements);
const activeHealthPlan = computed(() => healthPlanStore.activeHealthPlan);
const canCreateHealthPlan = computed(() => can(PERMISSIONS.CONTRACT_HEALTH_PLANS.CREATE));
const canUpdateHealthPlan = computed(() => can(PERMISSIONS.CONTRACT_HEALTH_PLANS.UPDATE));
const canDeleteHealthPlan = computed(() => can(PERMISSIONS.CONTRACT_HEALTH_PLANS.DELETE));
const canCloneHealthPlan = computed(() => can(PERMISSIONS.CONTRACT_HEALTH_PLANS.CLONE));
const canSelectHealthPlans = computed(() => !props.isViewMode && canDeleteHealthPlan.value);
const activePlanProcedures = computed(() => orderHealthPlanProcedures(hospitalProcedureStore.hospital_procedure_of_plan_scoped || [], t("t-procedures")));

const activePlanCoveragePeriod = computed(() =>
  activeHealthPlan.value?.coveragePeriod?.name
  || activeHealthPlan.value?.coveragePeriodName
  || activeHealthPlan.value?.name
  || "-"
);

const getCoveragePeriodName = (healthPlan: HealthPlanListingType) =>
  healthPlan.coveragePeriod?.name
  || (healthPlan as any).coveragePeriodName
  || "-";

const filteredPlanProcedures = computed(() => {
  const search = healthPlanProcedureSearch.value.trim().toLowerCase();
  if (!search) return activePlanProcedures.value;

  return activePlanProcedures.value.filter((procedure) => {
    const procedureType = procedure.hospitalProcedureType || {};
    const searchable = [
      procedureType.code,
      procedureType.name,
      procedureType.categoryName,
      getProcedureGroupName(procedure),
      getProcedureLimitLabel(procedure),
      getFrequencyLabel(procedure)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(search);
  });
});

const groupedPlanProcedureGroups = computed(() => {
  return groupHealthPlanProcedures(filteredPlanProcedures.value, t("t-procedures"));
});

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

/**
 * Busca períodos de cobertura com paginação e filtros
 */
const fetchHealthPlans = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!institutionId.value) return;

  await healthPlanStore.fetchHealthPlans(
    institutionId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

/**
 * Alterna seleção de pessoas de contato
 */
const reloadHealthPlans = async () => {
  if (!institutionId.value) return;

  await healthPlanStore.fetchHealthPlans(
    institutionId.value,
    0,
    itemsPerPage.value,
    "createdAt",
    "asc",
    searchQuery.value,
    searchProps
  );
};

watch(
  () => props.institutionId,
  async (newInstitutionId) => {
    institutionId.value = newInstitutionId;

    if (!newInstitutionId) {
      healthPlanStore.health_plans = [];
      healthPlanStore.pagination.totalElements = 0;
      return;
    }

    await reloadHealthPlans();
  },
  { immediate: true }
);

const toggleSelection = (item: HealthPlanListingType) => {
  const index = selectedHealthPlans.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedHealthPlans.value = [...selectedHealthPlans.value, item];
  } else {
    selectedHealthPlans.value = selectedHealthPlans.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Prepara dados para criação/edição
 */
watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    healthPlanData.value = null;
  }
});
const onCreateEditClick = (data: HealthPlanInsertType | HealthPlanListingType | null) => {
  const company = institutionId.value || "";

  healthPlanData.value = data
    ? {
      ...data,
      company: company // sobrescreve com o institutionId atual
    }
    : {
      id: undefined,
      maxNumberOfDependents: 0,
      childrenMaxAge: 0,
      childrenInUniversityMaxAge: 0,
      waitingPeriodDays: 0,
      healthPlanLimit: "",
      fixedAmount: 0,
      salaryComponent: "",
      companyContributionPercentage: 0,
      coveragePeriod: "",
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
  data: HealthPlanInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {
    let response: ServiceResponse<HealthPlanListingType>;

    if (!data.id) {
      response = await healthPlanService.createHealthPlan(data);
    } else {
      response = await healthPlanService.updateHealthPlan(data.id, data);
    }

    if (response?.status === "error") {
      getApiErrorMessages(response.error, t("t-message-save-error")).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error });
      return;
    }

    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(data.id ? t('t-toast-message-update') : t('t-toast-message-created'));

    await healthPlanStore.fetchHealthPlans(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    callbacks?.onSuccess?.();

  } catch (error: any) {
    console.error("Erro ao gravar plano de saúde:", error);

    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

/**
 * Prepara dados para criação/edição
 */
const gethealthPlanLimitLabel = (value: string | undefined) => {
  const option = healthPlanLimitOptions.find(opt => opt.value === value);
  return option ? option.label : value ? humanizeEnum(value) : "-";
};

const getsalaryComponentLabel = (value: string | undefined) => {
  const option = salaryComponentOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getProcedureType = (procedure: HospitalProcedureListingType) =>
  procedure.hospitalProcedureType || {};

const getProcedureName = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).name || "-";

const getProcedureCode = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).code || "";

const getProcedureCategoryName = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).categoryName || t("t-procedures");

const getProcedureGroupName = (procedure: HospitalProcedureListingType) => {
  const group = procedure.hospitalProcedureGroup;
  if (!group) return "-";
  return typeof group === "object" ? group.name || "-" : String(group);
};

const formatPlanMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${amountFormate(Number(value))} MT`;
};

const formatPlanPercent = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}%`;
};

const humanizeEnum = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

const getTranslatedEnum = (prefix: string, value: string | null | undefined) => {
  if (!value) return "";
  const key = `${prefix}-${value.toString().toLowerCase().replace(/_/g, "-")}`;
  const translated = t(key);
  return translated === key ? humanizeEnum(value) : translated;
};

const getHealthPlanStatusLabel = (value: string | null | undefined) =>
  getTranslatedEnum("t", value) || "-";

const isClosedHealthPlan = (healthPlan: HealthPlanListingType) =>
  healthPlan.status?.toString().toUpperCase() === "CLOSED";

const getLimitTypeDefinitionLabel = (value: string | null | undefined) =>
  value ? limitTypeDefinitionOptions.find(option => option.value === value)?.label || humanizeEnum(value) : "";

const getProcedureSource = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  return item.companyHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedure
    || item;
};

type DisplayValue = number | string | null | undefined;

const firstDefined = (...values: DisplayValue[]): DisplayValue =>
  values.find(value => value !== null && value !== undefined && value !== "");

const procedureUsesGroupLimit = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return Boolean(
    item.belongsToGroup
    || source.belongsToGroup
    || firstDefined(source.groupFixedAmount, item.groupFixedAmount, source.groupPercentage, item.groupPercentage, source.hospitalProcedureGroupLimit, item.hospitalProcedureGroupLimit)
  );
};

const getProcedureFixedAmount = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupFixedAmount, item.groupFixedAmount)
    : firstDefined(source.fixedAmount, item.fixedAmount);
};

const getProcedurePercentage = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupPercentage, item.groupPercentage)
    : firstDefined(source.percentage, item.percentage);
};

const getProcedureLimitLabel = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  const source = getProcedureSource(procedure);
  const limitType = procedureUsesGroupLimit(procedure)
    ? firstDefined(source.hospitalProcedureGroupLimit, item.hospitalProcedureGroupLimit)
    : firstDefined(source.limitTypeDefinition, item.limitTypeDefinition);

  return getLimitTypeDefinitionLabel(limitType as string | null | undefined)
    || getTranslatedEnum("t-limit-type", source.limitType || item.limitType)
    || "-";
};

const getGroupLimitProcedure = (procedures: HospitalProcedureListingType[]) =>
  procedures.find(procedure => procedureUsesGroupLimit(procedure)) || procedures[0];

const groupUsesGroupLimit = (procedures: HospitalProcedureListingType[]) =>
  procedures.some(procedure => procedureUsesGroupLimit(procedure));

const getGroupFixedAmount = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureFixedAmount(procedure) : null;
};

const getGroupPercentage = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedurePercentage(procedure) : null;
};

const getGroupLimitLabel = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getProcedureLimitLabel(procedure) : "-";
};

const getFrequencyLabel = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  const allowedFrequencyUse = firstDefined(source.allowedFrequencyUse, procedure.allowedFrequencyUse);
  const frequencyInterval = firstDefined(source.frequencyInterval, procedure.frequencyInterval);
  if (!allowedFrequencyUse || !frequencyInterval) return "-";

  return `${allowedFrequencyUse}/${frequencyInterval}`;
};

const getGroupFrequencyLabel = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getFrequencyLabel(procedure) : "-";
};

const onConsultHealthPlan = async () => {
  if (!institutionId.value) {
    toast.error(t("t-institution-required"));
    return;
  }

  healthPlanConsultLoading.value = true;
  healthPlanProcedureSearch.value = "";

  try {
    const plan = await healthPlanStore.fetchActiveHealthPlan(institutionId.value);
    if (!plan?.id) {
      hospitalProcedureStore.hospital_procedure_of_plan_scoped = [];
      toast.error(t("t-no-active-health-plan"));
      return;
    }

    await hospitalProcedureStore.fetchHospitalProceduresOfPlanScoped(
      plan.id,
      0,
      1000000000,
      "categoryName",
      "asc"
    );

    healthPlanDialog.value = true;
  } catch (error) {
    console.error("Erro ao consultar plano activo:", error);
    getApiErrorMessages(error, t("t-no-active-health-plan")).forEach((message) => toast.error(message));
  } finally {
    healthPlanConsultLoading.value = false;
  }
};

const onExportHealthPlanPdf = async () => {
  if (!activeHealthPlan.value) {
    toast.error(t("t-no-active-health-plan"));
    return;
  }

  healthPlanPdfExporting.value = true;
  try {
    const fullPlanProcedures = await hospitalProcedureStore.fetchHospitalProceduresOfPlanScopedFull(
      activeHealthPlan.value.id,
      0,
      1000000000,
      "categoryName",
      "asc"
    );

    await exportHealthPlanToPdf({
      healthPlan: activeHealthPlan.value,
      procedures: fullPlanProcedures,
      contextLabel: activeHealthPlan.value?.company?.name || activeHealthPlan.value?.companyName || undefined
    });
  } catch (error) {
    console.error("Erro ao exportar plano de saude:", error);
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    healthPlanPdfExporting.value = false;
  }
};


/*
Opcoes da lista
*/
const getDynamicOptions = (invoice: HealthPlanListingType) => {
  if (props.isViewMode) {
    return Options
      .filter((option) => option.title === "view")
      .map((option) => ({
        ...option,
        title: t(`t-${option.title}`)
      }));
  }

  // Opções base
  let availableOptions = [...Options];

  availableOptions = availableOptions.filter((option) => {
    if (option.value === "edit") return canUpdateHealthPlan.value;
    if (option.value === "delete") return canDeleteHealthPlan.value;
    if (option.value === "clone") return canCloneHealthPlan.value;
    return true;
  });

  const coveragePeriodStatus = invoice.coveragePeriod?.status?.toString().toUpperCase();

  // Planos fechados não podem ser editados nem eliminados.
  if (isClosedHealthPlan(invoice) || coveragePeriodStatus === "RUNNING") {
    availableOptions = availableOptions.filter(option =>
      option.value !== 'edit' && option.value !== 'delete'
    );
  }

  return availableOptions.map(option => ({
    ...option,
    title: t(`t-${option.title}`)
  }));
};

const onSelect = (option: string, data: HealthPlanListingType) => {
  if ((option === "edit" || option === "delete") && isClosedHealthPlan(data)) {
    return;
  }

  switch (option) {
    case "view":
      onViewClick(data);
      break;
    case "edit":
      onEdit(data.id);
      break;
    case "clone":
      onClone(data);
      break;
    case "delete":
      onDelete(data.id);
      break;
  }
};

/* 
Prepara dados para fechar o clonar plano de saude
*/
// Abre o diálogo de confirmação da clonagem
const onClone = (data: HealthPlanInsertType | HealthPlanListingType | null) => {
  const company = institutionId.value || "";

  if (data) {
    data.company = company;
    healthPlanData.value = data;
    healthPlanCloneDialog.value = true;
  }
};

const onSubmitClone = async (
  data: HealthPlanInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {
    let response: ServiceResponse<HealthPlanListingType>;


    response = await healthPlanService.cloneHealthPlan(data);

    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      getApiErrorMessages(response.error, t('t-message-save-error')).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error });
      return;
    }

    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(t('t-toast-message-clone'));

    await healthPlanStore.fetchHealthPlans(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    callbacks?.onSuccess?.();

  } catch (error: any) {
    console.error("Erro ao clonar plano de saúde:", error);
    getApiErrorMessages(error, t('t-message-save-error')).forEach((message) => toast.error(message));
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

/**
 * Prepara exclusão de contato
 */
const onEdit = (id: string) => {
  router.push({
    path: `/institution/healthPlan/${id}`,
    query: { institutionId: institutionId.value || undefined, tab: "3" }
  });
};

/**
 * Prepara dados para visualização
 */
watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    healthPlanData.value = null;
  }
});
const onViewClick = (data: HealthPlanListingType) => {
  //healthPlanDataView.value = { ...data };
  //viewDialog.value = true;
   router.push({
    path: `/institution/healthPlan/view/${data.id}`,
    query: { institutionId: institutionId.value || undefined, tab: "3" }
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
    await healthPlanService.deleteHealthPlan(deleteId.value);
    selectedHealthPlans.value = selectedHealthPlans.value.filter(
      plan => plan.id !== deleteId.value
    );
    await healthPlanStore.fetchHealthPlans(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    console.error("Delete error:", error);
    getApiErrorMessages(error, t('t-toast-message-deleted-erros')).forEach((message) => toast.error(message));
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
  <Card :title="$t('t-health-plan-list')" title-class="py-5">
    <template #title-action>
      <div class="d-flex align-center flex-wrap justify-end ga-2">
        <v-btn
          color="primary"
          variant="tonal"
          :disabled="!institutionId"
          :loading="healthPlanConsultLoading"
          @click="onConsultHealthPlan"
        >
          <i class="ph-first-aid-kit me-1" /> {{ $t('t-consult-health-plan') }}
        </v-btn>

        <v-btn v-if="!props.isViewMode && canCreateHealthPlan" color="secondary" class="mx-1" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-health-plan') }}
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
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-health-plan')" />
          </v-col>
        </v-row>
      </v-card-text>
      <DataTableServer v-model="selectedHealthPlans"
        :headers="healthPlanHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="healthPlanStore.health_plans" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" @load-items="fetchHealthPlans"
        item-value="id" :show-select="canSelectHealthPlans">
        <template #body="{ items }">
          <tr v-for="item in items as HealthPlanListingType[]" :key="item.id" height="50">
            <td v-if="canSelectHealthPlans">
              <v-checkbox :model-value="selectedHealthPlans.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ getCoveragePeriodName(item) }}</td>
            <td>{{ item.maxNumberOfDependents }}</td>
            <td>{{ item.childrenMaxAge }}</td>
            <td>{{ item.childrenInUniversityMaxAge }}</td>
            <td>{{ gethealthPlanLimitLabel(item.healthPlanLimit) }}</td>
            <td>{{ amountFormate(item.fixedAmount) }}</td>
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

        <template v-if="healthPlanStore.health_plans.length === 0" #body>
          <tr>
            <td :colspan="healthPlanHeader.length" class="text-center py-10">
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
  <CreateEditHealthPlanDialog v-model="dialog" :data="healthPlanData" @onSubmit="onSubmit" />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />
  <CloneHealthPlanDialog v-model="healthPlanCloneDialog" :data="healthPlanData" @onSubmitClone="onSubmitClone" />
  <ViewHealthPlanDialog v-model="viewDialog" :data="healthPlanDataView" />

  <v-dialog v-model="healthPlanDialog" max-width="1180" scrollable>
    <v-card class="health-plan-preview" elevation="12">
      <div class="health-plan-preview__hero">
        <div>
          <div class="text-overline text-primary font-weight-bold mb-1">
            {{ $t('t-health-plan') }}
          </div>
          <h3 class="text-h5 font-weight-bold mb-2">
            {{ activePlanCoveragePeriod }}
          </h3>
          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip color="success" variant="flat" size="small">
              {{ getHealthPlanStatusLabel(activeHealthPlan?.status || 'ACTIVE') }}
            </v-chip>
            <span class="text-muted">
              {{ activeHealthPlan?.company?.name || activeHealthPlan?.companyName || '-' }}
            </span>
          </div>
        </div>

        <div class="d-flex align-center ga-2">
          <v-btn
            color="primary"
            variant="tonal"
            :disabled="activePlanProcedures.length === 0"
            :loading="healthPlanPdfExporting"
            @click="onExportHealthPlanPdf"
          >
            <i class="ph-file-pdf me-1" /> Exportar PDF
          </v-btn>

          <v-btn icon variant="text" @click="healthPlanDialog = false">
            <i class="ph-x" />
          </v-btn>
        </div>
      </div>

      <v-card-text class="pt-0">
        <v-row class="mt-1">
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-health-plan-limit') }}</span>
              <strong>{{ gethealthPlanLimitLabel(activeHealthPlan?.healthPlanLimit) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-fixed-amount') }}</span>
              <strong>{{ formatPlanMoney(activeHealthPlan?.fixedAmount) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric plan-metric--success">
              <span>{{ $t('t-percentage') }}</span>
              <strong>{{ formatPlanPercent(activeHealthPlan?.companyContributionPercentage) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-waiting-period-days') }}</span>
              <strong>{{ activeHealthPlan?.waitingPeriodDays ?? '-' }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-procedures') }}</span>
              <strong>{{ activePlanProcedures.length }}</strong>
            </div>
          </v-col>
        </v-row>

        <div class="d-flex align-center justify-space-between flex-wrap ga-3 mt-5 mb-4">
          <div>
            <h4 class="text-subtitle-1 font-weight-bold mb-1">
              {{ $t('t-procedures') }}
            </h4>
            <p class="text-muted mb-0">{{ activePlanProcedures.length }} {{ $t('t-procedures').toLowerCase() }}</p>
          </div>

          <v-text-field
            v-model="healthPlanProcedureSearch"
            class="plan-search"
            density="compact"
            hide-details
            variant="outlined"
            prepend-inner-icon="ph-magnifying-glass"
            :placeholder="$t('t-search-for-hospital-procedures')"
          />
        </div>

        <v-progress-linear v-if="hospitalProcedureStore.loading" color="primary" indeterminate rounded class="mb-4" />

        <v-alert
          v-if="!hospitalProcedureStore.loading && filteredPlanProcedures.length === 0"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          {{ $t('t-no-procedures-found') }}
        </v-alert>

        <div v-else class="procedure-table-wrap">
          <v-table density="compact" fixed-header height="560" class="procedure-table">
            <thead>
              <tr>
                <th style="width: 12%">{{ $t('t-code') }}</th>
                <th>{{ $t('t-procedures') }}</th>
                <th style="width: 18%">{{ $t('t-limit-type') }}</th>
                <th style="width: 15%">{{ $t('t-fixed-amount') }}</th>
                <th style="width: 12%">{{ $t('t-percentage') }}</th>
                <th style="width: 18%">{{ $t('t-allowed-frequency-use-frequency') }}</th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="group in groupedPlanProcedureGroups"
                :key="group.group"
              >
                <tr class="group-row">
                  <td colspan="6">
                    <div class="d-flex align-center justify-space-between">
                      <span>
                        <i class="ph-stack me-2" />
                        {{ group.group }}
                      </span>
                      <v-chip color="secondary" variant="flat" size="x-small">
                        {{ group.procedures.length }}
                      </v-chip>
                    </div>
                  </td>
                </tr>

                <tr v-if="groupUsesGroupLimit(group.procedures)" class="group-limit-row">
                  <td colspan="2">Limite do grupo</td>
                  <td>{{ getGroupLimitLabel(group.procedures) }}</td>
                  <td>{{ formatPlanMoney(getGroupFixedAmount(group.procedures)) }}</td>
                  <td>{{ formatPlanPercent(getGroupPercentage(group.procedures)) }}</td>
                  <td>{{ getGroupFrequencyLabel(group.procedures) }}</td>
                </tr>

                <template
                  v-for="category in group.categories"
                  :key="`${group.group}-${category.category}`"
                >
                  <tr class="category-row">
                    <td colspan="6">
                      <div class="d-flex align-center justify-space-between">
                        <span>
                          <i class="ph-folder-open me-2" />
                          {{ category.category }}
                        </span>
                        <span class="text-caption">{{ category.procedures.length }} {{ $t('t-procedures').toLowerCase() }}</span>
                      </div>
                    </td>
                  </tr>

                  <tr
                    v-for="procedure in category.procedures"
                    :key="procedure.id"
                    class="procedure-row"
                  >
                    <td class="font-weight-medium text-primary">
                      {{ getProcedureCode(procedure) || '-' }}
                    </td>
                    <td>
                      <div class="font-weight-medium">{{ getProcedureName(procedure) }}</div>
                    </td>
                    <td>{{ procedureUsesGroupLimit(procedure) ? '-' : getProcedureLimitLabel(procedure) }}</td>
                    <td>{{ procedureUsesGroupLimit(procedure) ? '-' : formatPlanMoney(getProcedureFixedAmount(procedure)) }}</td>
                    <td>{{ procedureUsesGroupLimit(procedure) ? '-' : formatPlanPercent(getProcedurePercentage(procedure)) }}</td>
                    <td>{{ procedureUsesGroupLimit(procedure) ? '-' : getFrequencyLabel(procedure) }}</td>
                  </tr>
                </template>
              </template>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-card-actions v-if="!props.isViewMode && (previousStep || nextStep)" class="d-flex justify-space-between mt-5">
    <v-btn v-if="previousStep" color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', previousStep)">
      <i class="ph-arrow-left me-2" /> {{ $t('t-back') }}
    </v-btn>
    <v-btn v-if="nextStep" color="secondary" variant="elevated" @click="$emit('onStepChange', nextStep)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>

  </v-card-actions>
</template>

<style scoped>
.health-plan-preview {
  border-radius: 18px;
  overflow: hidden;
}

.health-plan-preview__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 20px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-secondary), 0.08)),
    rgb(var(--v-theme-surface));
}

.plan-metric {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  padding: 16px;
}

.plan-metric span {
  display: block;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.78rem;
  margin-bottom: 4px;
}

.plan-metric strong {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.15rem;
}

.plan-metric--success strong {
  color: rgb(var(--v-theme-success));
}

.plan-search {
  max-width: 360px;
  min-width: 260px;
}

.procedure-table-wrap {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  overflow: hidden;
}

.procedure-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.procedure-table :deep(thead tr),
.procedure-table :deep(thead th) {
  background: rgb(var(--v-theme-primary)) !important;
}

.procedure-table :deep(thead th) {
  border-bottom: 3px solid rgba(var(--v-theme-on-primary), 0.32) !important;
  box-shadow: 0 3px 10px rgba(var(--v-theme-primary), 0.24);
  color: rgb(var(--v-theme-on-primary)) !important;
  font-size: 0.74rem;
  font-weight: 900 !important;
  height: 52px;
  letter-spacing: 0.01em;
  line-height: 1.25;
  padding: 12px 14px;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  vertical-align: middle;
  white-space: normal;
  z-index: 3;
}

.procedure-table :deep(td) {
  font-size: 0.76rem;
  line-height: 1.35;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

.group-row td {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.4;
  padding: 12px 14px;
  vertical-align: middle;
}

.group-limit-row td {
  background: rgba(var(--v-theme-primary), 0.045);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  color: rgba(var(--v-theme-on-surface), 0.86);
  font-weight: 800;
  vertical-align: middle;
}

.group-limit-row td:first-child {
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
}

.category-row td {
  background: rgba(var(--v-theme-on-surface), 0.032);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 700;
  line-height: 1.4;
  padding: 11px 14px;
  vertical-align: middle;
}

.procedure-row td {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.procedure-row:hover td {
  background: rgba(var(--v-theme-primary), 0.045);
}

@media (max-width: 600px) {
  .health-plan-preview__hero {
    padding: 20px;
  }

  .plan-search {
    max-width: 100%;
    min-width: 100%;
  }
}
</style>
