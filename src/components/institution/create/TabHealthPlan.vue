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
import { healthPlanService } from "@/app/http/httpServiceProvider";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";

// Types
import type {
  HealthPlanListingType,
  HealthPlanInsertType,
  HealthPlanCloneType
} from "@/components/institution/types";

// Utils
import { healthPlanHeader, healthPlanLimitOptions, salaryComponentOptions } from "@/components/institution/create/utils";
import { healthPlanOptions as Options } from "@/components/institution/create/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const healthPlanStore = useHealthPlanStore();

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
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const healthPlanData = ref<HealthPlanInsertType | HealthPlanListingType | null>(null);
const healthPlanDataView = ref<HealthPlanListingType | null>(null);
const deleteId = ref<string | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "maxNumberOfDependents,childrenMaxAge,healthPlanLimit,fixedAmount,salaryComponent,companyContributionPercentage";
const itemsPerPage = ref(10);
const selectedHealthPlans = ref<HealthPlanListingType[]>([]);
const customerDetail = ref<any>(null); // Adicionado para resolver o erro
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const healthPlanCloneDialog = ref(false);
const healthPlanId = ref<string | null>(null);
const healthPlanCloneLoading = ref(false);
// Computed properties
const loadingList = computed(() => healthPlanStore.loading);
const totalItems = computed(() => healthPlanStore.pagination.totalElements);

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
  return option ? option.label : value;
};

const getsalaryComponentLabel = (value: string | undefined) => {
  const option = salaryComponentOptions.find(opt => opt.value === value);
  return option ? option.label : value;
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

  // Se o status for RUNNING, remove as opções de editar e deletar
  if (invoice.coveragePeriod?.status === 'RUNNING') {
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
  <Card :title="$t('t-health-plan-list')" title-class="py-5">
    <template v-if="!props.isViewMode" #title-action>
      <div>
        <v-btn color="primary" class="mx-1" @click="onCreateEditClick(null)">
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
        item-value="id" :show-select="!props.isViewMode">
        <template #body="{ items }">
          <tr v-for="item in items as HealthPlanListingType[]" :key="item.id" height="50">
            <td v-if="!props.isViewMode">
              <v-checkbox :model-value="selectedHealthPlans.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
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

  <v-card-actions v-if="!props.isViewMode" class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 2)">
      {{ $t('t-back-to-period') }} <i class="ph-arrow-left ms-2" />
    </v-btn>
    <v-btn color="success" variant="elevated" @click="$emit('onStepChange', 4)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>

  </v-card-actions>
</template>



