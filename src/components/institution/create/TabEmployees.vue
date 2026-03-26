<script lang="ts" setup>
/**
 * TabEmployees - Componente para  de colaboradores da instituição
 *
 * Funcionalidades:
 * - Listagem de colaboradores
 * - Criação/Edição de colaboradores
 * - Visualização de detalhes
 * - Exclusão de colaboradores
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
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import TableAction from "@/app/common/components/TableAction.vue";
import { formateDate } from "@/app/common/dateFormate";
// Stores e Services
import { useEmployeeStore } from "@/store/employee/employeeStore";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { employeeService } from "@/app/http/httpServiceProvider"

// Types
import type {
  EmployeeListingType,
  EmployeeInsertType
} from "@/components/employee/types";

// Utils
import { employeeHeader } from "@/components/employee/list/utils";
import { coverageperiodOptions as Options } from "@/components/institution/create/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const employeeStore = useEmployeeStore();

// props
const props = defineProps({
  institutionId: {
    type: String as PropType<string | undefined>,
    default: undefined
  },
  isViewMode: {
    type: Boolean,
    default: false
  }
});

// Modifique a lógica para usar o prop institutionId
const institutionId = ref(props.institutionId);

// Estado do componente
const searchQuery = ref("")
const searchProps = "firstName,lastName,email,employeeNumber,phone" // Campos de pesquisa
const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)
const itemsPerPage = ref(10)
const selectedEmployees = ref<any[]>([]) /// Armazena os funcionários selecionados

// constants
const employeeData = ref<EmployeeInsertType | EmployeeListingType | null>(null);
const errorMsg = ref("");
const customerDetail = ref<any>(null); // Adicionado para resolver o erro
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const periodId = ref<string | null>(null);
// Computed properties
const loading = computed(() => employeeStore.loading);
const totalItems = computed(() => employeeStore.companyEmployeesPagination.totalElements);

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

/**
 * Busca períodos de cobertura com paginação e filtros
 */
const fetchCompanyEmployees = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!institutionId.value) return;

  await employeeStore.fetchCompanyEmployees(
    institutionId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    searchProps,
    search
  );
};

/**
 * Alterna seleção de pessoas de contato
 */
const toggleSelection = (item: EmployeeListingType) => {
  const index = selectedEmployees.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedEmployees.value = [...selectedEmployees.value, item];
  } else {
    selectedEmployees.value = selectedEmployees.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Prepara dados para criação/edição
 */
const onCreateClick = (data: EmployeeInsertType | EmployeeListingType | null) => {
  router.push({
    path: '/employee/create',
    query: { institutionId: institutionId.value }
  });
};


/**
 * Submete dados do formulário
 */
interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}


/*
Opcoes da lista
*/
const getDynamicOptions = (invoice: EmployeeListingType) => {
  // Opções base
  let availableOptions = [...Options];


  return availableOptions.map(option => ({
    ...option,
    title: t(`t-${option.title}`)
  }));
};





// Abre o diálogo de confirmação para exclusão
const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

// Executa a exclusão do funcionário
const deleteEmployee = async () => {
  if (!deleteId.value) return

  deleteLoading.value = true
  try {
    await employeeService.deleteEmployee(deleteId.value)
    toast.success(t('t-toast-message-deleted'))
    await employeeStore.fetchCompanyEmployees(institutionId.value, 0, itemsPerPage.value)
  } catch (error) {
    toast.error(t('t-toast-message-deleted-error'))
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
  }
}
// Limpeza ao desmontar
onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});
</script>

<template>
  <Card :title="$t('t-employee-list')" title-class="py-5">
    <template v-if="!props.isViewMode" #title-action>
      <div>
        <v-btn color="primary" class="mx-1" @click="onCreateClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-employee') }}
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
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-employee')" />
          </v-col>
        </v-row>
      </v-card-text>
      <DataTableServer v-model="selectedEmployees"
        :headers="employeeHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="employeeStore.company_employees" :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loading"
        :search-query="searchQuery" @load-items="fetchCompanyEmployees" item-value="id" :show-select="!props.isViewMode">
        <template #body="{ items }: { items: readonly unknown[] }">
          <tr v-for="item in items as EmployeeListingType[]" :key="item.id">
            <td v-if="!props.isViewMode">
              <v-checkbox :model-value="selectedEmployees.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td class="text-primary cursor-pointer" > 
              #{{ item.employeeNumber || 'N/A' }}
            </td>
            <td>{{ item.firstName }} {{ item.lastName }}</td>  
            <td>{{ item.phone || 'N/A' }}</td>
            <td>{{ item.email || 'N/A' }}</td> 
            <td><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
            <td>
              <v-btn
                v-if="props.isViewMode"
                icon
                size="small"
                variant="tonal"
                color="primary"
                @click="router.push(`/employee/view/${item.id}`)"
              >
                <i class="ph-eye" />
              </v-btn>
              <TableAction
                v-else
                @on-view="() => router.push(`/employee/view/${item.id}`)"
                @onEdit="() => router.push(`/employee/edit/${item.id}`)"
                @onDelete="() => openDeleteDialog(item.id)"
              />
            </td>
          </tr>
        </template>

        <template v-if="employeeStore.company_employees.length === 0" #body>
          <tr>
            <td :colspan="employeeHeader.length" class="text-center py-10">
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
 <RemoveItemConfirmationDialog v-model="deleteDialog" @onConfirm="deleteEmployee" :loading="deleteLoading" />

  <v-card-actions v-if="!props.isViewMode" class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 6)">
      {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
    </v-btn>
    <v-btn color="success" variant="elevated" @click="$router.push('/institution/list')">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>

  </v-card-actions>
</template>
