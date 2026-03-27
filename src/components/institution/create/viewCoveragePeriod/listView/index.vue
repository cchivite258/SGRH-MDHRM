<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { budgetHeader } from "@/components/institution/create/utils";
import { CoveragePeriodInsertType, BudgetInsertType, BudgetListingType, CoveragePeriodListingType } from "@/components/institution/types";
import TableActionView from "@/app/common/components/TableActionView.vue";
import CreateEditBudgetDialog from "@/components/institution/create/editCoveragePeriod/CreateEditBudgetDialog.vue";
import ViewBudgetModal from "@/components/institution/create/editCoveragePeriod/ViewBudgetModal.vue";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import { useBudgetStore } from "@/store/institution/budgetStore";
import { coveragePeriodsService, budgetService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { formateDate } from "@/app/common/dateFormate";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const coveragePeriodStore = useCoveragePeriodStore();
const budgetStore = useBudgetStore();

// Estado do componente
const coveragePeriodId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
});

// Formulário do departamento
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const data = ref<CoveragePeriodInsertType>({
  id: coveragePeriodId.value || undefined,
  name: "",
  startDate: new Date(),
  endDate: new Date(),
  company: undefined,
  enabled: true
});

// Estado para posições
const dialog = ref(false);
const viewDialog = ref(false);
const budgetFormData = ref<BudgetInsertType | BudgetListingType | null>(null);
const selectedBudgets = ref<BudgetListingType[]>([]);
const itemsPerPage = ref(10);
const searchProps = "name,description";
const searchQuery = ref("");

// Computed properties
const loadingList = computed(() => budgetStore.loading);
const totalItems = computed(() => budgetStore.pagination.totalElements);

// Buscar dados iniciais
onMounted(async () => {
  if (coveragePeriodId.value) {
    try {
      // Carrega dados do departamento
      const coveragePeriodResponse = await coveragePeriodsService.getCoveragePeriodById(coveragePeriodId.value);
      const period = coveragePeriodResponse.data;

      if (period) {
        data.value = {
          id: period.id,
          name: period.name,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
          company: period.company?.id,
          enabled: period.enabled
        };
      }

      // Carrega posições do departamento
      await fetchBudgetsForDropdown({
        page: 1,
        itemsPerPage: itemsPerPage.value,
        sortBy: [],
        search: ""
      });
    } catch (e) {
      toast.error(t('t-message-load-error'));
      console.error("Erro ao carregar dados do departamento:", e);
    }
  }
});


interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

const fetchBudgetsForDropdown = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!coveragePeriodId.value) return;

  await budgetStore.fetchBudgetsForDropdown(
    coveragePeriodId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'name',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

const toggleSelection = (item: BudgetListingType) => {
  const index = selectedBudgets.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedBudgets.value = [...selectedBudgets.value, item];
  } else {
    selectedBudgets.value = selectedBudgets.value.filter(selected => selected.id !== item.id);
  }
};


// Visualização de posição
const onViewClick = (data: BudgetListingType) => {
  budgetFormData.value = { ...data };
  viewDialog.value = true;
};



// Voltar para lista de departamentos
// Adicione no início do seu script setup (junto com os outros imports)
const emit = defineEmits(['onStepChangeforDialog']);

// Depois modifique a função onBack para:
const onBack = () => {
  // Obtém o ID da instituição do departamento atual
  const institutionId = data.value.company;
  console.log("Institution ID:", institutionId);

  if (institutionId) {
    // Navega para a rota de edição da instituição e força a tab 3
    router.push({
      path: `/institution/edit/${institutionId}`,
      query: { tab: '2' } // Adiciona o query param para a tab
    });
  } else {
    // Fallback caso não tenha institutionId
    router.push(`/institution/list/`);
  }
};


const formatAmount = (amount: number | undefined) => {
  if (amount === null || amount === undefined) return 'N/A';

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

</script>

<template>
  <Card title="">
    <v-card-text>
      <v-card>
        <v-card-text>
          <v-row class="">
            <v-col cols="12" lg="12" class="text-right">
              <Status :status="data?.enabled ? 'enabled' : 'disabled'" />
            </v-col>
          </v-row>
          <v-row class="">
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <div>{{ data.name || '-' }}</div>
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-start-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <div>{{ data?.startDate ? formateDate(data.startDate) : '-' }}</div>
            </v-col>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-end-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <div>{{ data?.endDate ? formateDate(data.endDate) : '-' }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-text>
      <Card :title="$t('t-budget-list')" title-class="pt-0">
        <template #title-action>
          <div>
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
                    <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-budget')" />
                  </v-col>
                </v-row>
              </v-card-text>
              <DataTableServer v-model="selectedBudgets"
                :headers="budgetHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                :items="budgetStore.budgets_for_dropdown" :items-per-page="itemsPerPage" :total-items="totalItems"
                :loading="loadingList" :search-query="searchQuery" :search-props="searchProps"
                @load-items="fetchBudgetsForDropdown">
                <template #body="{ items }">
                  <tr v-for="item in items as BudgetListingType[]" :key="item.id">
                    <td>
                      <v-checkbox :model-value="selectedBudgets.some(selected => selected.id === item.id)"
                        @update:model-value="toggleSelection(item)" hide-details density="compact" />
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.coveragePeriod?.name }}</td>
                    <td>{{ formatAmount(item.budgetAmount) }}</td>
                    <td>
                      <Status :status="item.enabled ? 'enabled' : 'disabled'" />
                    </td>
                    <td style="padding-right: 0px;">
                      <TableActionView @onView="onViewClick(item)" />
                    </td>
                  </tr>
                </template>

                <template v-if="budgetStore.budgets_for_dropdown.length === 0" #body>
                  <tr>
                    <td :colspan="budgetHeader.length" class="text-center py-10">
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
      </v-card-actions>
    </v-card-text>
  </Card>


  <ViewBudgetModal v-if="budgetFormData" v-model="viewDialog" :data="budgetFormData" />

</template>
