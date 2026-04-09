<script lang="ts" setup>
/**
 * TabContacts - Componente para  de pessoas de contato de instituições
 * 
 * Funcionalidades:
 * - Listagem de contatos
 * - Criação/Edição de contatos
 * - Visualização de detalhes
 * - Exclusão de contatos
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
import TableActionView from "@/app/common/components/TableActionView.vue";
import { formateDate } from "@/app/common/dateFormate";
import { formatCurrency } from '@/app/common/currencyFormat';
// Stores e Services
import { useHealthPlanEmployeeStore } from "@/store/employee/healthPlanStore";
import { dependentEmployeeService } from "@/app/http/httpServiceProvider";

// Types
import type {
  HealthPlanListingType
} from "@/components/employee/types";

// Utils
import { healthPlanHeader } from "@/components/employee/list/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const healthPlanStore = useHealthPlanEmployeeStore();


// Utils
import {
  genderOptions,
  relationshipOptions
} from "@/components/employee/create/utils";

// props
const props = defineProps({
  employeeId: {
    type: String as PropType<string | null>,
    default: null
  }
});

// Modifique a lógica para usar o prop employeeId
const employeeId = ref(props.employeeId);

// constants
const dialog = ref(false);
const viewDialog = ref(false);
const healthPlanData = ref<HealthPlanListingType | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "employee.id,allocatedBalance,usedBalance,remainingBalance,status,startDate,endDate,closingDate"; // Propriedades de busca
const itemsPerPage = ref(10);
const selectedhealthPlanData = ref<HealthPlanListingType[]>([]);

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

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
 * Busca pessoas de contato com paginação e filtros
 */
const fetchHealthPlanEmployee = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!employeeId.value) return;

  await healthPlanStore.fetchHealthPlanEmployee(
    employeeId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

//get dos enums
const getGenderLabel = (value: string) => {
  const option = genderOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getRelationshipLabel = (value: string) => {
  const option = relationshipOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};


/**
 * Alterna seleção de pessoas de contato
 */
const toggleSelection = (item: HealthPlanListingType) => {
  const index = selectedhealthPlanData.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedhealthPlanData.value = [...selectedhealthPlanData.value, item];
  } else {
    selectedhealthPlanData.value = selectedhealthPlanData.value.filter(selected => selected.id !== item.id);
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



/**
 * Prepara dados para visualização
 */
const onViewClick = (data: HealthPlanListingType) => {
 router.push({
  path: `/employee/healthPlan/view/${data.id}`,
  query: { employeeId: employeeId.value || undefined, tab: "5" }
 });
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
      <div>
        <!--<v-btn color="primary" class="mx-1" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-dependent') }}
        </v-btn>-->
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
      <DataTableServer v-model="selectedhealthPlanData"
        :headers="healthPlanHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="healthPlanStore.healthPlans" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" @load-items="fetchHealthPlanEmployee"
        item-value="id" show-select>
        <template #body="{ items }">
          <tr v-for="item in items as HealthPlanListingType[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedhealthPlanData.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ formatCurrency(item.allocatedBalance )}}</td>
            <td>{{ formatCurrency(item.usedBalance) }}</td>
            <td>{{ formatCurrency(item.remainingBalance) }}</td>
            <td>{{ formateDate(item.startDate) }}</td>
            <td>{{ formateDate(item.endDate) }}</td>
            <td>
              <TableActionView  @onView="onViewClick(item)"/>
            </td>
          </tr>
        </template>

        <template v-if="healthPlanStore.healthPlans.length === 0" #body>
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


  <v-card-actions class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 4)">
      {{ $t('t-back-to-dependents') }} 
    </v-btn>
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 6)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>
    
  </v-card-actions>
</template>
