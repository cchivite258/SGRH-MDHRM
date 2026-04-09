<script lang="ts" setup>
/**
 * TabExpensesperProcedure - Componente para despesas por procedimento
 */

import { ref, watch, computed, onMounted, onBeforeUnmount, PropType } from "vue";
import { useI18n } from "vue-i18n";

// Components
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { formatCurrency } from '@/app/common/currencyFormat';

// Stores
import { useHospitalProcedureBalanceStore } from "@/store/employee/hospitalProcedureBalanceStore";

// Types
import type { ExpensePerProcedureType } from "@/components/employee/types";

// Utils
import { hospitalProcedureBalanceHeader } from "@/components/employee/list/utils";

const { t } = useI18n();
const hospitalProcedureBalanceStore = useHospitalProcedureBalanceStore();

// Props
const props = defineProps({
  employeeId: {
    type: String as PropType<string | null>,
    default: null
  }
});

// Refs
const searchQuery = ref("");
const itemsPerPage = ref(10);
const selectedProcedures = ref<ExpensePerProcedureType[]>([]);
const isInitialLoad = ref(true);

// Computed properties
const loadingProcedures = computed(() => hospitalProcedureBalanceStore.loadingProcedures);
const totalItems = computed(() => hospitalProcedureBalanceStore.pagination.totalElements);
const procedures = computed(() => hospitalProcedureBalanceStore.expensePerProcedure);
const hasActivePlan = computed(() => hospitalProcedureBalanceStore.hasActivePlan);
const activePlanInfo = computed(() => {
  if (!hospitalProcedureBalanceStore.activeHealthPlan) return '';
  const plan = hospitalProcedureBalanceStore.activeHealthPlan;
  return `Plano: ${plan.id || 'N/A'} - Saldo: ${formatCurrency(plan.remainingBalance || 0)}`;
});

// Inicialização
onMounted(async () => {
  if (props.employeeId) {
    await initializeComponent();
  }
});

// Watch employeeId prop - importante para quando mudar de employee
watch(() => props.employeeId, async (newId, oldId) => {
  if (newId !== oldId && newId) {
    await initializeComponent();
  }
});

/**
 * Inicializa o componente
 */
const initializeComponent = async () => {
  if (!props.employeeId) return;
  
  isInitialLoad.value = true;
  
  // Primeiro carrega o plano ativo
  await hospitalProcedureBalanceStore.loadActiveHealthPlan(props.employeeId);
  
  // Se há plano ativo, carrega os procedimentos iniciais
  if (hospitalProcedureBalanceStore.hasActivePlan) {
    await fetchProcedures({
      page: 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
      search: searchQuery.value
    });
  }
  
  isInitialLoad.value = false;
};

/**
 * Busca procedimentos com paginação
 */
const fetchProcedures = async ({ page, itemsPerPage, sortBy, search }: {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}) => {
  if (!props.employeeId) return;

  // Usa o método fetchProcedures que garante a ordem correta
  await hospitalProcedureBalanceStore.fetchProcedures(
    props.employeeId,
    {
      page: page - 1, // Ajuste para API
      size: itemsPerPage,
      sortColumn: sortBy[0]?.key || 'createdAt',
      direction: sortBy[0]?.order || 'asc',
      query_value: search,
      query_props: "hospitalProcedureType.name,allocatedBalance,usedBalance,remainingBalance,groupAllocatedBalance,groupUsedBalance,groupRemainingBalance"
    }
  );
};

/**
 * Alterna seleção de procedimentos
 */
