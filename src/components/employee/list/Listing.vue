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
    sortBy[0]?.order || 'asc',
    searchProps, // query_props
    search // query_values
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


</script>

<template>
  <Card :title="$t('t-employee-list')" class="mt-7">
    <template #title-action>
      <v-row justify="end" align="center" no-gutters>
        <v-col cols="12" sm="6" md="4">
          <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-employee')" />
        </v-col>
        <v-col cols="12" sm="6" md="auto" class="ms-sm-3 mt-sm-0 mt-2">
          <v-btn color="secondary" to="/employee/create" block>
            <i class="ph-plus-circle" /> {{ $t('t-add-employee') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <v-card-text>
      <DataTableServer v-model="selectedEmployees"
        :headers="employeeHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="employeeStore.employees" :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loading"
        :search-query="searchQuery" @load-items="fetchEmployees" item-value="id" show-select>
        <template #body="{ items }: { items: readonly unknown[] }">
          <tr v-for="item in items as EmployeeListingType[]" :key="item.id">
            <td>
              <v-checkbox :model-value="selectedEmployees.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td class="text-primary cursor-pointer" @click="onView(item.id)"> 
              #{{ item.employeeNumber || 'N/A' }}
            </td>
            <td>{{ item.firstName }} {{ item.lastName }}</td> 
            <td>{{ item.phone || 'N/A' }}</td>
            <td>{{ item.email || 'N/A' }}</td> 
            <td><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
            <td>
              <TableAction @on-view="() => router.push(`/employee/view/${item.id}`)" @onEdit="() => router.push(`/employee/edit/${item.id}`)"
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