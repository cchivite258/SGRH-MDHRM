<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { HealthPlanInsertType, HospitalProcedureListingType, HospitalProcedureInsertType } from "@/components/institution/types";
import { CoveragePeriodListingType, HealthPlanListingType } from "@/components/institution/types";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateEditHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/CreateEditHospitalProcedureDialog.vue";
import ViewHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/ViewHospitalProcedureDialog.vue";
import HealthPlanPreviewDialog from "@/components/institution/create/HealthPlanPreviewDialog.vue";
import HealthPlanHospitalProcedureGroupedRows from "@/components/institution/create/HealthPlanHospitalProcedureGroupedRows.vue";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useHospitalProcedureStore } from "@/store/institution/hospitalProcedureStore";
import { healthPlanService, hospitalProcedureService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { useCoveragePeriodStore } from '@/store/institution/coveragePeriodStore';
import { useHospitalProcedureGroupStore } from '@/store/baseTables/hospitalProcedureGroupStore';
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";

//Options Enums
import {
  healthPlanLimitOptions,
  salaryComponentOptions
} from "@/components/institution/create/utils";

// Utils
import { hospitalProcedureHeader } from "@/components/institution/create/utils";
import { exportHealthPlanToPdf } from "@/components/institution/create/healthPlanPdfExporter";

// Store para periodos de cobertura
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const healthPlanStore = useHealthPlanStore();
const hospitalProcedureStore = useHospitalProcedureStore();
const coveragePeriodStore = useCoveragePeriodStore();
const hospitalProcedureGroupStore = useHospitalProcedureGroupStore();


let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const errorMsg = ref("");
const formulario = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Estado do componente
const healthPlanId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
});

const getHealthPlanIdFromRoute = () => {
  const id = route.params.id;
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
};


// Estado para posições
const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const hospitalProcedureFormData = ref<HospitalProcedureInsertType | HospitalProcedureListingType | null>(null);
const deleteId = ref<string | undefined>(undefined);
const selectedHospitalProcedures = ref<HospitalProcedureListingType[]>([]);
const itemsPerPage = ref(10);
const searchQuery = ref("");
const globalSearchProps = ["hospitalProcedureType.code", "hospitalProcedureType.name", "hospitalProcedureType.categoryName", "hospitalProcedureGroup.name"];
const loading = ref(false);
const healthPlanData = ref<any>(null);
const healthPlanPreviewDialog = ref(false);
const healthPlanConsultLoading = ref(false);
const healthPlanPdfExporting = ref(false);
const healthPlanPreviewProcedures = ref<HospitalProcedureListingType[]>([]);

// Computed properties
const loadingList = computed(() => hospitalProcedureStore.loading);
const totalItems = computed(() => hospitalProcedureStore.pagination.totalElements);
const visibleHospitalProcedureHeader = computed(() =>
  hospitalProcedureHeader.filter(item =>
    item.key !== "hospitalProcedureType.categoryName" && item.key !== "hospitalProcedureGroup"
  )
);
const hospitalProcedureTableColumnCount = computed(() => visibleHospitalProcedureHeader.value.length + 1);

const selectedCoveragePeriod = computed(() => {
  const coveragePeriod = healthPlanFormData.value.coveragePeriod as any;
  if (coveragePeriod && typeof coveragePeriod === "object") return coveragePeriod;

  const matchingPeriod = coveragePeriods.value.find(item => String(item.value) === String(coveragePeriod));
  return matchingPeriod
    ? { id: matchingPeriod.value, name: matchingPeriod.label }
    : healthPlanData.value?.coveragePeriod;
});

const healthPlanPreviewData = computed(() => ({
  ...healthPlanData.value,
  ...healthPlanFormData.value,
  coveragePeriod: selectedCoveragePeriod.value,
  company: healthPlanData.value?.company || { id: healthPlanFormData.value.company },
  companyName: healthPlanData.value?.company?.name || healthPlanData.value?.companyName
}));

