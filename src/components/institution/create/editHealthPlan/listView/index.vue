<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { HealthPlanInsertType, HospitalProcedureListingType, HospitalProcedureInsertType } from "@/components/institution/types";
import { CoveragePeriodListingType, HealthPlanListingType } from "@/components/institution/types";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateEditHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/CreateEditHospitalProcedureDialog.vue";
import ViewHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/ViewHospitalProcedureDialog.vue";
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
import { useHospitalProcedureGroupStore } from "@/store/baseTables/hospitalProcedureGroupStore";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import Status from "@/app/common/components/Status.vue"; 
import { getApiErrorMessages } from "@/app/common/apiErrors";
import type { HospitalProcedureGroupListing } from "@/components/baseTables/hospitalProcedureGroup/types";

//Options Enums
import {
  healthPlanLimitOptions,
  salaryComponentOptions
} from "@/components/institution/create/utils";

// Utils
import { hospitalProcedureHeader } from "@/components/institution/create/utils";
import { limitTypeDefinitionOptions } from "@/components/institution/create/utils";

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
const selectedGroupId = ref<string>("");
const baseSearchProps = "hospitalProcedureType.name,limitTypeDefinition,hospitalProcedureGroup.name";
const loading = ref(false);

// Computed properties
const loadingList = computed(() => hospitalProcedureStore.loading);
const totalItems = computed(() => hospitalProcedureStore.pagination.totalElements);

