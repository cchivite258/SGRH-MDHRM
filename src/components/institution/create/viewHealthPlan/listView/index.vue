<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { HealthPlanInsertType, HospitalProcedureListingType, HospitalProcedureInsertType } from "@/components/institution/types";
import { CoveragePeriodListingType, HealthPlanListingType } from "@/components/institution/types";
import TableActionView from "@/app/common/components/TableActionView.vue";
import ViewHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/ViewHospitalProcedureDialog.vue";
import { useRouter } from "vue-router";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useHospitalProcedureStore } from "@/store/institution/hospitalProcedureStore";
import { healthPlanService, hospitalProcedureService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import DataTableServer from "@/app/common/components/DataTableServer.vue"; 
import { useCoveragePeriodStore } from '@/store/institution/coveragePeriodStore';
import { useHospitalProcedureGroupStore } from "@/store/baseTables/hospitalProcedureGroupStore";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import Status from "@/app/common/components/Status.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
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


// Estado para posições
const dialog = ref(false);
const viewDialog = ref(false);
const hospitalProcedureFormData = ref<HospitalProcedureInsertType | HospitalProcedureListingType | null>(null);
const selectedHospitalProcedures = ref<HospitalProcedureListingType[]>([]);
const itemsPerPage = ref(10);
const searchQuery = ref("");
const selectedGroupId = ref<string>("");
const baseSearchProps = "hospitalProcedureType.name,limitTypeDefinition";
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

const coveragePeriods = computed(() => {
  return (coveragePeriodStore.coverage_periods_for_dropdown || [])
    .filter((item: CoveragePeriodListingType) =>
      !item.status || item.status.toString().toUpperCase() !== 'CLOSED'
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
          coveragePeriod: healthPlan.coveragePeriod,
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

const getHealthPlanIdFromRoute = () => {
  const id = route.params.id;
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
};

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



// Visualização de posição
const onViewClick = (data: HospitalProcedureListingType) => {
  hospitalProcedureFormData.value = { ...data };
  viewDialog.value = true;
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
const getHealthPlanLimitLabel = (value: string | undefined) => {
  const option = healthPlanLimitOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getLimitTypeLabel = (value: string | undefined) => {
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

const getSalaryComponentLabel = (value: string | undefined) => {
  const option = salaryComponentOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

</script>

<template>
  <Card title="">
    <v-form ref="formulario" @submit.prevent="handleSubmit">
      <v-card-text>
        <v-row class="">
          <v-col cols="12" lg="12" class="text-right">
            <Status :status="healthPlanFormData?.enabled ? 'enabled' : 'disabled'" />
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-2">
              {{ $t('t-coverage-period') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ healthPlanFormData.coveragePeriod.name || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-number-of-dependents') }}<i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ healthPlanFormData.maxNumberOfDependents || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-age-of-dependents') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ healthPlanFormData.childrenMaxAge || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-maximum-age-of-dependents-in-university') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ healthPlanFormData.childrenInUniversityMaxAge || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="">
          <!-- Health Plan Limit - Expande para 12 colunas quando for ANUAL_SALARY -->
          <v-col :cols="12" :lg="healthPlanFormData.healthPlanLimit === 'ANUAL_SALARY' ? 12 : 6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-health-plan-limit') }}<i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ getHealthPlanLimitLabel(healthPlanFormData.healthPlanLimit) || '-' }}</div>
          </v-col>

          <!-- Campo Fixed Amount - aparece apenas quando healthPlanLimit for FIXED_AMOUNT -->
          <v-col cols="12" lg="6" v-if="healthPlanFormData.healthPlanLimit === 'FIXED_AMOUNT'">
            <div class="font-weight-bold mb-2">
              {{ $t('t-fixed-amount') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ healthPlanFormData.fixedAmount || '-' }}</div>
          </v-col>
        </v-row>

        <v-row class="">
          <!-- Campo Salary Component - aparece apenas quando healthPlanLimit for ANUAL_SALARY -->
          <v-col cols="12" lg="6" v-if="healthPlanFormData.healthPlanLimit === 'ANUAL_SALARY'">
            <div class="font-weight-bold mb-2">
              {{ $t('t-salary-component') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ getSalaryComponentLabel(healthPlanFormData.salaryComponent) || '-' }}</div>
          </v-col>

          <!-- Campo Company Contribution - aparece apenas quando healthPlanLimit for ANUAL_SALARY -->
          <v-col cols="12" lg="6" v-if="healthPlanFormData.healthPlanLimit === 'ANUAL_SALARY'">
            <div class="font-weight-bold mb-2">
              {{ $t('t-company-contribuition-percentage') }}
            </div>
            <div>{{ healthPlanFormData.companyContributionPercentage || '-' }}%</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>

    <v-card-text class="mt-6">
      <Card :title="$t('t-hospital-procedure-list')" title-class="pt-0">
        <template #title-action>
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
                      <TableActionView @onView="onViewClick(item)" />
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


  <ViewHospitalProcedureDialog v-if="hospitalProcedureFormData" v-model="viewDialog"
    :data="hospitalProcedureFormData" />
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

