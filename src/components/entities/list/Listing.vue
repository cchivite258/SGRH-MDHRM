<script lang="ts" setup>
import { ref, computed, watch, onBeforeMount } from "vue"
import { useRouter, onBeforeRouteLeave } from "vue-router"
import { useCompanyDetailsStore } from "@/store/institution/companyDetailsStore"
import { companyDetailsService } from "@/app/http/httpServiceProvider"
import { useToast } from 'vue-toastification'
import { useI18n } from "vue-i18n"

import DataTableServer from "@/app/common/components/DataTableServer.vue"
import TableAction from "@/app/common/components/TableAction.vue"
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue"
import { entitiesHeader } from "@/components/entities/list/utils"
import Card from "@/app/common/components/Card.vue"
import Status from "@/app/common/components/Status.vue"
import { formateDate } from "@/app/common/dateFormate"
import type { EntityListingType } from "@/components/entities/types"
import AdvancedFilter from "@/components/entities/list/AdvancedFilter.vue"

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const companyDetailsStore = useCompanyDetailsStore()

const searchQuery = ref("")
const searchProps = "name,description,address,phone,email,website,incomeTaxNumber,institutionType.name"
const itemsPerPage = ref(10)
const selectedEntities = ref<any[]>([])

const resetListingFilters = () => {
  companyDetailsStore.clearFilters()
  searchQuery.value = ""
  selectedEntities.value = []
}

const deleteDialog = ref(false)
const deleteId = ref<string | null>(null)
const deleteLoading = ref(false)

const loading = computed(() => companyDetailsStore.loading)
const totalItems = computed(() => companyDetailsStore.pagination.totalElements)

watch(selectedEntities, (newSelection) => {
  console.log('Entidades selecionadas:', newSelection)
}, { deep: true })

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
}

const fetchEntities = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await companyDetailsStore.fetchCompanyDetails(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc'
  )
}

const onView = (id: string) => {
  router.push(`/entities/view/${id}`)
}

const openDeleteDialog = (id: string) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteEntity = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await companyDetailsService.deleteCompanyDetails(deleteId.value);
    toast.success(t('t-toast-message-deleted'));
    await companyDetailsStore.fetchCompanyDetails(0, itemsPerPage.value);
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

const toggleSelection = (item: EntityListingType) => {
  const index = selectedEntities.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedEntities.value = [...selectedEntities.value, item];
  } else {
    selectedEntities.value = selectedEntities.value.filter(selected => selected.id !== item.id);
  }
};

onBeforeMount(() => {
  resetListingFilters()
})

onBeforeRouteLeave(() => {
  resetListingFilters()
})

</script>

<template>
  <Card :title="$t('t-entity-list')" class="mt-7">
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
          <v-btn color="secondary" to="/entities/create" block>
            <i class="ph-plus-circle" /> {{ $t('t-add-entity') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <DataTableServer v-model="selectedEntities"
        :headers="entitiesHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="companyDetailsStore.entities" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loading" :search-query="searchQuery" :search-props="searchProps" @load-items="fetchEntities" item-value="id"
        show-select>
        <template #body="{ items }: { items: readonly unknown[] }">
          <tr v-for="item in items as EntityListingType[]" :key="item.id">
            <td>
              <v-checkbox :model-value="selectedEntities.some(selected => selected.id === item.id)"
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
              <TableAction @onEdit="() => router.push(`/entities/edit/${item.id}`)"
                @onView="() => onView(item.id)"
                @onDelete="() => openDeleteDialog(item.id)" />
            </td>
          </tr>
        </template>

        <template v-if="companyDetailsStore.entities.length === 0" #body>
          <tr>
            <td :colspan="entitiesHeader.length" class="text-center py-10">
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

  <RemoveItemConfirmationDialog v-model="deleteDialog" @onConfirm="deleteEntity" :loading="deleteLoading" />
</template>