const healthPlanPreviewContextLabel = computed(() =>
  healthPlanData.value?.company?.name || healthPlanData.value?.companyName || undefined
);

// Formulário do plano de saúde
const healthPlanFormData = ref<HealthPlanInsertType>({
  id: healthPlanId.value || undefined,
  maxNumberOfDependents: 0,
  childrenInUniversityMaxAge: 0,
  childrenMaxAge: 0,
  waitingPeriodDays: 0,
  healthPlanLimit: "",
  fixedAmount: 0,
  salaryComponent: "",
  companyContributionPercentage: 0,
  coveragePeriod: "",
  company: "",
  enabled: true
});


/**
 * Regras de validação para os campos do formulário
 */
const hasNumericValue = (v: number | string | null | undefined) =>
  v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v));

const requiredRules = {
  maxNumberOfDependents: [
    (v: number) => hasNumericValue(v) || t('t-please-enter-max-dependents'),
    (v: number) => Number(v) >= 0 || t('t-min-zero-dependents')
  ],
  childrenInUniversityMaxAge: [
    (v: number) => hasNumericValue(v) || t('t-please-enter-max-age-university'),
    (v: number) => Number(v) >= 0 || t('t-min-zero-age')
  ],
  waitingPeriodDays: [
    (v: number) => hasNumericValue(v) || t('t-please-enter-waiting-period-days'),
    (v: number) => Number(v) >= 0 || t('t-min-zero-days')
  ],
  childrenMaxAge: [
    (v: number) => hasNumericValue(v) || t('t-please-enter-max-age'),
    (v: number) => Number(v) >= 0 || t('t-min-zero-age')
  ],
  coveragePeriod: [
    (v: string) => !!v || t('t-please-select-coverage-period')
  ],
  healthPlanLimit: [
    (v: string) => !!v || t('t-please-select-plan-limit')
  ],
  // Regras condicionais como funções que verificam o contexto
  fixedAmount: [
    (v: number | null) =>
      healthPlanFormData.value.healthPlanLimit !== 'FIXED_AMOUNT' ||
      !!v ||
      t('t-please-enter-fixed-amount')
  ],
  salaryComponent: [
    (v: string | null) =>
      healthPlanFormData.value.healthPlanLimit !== 'ANUAL_SALARY' ||
      !!v ||
      t('t-please-select-salary-component')
  ],
  companyContributionPercentage: [
    (v: number | null) =>
      healthPlanFormData.value.healthPlanLimit !== 'ANUAL_SALARY' ||
      !!v ||
      t('t-please-enter-company-contribution-percentage')
  ]
};

const coveragePeriods = computed(() => {
  return (coveragePeriodStore.coverage_periods_for_dropdown || [])
    .filter((item: CoveragePeriodListingType) =>
      !item.status || item.status.toString().toUpperCase() 
    )
    .map((item: CoveragePeriodListingType) => ({
      value: item.id, 
      label: item.name,
    }));
});




// Buscar dados iniciais
onMounted(async () => {
  if (healthPlanId.value) {
    try {
      // Carrega dados do plano de saúde
      const healthplanResponse = await healthPlanService.getHealthPlanById(healthPlanId.value);
      console.log("Health Plan Response:", healthplanResponse.data);
      const healthPlan = healthplanResponse.data;

      if (healthPlan) {
        healthPlanData.value = healthPlan;

        // Carrega períodos de cobertura
        await coveragePeriodStore.fetchCoveragePeriodsForDropdown(healthPlan.company?.id, 0, 10000000);
        await hospitalProcedureGroupStore.fetchHospitalProcedureGroupsForDropdown(0, 10000000);

        healthPlanFormData.value = {
          id: healthPlan.id,
          maxNumberOfDependents: healthPlan.maxNumberOfDependents,
          childrenInUniversityMaxAge: healthPlan.childrenInUniversityMaxAge,
          childrenMaxAge: healthPlan.childrenMaxAge,
          waitingPeriodDays: healthPlan.waitingPeriodDays ?? 0,
          healthPlanLimit: healthPlan.healthPlanLimit,
          fixedAmount: healthPlan.fixedAmount,
          salaryComponent: healthPlan.salaryComponent,
          companyContributionPercentage: healthPlan.companyContributionPercentage,
          coveragePeriod: healthPlan.coveragePeriod.id,
          company: healthPlan.company?.id,
          enabled: healthPlan.enabled
        };

      }

      // Carrega posições do plano de saúde
      await fetchHospitalProceduresOfPlan({
        page: 1,
        itemsPerPage: itemsPerPage.value,
        sortBy: [],
        search: ""
      });
    } catch (e) {
      console.error("Erro ao carregar dados dos procedimentos hospitalares:", e);
      getApiErrorMessages(e, t('t-message-load-error')).forEach((message) => toast.error(message));
    }
  }
});


interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

const fetchHospitalProceduresOfPlan = async ({ page, itemsPerPage, search }: FetchParams) => {
  const planIdFromRoute = getHealthPlanIdFromRoute();
  if (!planIdFromRoute) return;

  const trimmedSearch = search.trim();
  const props: string[] = [];
  const values: string[] = [];

  if (trimmedSearch) {
    globalSearchProps.forEach((prop) => {
      props.push(prop);
      values.push(trimmedSearch);
    });
  }

  const query_props = props.join(",");
  const query_value = values.join(",");

  await hospitalProcedureStore.fetchHospitalProceduresOfPlanScoped(
    planIdFromRoute,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    'categoryName',
    'asc',
    query_value,
    query_props
  );
};

const onConsultHealthPlan = async () => {
  const planIdFromRoute = getHealthPlanIdFromRoute();
  if (!planIdFromRoute) return;

  healthPlanConsultLoading.value = true;

  try {
    const { content } = await hospitalProcedureService.getHospitalProcedureByHealthPlan(
      planIdFromRoute,
      0,
      1000000000,
      "categoryName",
      "asc"
    );

    healthPlanPreviewProcedures.value = content;
    healthPlanPreviewDialog.value = true;
  } catch (error) {
    console.error("Erro ao consultar plano:", error);
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  } finally {
    healthPlanConsultLoading.value = false;
  }
};

const onExportHealthPlanPdf = async () => {
  const planIdFromRoute = getHealthPlanIdFromRoute();
  if (!planIdFromRoute) return;

  healthPlanPdfExporting.value = true;

  try {
    const { content } = await hospitalProcedureService.getHospitalProcedureByHealthPlanFull(
      planIdFromRoute,
      0,
      1000000000,
      "categoryName",
      "asc"
    );

    await exportHealthPlanToPdf({
      healthPlan: healthPlanPreviewData.value,
      procedures: content,
      contextLabel: healthPlanPreviewContextLabel.value
    });
  } catch (error) {
    console.error("Erro ao exportar plano de saude:", error);
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    healthPlanPdfExporting.value = false;
  }
};

const toggleSelection = (item: HospitalProcedureListingType) => {
  const index = selectedHospitalProcedures.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedHospitalProcedures.value = [...selectedHospitalProcedures.value, item];
  } else {
    selectedHospitalProcedures.value = selectedHospitalProcedures.value.filter(selected => selected.id !== item.id);
  }
};

