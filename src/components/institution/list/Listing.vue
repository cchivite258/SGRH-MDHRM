<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useInstitutionStore } from "@/store/institution/institutionStore"
import { institutionService } from "@/app/http/httpServiceProvider"
import { useToast } from 'vue-toastification'
import { useI18n } from "vue-i18n"

// Components
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import { institutionHeader } from "@/components/institution/list/utils"
import Card from "@/app/common/components/Card.vue"
import Status from "@/app/common/components/Status.vue";
import { formateDate } from "@/app/common/dateFormate";
import { InstitutionListingType } from "../types"
import AdvancedFilter from "@/components/institution/list/AdvancedFilter.vue";

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const institutionStore = useInstitutionStore()

// Estado do componente
const searchQuery = ref("")
const searchProps = "name,description,address,phone,email,website,incomeTaxNumber,institutionType.name" 
const itemsPerPage = ref(10)
const selectedInstitutions = ref<any[]>([]) 

const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)

// Computed properties
const loading = computed(() => institutionStore.loading)
const totalItems = computed(() => institutionStore.pagination.totalElements)

// Observa mudanças nos funcionários selecionados
watch(selectedInstitutions, (newSelection) => {
  console.log('Entidades selecionadas:', newSelection)
}, { deep: true })

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
}

// Busca os funcionários com os parâmetros atuais
const fetchInstitutions = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await institutionStore.fetchInstitutions(
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc'
  )
}

// Navega para a página de visualização
const onView = (id: string) => {
  //router.push(`/institution/view/${id}`)
  router.push(`/institution/list`)
}

// Abre o diálogo de confirmação para exclusão
const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

// Executa a exclusão do funcionário
const deleteInstitution = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await institutionService.deleteInstitution(deleteId.value);
    toast.success(t('t-toast-message-deleted'));
    await institutionStore.fetchInstitutions(0, itemsPerPage.value);
  } catch (error) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || t('t-toast-message-error'));
    } else {
      toast.error(t('t-toast-message-error'));
    }
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};

const toggleSelection = (item: InstitutionListingType) => {
  const index = selectedInstitutions.value.findIndex(selected => selected.id === item.id); 
  if (index === -1) {
    selectedInstitutions.value = [...selectedInstitutions.value, item];
  } else {
    selectedInstitutions.value = selectedInstitutions.value.filter(selected => selected.id !== item.id);
  }
};


</script>

<template>
  <Card :title="$t('t-institution-list')" class="mt-7">
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
          <v-btn color="secondary" to="/institution/create" block>
            <i class="ph-plus-circle" /> {{ $t('t-add-institution') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <DataTableServer v-model="selectedInstitutions"
        :headers="institutionHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="institutionStore.institutions" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loading" :search-query="searchQuery" :search-props="searchProps" @load-items="fetchInstitutions" item-value="id"
        show-select>
        <template #body="{ items }: { items: readonly unknown[] }">
          <tr v-for="item in items as InstitutionListingType[]" :key="item.id">
            <td>
              <v-checkbox :model-value="selectedInstitutions.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td class="text-primary cursor-pointer" @click="onView(item.id)">
              {{ item.name || 'N/A' }}
            </td>
            <td>{{ item.institutionType?.name || 'N/A' }} </td>
            <td>{{ item.email || 'N/A' }}</td>
            <td>{{ item.phone || 'N/A' }}</td>
            <td>{{ formateDate(item.createdAt) || 'N/A' }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td>
              <TableAction @onEdit="() => router.push(`/institution/edit/${item.id}`)" 
                @onDelete="() => openDeleteDialog(item.id)" />
            </td>
          </tr>
        </template>

        <template v-if="institutionStore.institutions.length === 0" #body>
          <tr>
            <td :colspan="institutionHeader.length" class="text-center py-10">
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

  <RemoveItemConfirmationDialog v-model="deleteDialog" @onConfirm="deleteInstitution" :loading="deleteLoading" />
</template>
