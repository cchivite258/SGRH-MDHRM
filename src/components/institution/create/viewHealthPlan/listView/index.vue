<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { HealthPlanInsertType, HospitalProcedureListingType, HospitalProcedureInsertType } from "@/components/institution/types";
import { CoveragePeriodListingType, HealthPlanListingType } from "@/components/institution/types";
import TableActionView from "@/app/common/components/TableActionView.vue";
import ViewHospitalProcedureDialog from "@/components/institution/create/editHealthPlan/ViewHospitalProcedureDialog.vue";
import HealthPlanPreviewDialog from "@/components/institution/create/HealthPlanPreviewDialog.vue";
import HealthPlanHospitalProcedureGroupedRows from "@/components/institution/create/HealthPlanHospitalProcedureGroupedRows.vue";
import { useRouter } from "vue-router";
import { useHealthPlanStore } from "@/store/institution/healthPlanStore";
import { useHospitalProcedureStore } from "@/store/institution/hospitalProcedureStore";
import { healthPlanService, hospitalProcedureService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import DataTableServer from "@/app/common/components/DataTableServer.vue"; 
import { useCoveragePeriodStore } from '@/store/institution/coveragePeriodStore';
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import Status from "@/app/common/components/Status.vue";

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

const getHealthPlanIdFromRoute = () => {
  const id = route.params.id;
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
};

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
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-health-plan-limit') }}<i class="ph-asterisk ph-xs text-danger" />
            </div>
            <div>{{ getHealthPlanLimitLabel(healthPlanFormData.healthPlanLimit) || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-waiting-period-days') }}
            </div>
            <div>{{ healthPlanFormData.waitingPeriodDays ?? '-' }}</div>
          </v-col>
        </v-row>

        <v-row class="" v-if="healthPlanFormData.healthPlanLimit === 'FIXED_AMOUNT'">
          <!-- Campo Fixed Amount - aparece apenas quando healthPlanLimit for FIXED_AMOUNT -->
          <v-col cols="12" lg="6">
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
          <v-btn
            color="primary"
            variant="tonal"
            :loading="healthPlanConsultLoading"
            @click="onConsultHealthPlan"
          >
            <i class="ph-first-aid-kit me-1" /> {{ $t('t-consult-health-plan') }}
          </v-btn>
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
                    @toggle-selection="toggleSelection"
                  >
                    <template #action="{ item }">
                      <TableActionView @onView="onViewClick(item)" />
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

  <ViewHospitalProcedureDialog v-if="hospitalProcedureFormData" v-model="viewDialog"
    :data="hospitalProcedureFormData" />
</template>

