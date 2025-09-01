<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { clinicService } from "@/app/http/httpServiceProvider"
import { useToast } from 'vue-toastification'
import { useI18n } from "vue-i18n"
import Status from "@/app/common/components/Status.vue";

// Components
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import { clinicsHeader } from "@/components/clinics/list/utils"
import Card from "@/app/common/components/Card.vue"
import { ClinicListingType } from "../types"
import AdvancedFilter from "@/components/clinics/list/AdvancedFilter.vue";

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const clinicStore = useClinicStore()

// Estado do componente
const searchQuery = ref("")
const searchProps = "name,description,address,phone,email,website" // Campos de pesquisa
const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)
const itemsPerPage = ref(10)
const selectedClinics = ref<any[]>([]) /// Armazena os funcionários selecionados

// Computed properties
const loading = computed(() => clinicStore.loading)
const totalItems = computed(() => clinicStore.pagination.totalElements)

// Observa mudanças nos funcionários selecionados
watch(selectedClinics, (newSelection) => {
  console.log('Clinics selecionados:', newSelection)
}, { deep: true })

interface FetchParams {
  page: number
  itemsPerPage: number
  sortBy: { key: string, order: 'asc' | 'desc' }[]
  search: string
}

// Busca os funcionários com os parâmetros atuais
const fetchClinics = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  await clinicStore.fetchClinics(
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc'
  )
}

// Navega para a página de visualização
const onView = (id: string) => {
  router.push(`/clinics/view/${id}`)
}

// Abre o diálogo de confirmação para exclusão
const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

// Executa a exclusão do funcionário
const deleteClinic = async () => {
  if (!deleteId.value) return

  deleteLoading.value = true
  try {
    await clinicService.deleteClinic(deleteId.value)
    toast.success(t('t-toast-message-deleted'))
    await clinicStore.fetchClinics(0, itemsPerPage.value)
  } catch (error) {
    toast.error(t('t-toast-message-deleted-error'))
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
  }
}

const toggleSelection = (item: ClinicListingType) => {
  const index = selectedClinics.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedClinics.value = [...selectedClinics.value, item];
  } else {
    selectedClinics.value = selectedClinics.value.filter(selected => selected.id !== item.id);
  }
};

const truncate = (text: string, maxLength = 30) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

</script>

<template>
  <Card :title="$t('t-clinic-list')" class="mt-7">

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
          <v-btn color="secondary" to="/clinics/create" block>
            <i class="ph-plus-circle" /> {{ $t('t-add-clinic') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <DataTableServer v-model="selectedClinics"
        :headers="clinicsHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" :items="clinicStore.clinics"
        :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loading" :search-query="searchQuery"
        @load-items="fetchClinics" item-value="id" show-select>
        <template #body="{ items }: { items: readonly unknown[] }">
          <tr v-for="item in items as ClinicListingType[]" :key="item.id">
            <td>
              <v-checkbox :model-value="selectedClinics.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td class="text-primary cursor-pointer" @click="onView(item.id)">
              {{ truncate(item.name) }}
            </td>
            <td>{{ truncate(item.address) }}</td>
            <td>{{ truncate(item.phone) }}</td>
            <td>{{ truncate(item.email) }}</td>
            <td>{{ truncate(item.website) }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td>
              <TableAction @on-view="() => router.push(`/clinics/view/${item.id}`)"
                @onEdit="() => router.push(`/clinics/edit/${item.id}`)" @onDelete="() => openDeleteDialog(item.id)" />
            </td>
          </tr>
        </template>

        <template v-if="clinicStore.clinics.length === 0" #body>
          <tr>
            <td :colspan="clinicsHeader.length" class="text-center py-10">
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

  <RemoveItemConfirmationDialog v-model="deleteDialog" @onConfirm="deleteClinic" :loading="deleteLoading" />
</template>