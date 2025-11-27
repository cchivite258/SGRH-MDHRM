<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useEmployeeStore } from "@/store/employee/employeeStore"
import { employeeService } from "@/app/http/httpServiceProvider"
import { useToast } from 'vue-toastification'
import { useI18n } from "vue-i18n"

// Components
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import { employeeHeader } from "@/components/employee/list/utils"
import Card from "@/app/common/components/Card.vue"
import { EmployeeListingType } from "../types"
import Status from "@/app/common/components/Status.vue";
import AdvancedFilter from "@/components/employee/list/AdvancedFilter.vue";

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const employeeStore = useEmployeeStore()

// Estado do componente
const searchQuery = ref("")
const searchProps = "firstName,lastName,email,employeeNumber,phone" // Campos de pesquisa
const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)
const itemsPerPage = ref(10)
const selectedEmployees = ref<any[]>([]) /// Armazena os funcionários selecionados

// Computed properties
const loading = computed(() => employeeStore.loading)
const totalItems = computed(() => employeeStore.pagination.totalElements)

// Observa mudanças nos funcionários selecionados
watch(selectedEmployees, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })

interface FetchParams {
  page: number
  itemsPerPage: number
  sortBy: { key: string, order: 'asc' | 'desc' }[]
  search: string
}

// Busca os funcionários com os parâmetros atuais
const fetchEmployees = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  await employeeStore.fetchEmployees(
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc'
  )
}

// Navega para a página de visualização
const onView = (id: string) => {
  router.push(`/employee/view/${id}`)
}

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
    await employeeStore.fetchEmployees(0, itemsPerPage.value)
  } catch (error) {
    toast.error(t('t-toast-message-deleted-error'))
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
  }
}

const toggleSelection = (item: EmployeeListingType) => {
  const index = selectedEmployees.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedEmployees.value = [...selectedEmployees.value, item];
  } else {
    selectedEmployees.value = selectedEmployees.value.filter(selected => selected.id !== item.id);
  }
};

const shouldHighlight = (employee: EmployeeListingType) => {
  return employee.alertFlag && employee.alertFlag !== 'UNFLAGGED';
}

const getAlertMessage = (employee: EmployeeListingType) => {
  if (!shouldHighlight(employee)) return '';
  
  // Adapte conforme a estrutura dos seus dados
  switch (employee.alertFlag) {
    case 'EXCEEDS_NUMBER_OF_DEPENDENTS':
      return t('t-exceeds-number-of-dependents');
    case 'DOCUMENT_EXPIRED':
      return 'Documentos expirados';
    case 'TRAINING_REQUIRED':
      return 'Treinamentos pendentes';
    case 'PENDING_VERIFICATION':
      return 'Verificação pendente';
    default:
      return 'Problemas identificados no cadastro';
  }
}


</script>

<template>
  <Card :title="$t('t-employee-list')" class="mt-7">

    <v-card-title class="mt-2">
      <v-row justify="space-between" class="mt-n6">
        <v-col lg="12">
          <AdvancedFilter />
        </v-col>
      </v-row>
      <v-row justify="space-between" class="mt-n6">
        <v-col lg="8">
        </v-col>
        <v-col lg="auto">
          <v-btn color="secondary" to="/employee/create" block>
            <i class="ph-plus-circle" /> {{ $t('t-add-employee') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <DataTableServer v-model="selectedEmployees"
    :headers="employeeHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
    :items="employeeStore.employees" :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loading"
    :search-query="searchQuery" @load-items="fetchEmployees" item-value="id" show-select>
    
    <template #body="{ items }: { items: readonly unknown[] }">
      <tr v-for="item in items as EmployeeListingType[]" :key="item.id" 
          :class="[item.alertFlag && item.alertFlag !== 'UNFLAGGED' ? 'bg-danger-subtle' : '']">
        
        <v-tooltip v-if="item.alertFlag && item.alertFlag !== 'UNFLAGGED'" location="top">
          <template v-slot:activator="{ props }">
            <td v-bind="props">
              <v-checkbox :model-value="selectedEmployees.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
          </template>
          <span>{{ getAlertMessage(item) }}</span>
        </v-tooltip>
        
        <td v-else>
          <v-checkbox :model-value="selectedEmployees.some(selected => selected.id === item.id)"
            @update:model-value="toggleSelection(item)" hide-details density="compact" />
        </td>
        
        <v-tooltip v-if="item.alertFlag && item.alertFlag !== 'UNFLAGGED'" location="top">
          <template v-slot:activator="{ props }">
            <td v-bind="props" class="text-primary cursor-pointer" @click="onView(item.id)"> 
              #{{ item.employeeNumber || 'N/A' }}
            </td>
          </template>
          <span>{{ getAlertMessage(item) }}</span>
        </v-tooltip>
        
        <td v-else class="text-primary cursor-pointer" @click="onView(item.id)"> 
          #{{ item.employeeNumber || 'N/A' }}
        </td>
        
        <v-tooltip v-if="item.alertFlag && item.alertFlag !== 'UNFLAGGED'" location="top">
          <template v-slot:activator="{ props }">
            <td v-bind="props">{{ item.firstName }} {{ item.lastName }}</td>
          </template>
          <span>{{ getAlertMessage(item) }}</span>
        </v-tooltip>
        
        <td v-else>{{ item.firstName }} {{ item.lastName }}</td>
        
        <v-tooltip v-if="item.alertFlag && item.alertFlag !== 'UNFLAGGED'" location="top">
          <template v-slot:activator="{ props }">
            <td v-bind="props">{{ item.phone || 'N/A' }}</td>
          </template>
          <span>{{ getAlertMessage(item) }}</span>
        </v-tooltip>
        
        <td v-else>{{ item.phone || 'N/A' }}</td>
        
        <v-tooltip v-if="item.alertFlag && item.alertFlag !== 'UNFLAGGED'" location="top">
          <template v-slot:activator="{ props }">
            <td v-bind="props">{{ item.email || 'N/A' }}</td>
          </template>
          <span>{{ getAlertMessage(item) }}</span>
        </v-tooltip>
        
        <td v-else>{{ item.email || 'N/A' }}</td>
        
        <td><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
        
        <td>
          <TableAction @on-view="() => router.push(`/employee/view/${item.id}`)" 
                      @onEdit="() => router.push(`/employee/edit/${item.id}`)"
                      @onDelete="() => openDeleteDialog(item.id)" />
        </td>
      </tr>
    </template>

    <template v-if="employeeStore.employees.length === 0" #body>
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

    </v-card-text>
  </Card>

  <RemoveItemConfirmationDialog v-model="deleteDialog" @onConfirm="deleteEmployee" :loading="deleteLoading" />
</template>