const toggleSelection = (item: ExpensePerProcedureType) => {
  const index = selectedProcedures.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedProcedures.value = [...selectedProcedures.value, item];
  } else {
    selectedProcedures.value = selectedProcedures.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Atualiza dados do plano ativo
 */
const refreshPlan = async () => {
  if (!props.employeeId) return;
  
  isInitialLoad.value = true;
  await initializeComponent();
  isInitialLoad.value = false;
};

const isGroupedProcedure = (item: ExpensePerProcedureType) => {
  return Boolean(item.belongsToGroup ?? item.companyHealthPlanHospitalProcedures?.belongsToGroup);
};

const getDisplayAllocatedBalance = (item: ExpensePerProcedureType) => {
  const value = isGroupedProcedure(item) ? item.groupAllocatedBalance : item.allocatedBalance;
  return formatCurrency(value ?? 0);
};

const getDisplayUsedBalance = (item: ExpensePerProcedureType) => {
  const value = isGroupedProcedure(item) ? item.groupUsedBalance : item.usedBalance;
  return formatCurrency(value ?? 0);
};

const getDisplayRemainingBalance = (item: ExpensePerProcedureType) => {
  const value = isGroupedProcedure(item) ? item.groupRemainingBalance : item.remainingBalance;
  return formatCurrency(value ?? 0);
};

// Limpeza ao desmontar
onBeforeUnmount(() => {
  // Limpa apenas os dados deste componente
  selectedProcedures.value = [];
  hospitalProcedureBalanceStore.clearProcedures();
});
</script>

<template>
  <Card :title="$t('t-procedures-expenses-list')" title-class="py-5">
    <template #title-action>
      <div class="d-flex align-center gap-2">
        <!-- Informação do plano ativo -->
       <!-- <v-chip 
          v-if="hasActivePlan" 
          color="success" 
          variant="tonal" 
          size="small"
          class="text-caption"
        >
          <i class="ph-check-circle me-1"></i>
          {{ activePlanInfo }}
        </v-chip>-->
        
        <!-- Botão para atualizar -->
        <!--<v-btn 
          color="primary" 
          variant="tonal" 
          size="small" 
          @click="refreshPlan"
          :loading="hospitalProcedureBalanceStore.loadingPlans"
          :disabled="!props.employeeId"
        >
          <i class="ph-arrow-clockwise me-1"></i>
          {{ $t('t-refresh') }}
        </v-btn>-->
      </div>
    </template>
  </Card>

  <!-- Mensagem se não houver plano ativo -->
  <!--<v-alert 
    v-if="!hasActivePlan && !isInitialLoad && props.employeeId" 
    type="info" 
    class="mt-4"
    density="comfortable"
  >
    <i class="ph-info me-2"></i>
    {{ $t('t-no-active-health-plan') }}
  </v-alert>-->

  <!-- Mensagem durante carregamento inicial -->
  <!--<v-alert 
    v-if="isInitialLoad && props.employeeId" 
    type="info" 
    class="mt-4"
    density="comfortable"
  >
    <i class="ph-circle-notch ph-spin me-2"></i>
    {{ $t('t-loading-plan') }}
  </v-alert>-->

  <!-- Tabela de procedimentos -->
  <v-row v-if="hasActivePlan && props.employeeId" class="mt-5">
    <v-col cols="12" lg="12">
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="12">
            <QuerySearch 
              v-model="searchQuery" 
              :placeholder="$t('t-search-for-hospital-procedures')" 
              :disabled="loadingProcedures"
            />
          </v-col>
        </v-row>
      </v-card-text>
      
      <DataTableServer
        v-model="selectedProcedures"
        :headers="hospitalProcedureBalanceHeader.map(item => ({ 
          ...item, 
          title: $t(`t-${item.title}`) 
        }))"
        :items="procedures"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        :loading="loadingProcedures"
        :search-query="searchQuery"
        @load-items="fetchProcedures"
        item-value="id"
        show-select
      >
        <template #body="{ items }">
          <tr v-for="item in items as ExpensePerProcedureType[]" :key="item.id" height="50">
            <td>
              <v-checkbox 
                :model-value="selectedProcedures.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" 
                hide-details 
                density="compact"
                :disabled="!item.enabled"
              />
            </td>
            <td>{{ item.hospitalProcedureType?.name || 'N/A' }}</td>
            <td>{{ getDisplayAllocatedBalance(item) }}</td>
            <td>{{ getDisplayUsedBalance(item) }}</td>
            <td>{{ getDisplayRemainingBalance(item) }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
          </tr>
        </template>

        <template v-if="procedures.length === 0 && !loadingProcedures" #body>
          <tr>
            <td :colspan="hospitalProcedureBalanceHeader.length" class="text-center py-10">
              <v-avatar size="80" color="primary" variant="tonal">
                <i class="ph-magnifying-glass" style="font-size: 30px" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold mt-3">
                {{ $t('t-no-procedures-found') }}
              </div>
              <div class="text-caption text-medium-emphasis mt-2">
                {{ $t('t-no-procedures-for-active-plan') }}
              </div>
            </td>
          </tr>
        </template>
      </DataTableServer>
    </v-col>
  </v-row>

  <v-card-actions class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 5)">
      {{ $t('t-back-to-health-plan') }} 
    </v-btn>
  </v-card-actions>
</template>