// Formulário do plano de saúde
const healthPlanFormData = ref<HealthPlanInsertType>({
  id: healthPlanId.value || undefined,
  maxNumberOfDependents: 0,
  childrenInUniversityMaxAge: 0,
  childrenMaxAge: 0,
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

const hospitalProcedureGroups = computed(() => {
  return (hospitalProcedureGroupStore.hospital_procedure_groups_dropdown || []).map((item: HospitalProcedureGroupListing) => ({
    value: item.id,
    label: item.name
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

        // Carrega períodos de cobertura
        await coveragePeriodStore.fetchCoveragePeriodsForDropdown(healthPlan.company?.id, 0, 10000000);
        await hospitalProcedureGroupStore.fetchHospitalProcedureGroupsForDropdown(0, 10000000);

        healthPlanFormData.value = {
          id: healthPlan.id,
          maxNumberOfDependents: healthPlan.maxNumberOfDependents,
          childrenInUniversityMaxAge: healthPlan.childrenInUniversityMaxAge,
          childrenMaxAge: healthPlan.childrenMaxAge,
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
      toast.error(t('t-message-load-error'));
      console.error("Erro ao carregar dados dos procedimentos hospitalares:", e);
    }
  }
});


interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

const fetchHospitalProceduresOfPlan = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  const planIdFromRoute = getHealthPlanIdFromRoute();
  if (!planIdFromRoute) return;

  const hasGroupFilter = !!selectedGroupId.value;
  const hasSearchText = !!search;

  const query_props = hasGroupFilter
    ? (hasSearchText ? `hospitalProcedureGroup.id,${baseSearchProps}` : "hospitalProcedureGroup.id")
    : baseSearchProps;

  const query_value = hasGroupFilter
    ? (hasSearchText ? `${selectedGroupId.value},${search}` : selectedGroupId.value)
    : search;

  await hospitalProcedureStore.fetchHospitalProceduresOfPlan(
    planIdFromRoute,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    query_value,
    query_props
  );
};

watch(selectedGroupId, async () => {
  await fetchHospitalProceduresOfPlan({
    page: 1,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
    search: searchQuery.value
  });
});

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
    hospitalProcedureGroup: data?.hospitalProcedureGroup ?? (data as any)?.hospitalProcedureGroupId ?? null,
    groupFixedAmount: data?.groupFixedAmount ?? null,
    groupPercentage: data?.groupPercentage ?? null,
    hospitalProcedureGroupLimit: data?.hospitalProcedureGroupLimit ?? null,
    belongsToGroup: data?.belongsToGroup ?? false,
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
  hospitalProcedureFormData.value = { ...data };
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
    toast.error(t('t-toast-message-deleted-erros'));
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
const getLimitTypeLabel = (value: string) => {
  const option = limitTypeDefinitionOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getHospitalProcedureGroupName = (item: HospitalProcedureListingType) => {
  if (!item.belongsToGroup) return "Sem grupo";

  const group = item.hospitalProcedureGroup as string | { name?: string; id?: string | number } | null | undefined;
  if (!group) return "Grupo sem nome";
  if (typeof group === "string") return group;
  return group.name || (group.id != null ? String(group.id) : "Grupo sem nome");
};

const getDisplayFixedAmount = (item: HospitalProcedureListingType) => {
  const value = item.belongsToGroup ? item.groupFixedAmount : item.fixedAmount;
  return value ?? "-";
};

const getDisplayPercentage = (item: HospitalProcedureListingType) => {
  const value = item.belongsToGroup ? item.groupPercentage : item.percentage;
  return value !== null && value !== undefined ? `${value}%` : "-";
};

const getDisplayLimitType = (item: HospitalProcedureListingType) => {
  const limitType = item.belongsToGroup ? item.hospitalProcedureGroupLimit : item.limitTypeDefinition;
  return getLimitTypeLabel(limitType || "");
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
          <v-col :cols="12" :lg="healthPlanFormData.healthPlanLimit === 'ANUAL_SALARY' ? 12 : 6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-health-plan-limit') }}<i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="healthPlanFormData.healthPlanLimit" :items="healthPlanLimitOptions"
              :rules="requiredRules.healthPlanLimit" />
          </v-col>

          <!-- Campo Fixed Amount - aparece apenas quando healthPlanLimit for FIXED_AMOUNT -->
          <v-col cols="12" lg="6" v-if="healthPlanFormData.healthPlanLimit === 'FIXED_AMOUNT'">
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
          <div>
            <v-btn color="primary" class="mx-1" @click="onCreateEditClick(null)">
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
                  <v-col cols="12" lg="8">
                    <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-hospital-procedure')" />
                  </v-col>
                  <v-col cols="12" lg="4">
                    <MenuSelect
                      v-model="selectedGroupId"
                      :items="hospitalProcedureGroups"
                      :placeholder="'Filtrar por grupo'"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
              <DataTableServer v-model="selectedHospitalProcedures"
                :headers="hospitalProcedureHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                :items="hospitalProcedureStore.hospital_procedure_of_plan" :items-per-page="itemsPerPage"
                :total-items="totalItems" :loading="loadingList" :search-query="searchQuery" :search-props="baseSearchProps"
                @load-items="fetchHospitalProceduresOfPlan" item-value="id" show-select>
                <template #body="{ items }">
                  <tr v-for="item in items as HospitalProcedureListingType[]" :key="item.id" height="50">
                    <td>
                      <v-checkbox :model-value="selectedHospitalProcedures.some(selected => selected.id === item.id)"
                        @update:model-value="toggleSelection(item)" hide-details density="compact" />
                    </td>
                    <td>{{ item.hospitalProcedureType.name }}</td>
                    <td>
                      <div class="group-cell" :class="{ 'group-cell--grouped': item.belongsToGroup }">
                        <span class="group-dot" />
                        <div class="group-text">
                          <span class="group-name">{{ getHospitalProcedureGroupName(item) }}</span>
                          <span class="group-state">{{ item.belongsToGroup ? 'Agrupado' : 'Individual' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ getDisplayLimitType(item) }}</td>
                    <td>{{ getDisplayFixedAmount(item) }}</td>
                    <td>{{ getDisplayPercentage(item) }}</td>
                    <td>
                      <Status :status="item.enabled ? 'enabled' : 'disabled'" />
                    </td>
                    <td>
                      <TableAction @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)"
                        @onDelete="onDelete(item.id)" />
                    </td>
                  </tr>
                </template>

                <template v-if="hospitalProcedureStore.hospital_procedure_of_plan.length === 0" #body>
                  <tr>
                    <td :colspan="hospitalProcedureHeader.length" class="text-center py-10">
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



  <CreateEditHospitalProcedureDialog v-if="hospitalProcedureFormData" v-model="dialog" :data="hospitalProcedureFormData"
    @onSubmit="onSubmitHospitalProcedure" />

  <ViewHospitalProcedureDialog v-if="hospitalProcedureFormData" v-model="viewDialog"
    :data="hospitalProcedureFormData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" :loading="deleteLoading"
    @onConfirm="onConfirmDelete" />
</template>

<style scoped>
.group-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.35);
  flex-shrink: 0;
}

.group-cell--grouped .group-dot {
  background: rgb(var(--v-theme-info));
}

.group-text {
  display: flex;
  flex-direction: column;
  line-height: 1.02;
}

.group-name {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.82);
}

.group-cell--grouped .group-name {
  font-weight: 600;
}

.group-state {
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}
</style>