// Modal de criação/edição de posição
const onCreateEditClick = (data: HospitalProcedureInsertType | HospitalProcedureListingType | null) => {
  hospitalProcedureFormData.value = {
    ...(data || {}),
    id: data?.id || undefined,
    fixedAmount: data?.fixedAmount ?? 0,
    percentage: data?.percentage ?? 0,
    limitTypeDefinition: data?.limitTypeDefinition || "",
    waitingPeriodDays: data?.waitingPeriodDays ?? 0,
    hospitalProcedureGroup: data?.hospitalProcedureGroup ?? (data as any)?.hospitalProcedureGroupId ?? null,
    groupFixedAmount: data?.groupFixedAmount ?? null,
    groupPercentage: data?.groupPercentage ?? null,
    hospitalProcedureGroupLimit: data?.hospitalProcedureGroupLimit ?? null,
    belongsToGroup: data?.belongsToGroup ?? false,
    limitType: data?.limitType ?? "NONE",
    frequencyInterval: data?.frequencyInterval ?? 0,
    allowedFrequencyUse: data?.allowedFrequencyUse ?? 0,
    hospitalProcedureType: data?.hospitalProcedureType || undefined,
    companyHealthPlan: healthPlanId.value || undefined,
    company: healthPlanFormData.value.company || undefined,
    enabled: data?.enabled ?? true
  };
  dialog.value = true;
};
const onSubmitHospitalProcedure = async (
  data: HospitalProcedureInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {

    let response: ServiceResponse<HospitalProcedureListingType>;

    if (!data.id) {
      response = await hospitalProcedureService.createHospitalProcedure(data);
    } else {
      response = await hospitalProcedureService.updateHospitalProcedure(data.id, data);
    }


    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      getApiErrorMessages(response.error, t('t-message-save-error')).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error });
      return;
    }

    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(data.id ? t('t-toast-message-update') : t('t-toast-message-created'));

    await fetchHospitalProceduresOfPlan({
      page: hospitalProcedureStore.pagination.currentPage + 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
      search: searchQuery.value
    });

    callbacks?.onSuccess?.();
  } catch (error: any) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

// Visualização de posição
const onViewClick = (data: HospitalProcedureListingType) => {
  const group = data.hospitalProcedureGroup as string | number | { id?: string | number } | null | undefined;
  const groupId = typeof group === "object" && group !== null ? group.id : group;

  hospitalProcedureFormData.value = {
    ...data,
    hospitalProcedureGroup: data.belongsToGroup && groupId != null
      ? { id: groupId, name: getHospitalProcedureGroupName(data) }
      : data.hospitalProcedureGroup
  };
  viewDialog.value = true;
};

// Exclusão de posição
const onDelete = (id: string | undefined) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await hospitalProcedureService.deleteHospitalProcedure(deleteId.value);
    selectedHospitalProcedures.value = selectedHospitalProcedures.value.filter(pos => pos.id !== deleteId.value);
    await fetchHospitalProceduresOfPlan({
      page: hospitalProcedureStore.pagination.currentPage + 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
      search: searchQuery.value
    });
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    getApiErrorMessages(error, t('t-toast-message-deleted-erros')).forEach((message) => toast.error(message));
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = undefined;
  }
};

// Voltar para lista de departamentos
// Adicione no início do seu script setup (junto com os outros imports)
const emit = defineEmits(['onStepChangeforDialog']);

// Depois modifique a função onBack para:
const onBack = () => {
  // Obtém o ID da instituição do departamento atual
  const institutionId = healthPlanFormData.value.company;
  console.log("Institution ID:", institutionId);

  if (institutionId) {
    // Navega para a rota de edição da instituição e força a tab 3
    router.push({
      path: `/institution/edit/${institutionId}`,
      query: { tab: '3' } // Adiciona o query param para a tab
    });
  } else {
    // Fallback caso não tenha institutionId
    router.push(`/institution/list/`);
  }
};


/**
 * Submete dados do formulário
 */
interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

// Salvar departamento
const handleSubmit = async () => {
  //console.log("Health Plan Form Data:", healthPlanFormData.value);


  if (!formulario.value) return;

  const { valid } = await formulario.value.validate();

  if (!valid) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  loading.value = true;
  try {
    let response: ServiceResponse<HealthPlanListingType>;

    if (healthPlanFormData.value.id) {
      response = await healthPlanService.updateHealthPlan(healthPlanFormData.value.id, healthPlanFormData.value);
    } else {
      response = await healthPlanService.createHealthPlan(healthPlanFormData.value);
    }


    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      getApiErrorMessages(response.error, t('t-message-save-error')).forEach((message) => toast.error(message));
      return;
    }

    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(healthPlanFormData.value.id ? t('t-toast-message-update') : t('t-toast-message-created'));

    await healthPlanStore.fetchHealthPlans(healthPlanFormData.value.company);

  } catch (error: any) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    loading.value = false;
  }
};

/**
 * Prepara dados para criação/edição
 */
const getHospitalProcedureGroupName = (item: HospitalProcedureListingType) => {
  if (!item.belongsToGroup) return "Sem grupo";

  const group = item.hospitalProcedureGroup as string | number | { name?: string; id?: string | number } | null | undefined;
  if (!group) return "Grupo sem nome";

  if (typeof group === "object" && group.name) return group.name;

  const groupId = typeof group === "object" ? group.id : group;
  const matchingGroup = hospitalProcedureGroupStore.hospital_procedure_groups_dropdown.find(
    option => String(option.id) === String(groupId)
  );

  return matchingGroup?.name || "Grupo sem nome";
};

</script>

<template>
  <Card title="">
    <v-form ref="formulario" @submit.prevent="handleSubmit">
      <v-card-text>
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-2">
              {{ $t('t-coverage-period') }} <i class="ph-asterisk ph-xs text-danger" /> 
            </div>
            <MenuSelect v-model="healthPlanFormData.coveragePeriod" :items="coveragePeriods"
              :loading="coveragePeriodStore.loading" :rules="requiredRules.coveragePeriod" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-number-of-dependents') }}<i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model.number="healthPlanFormData.maxNumberOfDependents"
              :placeholder="t('t-enter-maximum-number-of-dependents')" :rules="requiredRules.maxNumberOfDependents"
              type="number" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-age-of-dependents') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model.number="healthPlanFormData.childrenMaxAge"
              :placeholder="t('t-enter-maximum-age-of-dependents')" type="number" :rules="requiredRules.childrenMaxAge"
              class="mb-2" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-age-of-dependents-in-university') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model.number="healthPlanFormData.childrenInUniversityMaxAge"
              :placeholder="t('t-enter-maximum-age-of-dependents-in-university')" type="number"
              :rules="requiredRules.childrenInUniversityMaxAge" class="mb-2" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <!-- Health Plan Limit - Expande para 12 colunas quando for ANUAL_SALARY -->
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-health-plan-limit') }}<i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="healthPlanFormData.healthPlanLimit" :items="healthPlanLimitOptions"
              :rules="requiredRules.healthPlanLimit" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-waiting-period-days') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model.number="healthPlanFormData.waitingPeriodDays"
              :placeholder="t('t-enter-waiting-period-days')" type="number"
              :rules="requiredRules.waitingPeriodDays" class="mb-2" />
          </v-col>
        </v-row>

        <v-row class="mt-n6" v-if="healthPlanFormData.healthPlanLimit === 'FIXED_AMOUNT'">
          <!-- Campo Fixed Amount - aparece apenas quando healthPlanLimit for FIXED_AMOUNT -->
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-fixed-amount') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model.number="healthPlanFormData.fixedAmount" type="number"
              :placeholder="t('t-enter-fixed-amount')" :rules="requiredRules.fixedAmount" class="mb-2" />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <!-- Campo Salary Component - aparece apenas quando healthPlanLimit for ANUAL_SALARY -->
          <v-col cols="12" lg="6" v-if="healthPlanFormData.healthPlanLimit === 'ANUAL_SALARY'">
            <div class="font-weight-bold mb-2">
              {{ $t('t-salary-component') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="healthPlanFormData.salaryComponent" :items="salaryComponentOptions"
              :rules="requiredRules.salaryComponent" />
          </v-col>

          <!-- Campo Company Contribution - aparece apenas quando healthPlanLimit for ANUAL_SALARY -->
          <v-col cols="12" lg="6" v-if="healthPlanFormData.healthPlanLimit === 'ANUAL_SALARY'">
            <div class="font-weight-bold mb-2">
              {{ $t('t-company-contribuition-percentage') }}
            </div>
            <TextField v-model="healthPlanFormData.companyContributionPercentage"
              :placeholder="t('t-enter-company-contribuition-percentage')" type="number" class="mb-2"
              :rules="requiredRules.companyContributionPercentage" />
          </v-col>
        </v-row>
        <v-row :class="healthPlanFormData.healthPlanLimit === 'ANUAL_SALARY' ? 'mt-n6' : ''">
          <v-col cols="12" lg="12" class="">
            <div class="font-weight-bold">{{ $t('t-availability') }}</div>
            <v-checkbox v-model="healthPlanFormData.enabled" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-is-enabled') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>

    <v-card-text>
      <Card :title="$t('t-hospital-procedure-list')" title-class="pt-0">
        <template #title-action>
          <div class="d-flex align-center flex-wrap justify-end ga-2">
            <v-btn
              color="primary"
              variant="tonal"
              :loading="healthPlanConsultLoading"
              @click="onConsultHealthPlan"
            >
              <i class="ph-first-aid-kit me-1" /> {{ $t('t-consult-health-plan') }}
            </v-btn>

            <v-btn color="secondary" class="mx-1" @click="onCreateEditClick(null)">
              <i class="ph-plus-circle me-1" /> {{ $t('t-add-hospital-procedure') }}
            </v-btn>
          </div>
        </template>
      </Card>

      <v-row class="mt-n3">
        <v-col cols="12" lg="12">
          <v-card class="mt-5">
            <v-card-text>
              <v-card-text>
                <v-row>
                  <v-col cols="12" lg="12">
                    <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-hospital-procedure')" />
                  </v-col>
                </v-row>
              </v-card-text>
              <DataTableServer v-model="selectedHospitalProcedures"
                :headers="visibleHospitalProcedureHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                :items="hospitalProcedureStore.hospital_procedure_of_plan_scoped" :items-per-page="itemsPerPage"
                :total-items="totalItems" :loading="loadingList" :search-query="searchQuery" :search-props="globalSearchProps.join(',')"
                @load-items="fetchHospitalProceduresOfPlan" item-value="id" show-select>
                <template #body="{ items }">
                  <HealthPlanHospitalProcedureGroupedRows
                    :items="items as HospitalProcedureListingType[]"
                    :selected-procedures="selectedHospitalProcedures"
                    :colspan="hospitalProcedureTableColumnCount"
                    :group-options="hospitalProcedureGroupStore.hospital_procedure_groups_dropdown"
                    @toggle-selection="toggleSelection"
                  >
                    <template #action="{ item }">
                      <TableAction
                        @onEdit="onCreateEditClick(item)"
                        @onView="onViewClick(item)"
                        @onDelete="onDelete(item.id)"
                      />
                    </template>
                  </HealthPlanHospitalProcedureGroupedRows>
                </template>

                <template v-if="hospitalProcedureStore.hospital_procedure_of_plan_scoped.length === 0" #body>
                  <tr>
                    <td :colspan="hospitalProcedureTableColumnCount" class="text-center py-10">
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
          </v-card>
        </v-col>
      </v-row>

      <v-card-actions class="d-flex justify-space-between mt-10">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack">
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
        </v-btn>
        <v-btn color="success" variant="elevated" :loading="loading" @click="handleSubmit">
          {{ $t('t-save') }}
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </Card>


  <HealthPlanPreviewDialog
    v-model="healthPlanPreviewDialog"
    :health-plan="healthPlanPreviewData"
    :procedures="healthPlanPreviewProcedures"
    :loading="healthPlanConsultLoading"
    :exporting="healthPlanPdfExporting"
    :context-label="healthPlanPreviewContextLabel"
    @export="onExportHealthPlanPdf"
  />

  <CreateEditHospitalProcedureDialog v-if="hospitalProcedureFormData" v-model="dialog" :data="hospitalProcedureFormData"
    @onSubmit="onSubmitHospitalProcedure" />

  <ViewHospitalProcedureDialog v-if="hospitalProcedureFormData" v-model="viewDialog"
    :data="hospitalProcedureFormData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" :loading="deleteLoading"
    @onConfirm="onConfirmDelete" />
</template>

