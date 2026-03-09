<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { positionHeader } from "@/components/institution/create/utils";
import { DepartmentInsertType, PositionInsertType, PositionListingForListType } from "@/components/institution/types";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdatePositionModal from "@/components/institution/create/editDepartment/CreateUpdatePositionModal.vue";
import ViewPositionModal from "@/components/institution/create/editDepartment/ViewPositionModal.vue";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useDepartmentStore } from "@/store/institution/departmentStore";
import { usePositionStore } from "@/store/institution/positionStore";
import { departmentService, positionService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const departmentStore = useDepartmentStore();
const positionStore = usePositionStore();

// Estado do componente
const departmentId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : null;
});

// Formulário do departamento
const form = ref<DepartmentInsertType>({
  id: departmentId.value || undefined,
  name: "",
  description: "",
  company: "",
  enabled: true
});

// Estado para posições
const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const positionFormData = ref<PositionInsertType | null>(null);
const deleteId = ref<string | null>(null);
const selectedPositions = ref<PositionListingForListType[]>([]);
const itemsPerPage = ref(10);
const searchProps = "name,description";
const loading = ref(false);
const searchQuery = ref("");

// Computed properties
const loadingList = computed(() => positionStore.loading);
const totalItems = computed(() => positionStore.pagination.totalElements);

// Buscar dados iniciais
onMounted(async () => {
  if (departmentId.value) {
    try {
      // Carrega dados do departamento
      const deptResponse = await departmentService.getDepartmentsById(departmentId.value);
      const dept = deptResponse.data;

      if (dept) {
        form.value = {
          id: dept.id,
          name: dept.name,
          description: dept.description || "",
          company: dept.company?.id,
          enabled: dept.enabled
        };
      }

      // Carrega posições do departamento
      await fetchPositions({
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

const fetchPositions = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!departmentId.value) return;

  await positionStore.fetchPositionsforList(
    departmentId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'name',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

const toggleSelection = (item: PositionListingForListType) => {
  const index = selectedPositions.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedPositions.value = [...selectedPositions.value, item];
  } else {
    selectedPositions.value = selectedPositions.value.filter(selected => selected.id !== item.id);
  }
};

// Modal de criação/edição de posição
const onCreateEditClick = (data: PositionListingForListType | null) => {
  positionFormData.value = data
    ? { ...data, department: departmentId.value || "" }
    : {
      id: undefined,
      name: "",
      description: "",
      department: departmentId.value || "",
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

const onSubmitPosition = async (
  data: PositionInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onFinally?: () => void
  }
) => {
  try {
    let response: ServiceResponse<PositionListingForListType>;

    if (!data.id) {
      response = await positionService.createPosition(data);
    } else {
      response = await positionService.updatePosition(data.id, data);
    }

    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      getApiErrorMessages(response.error, t('t-message-save-error')).forEach((message) => toast.error(message));
      return;
    }


    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(data.id ? t('t-toast-message-update') : t('t-toast-message-created'));

    await fetchPositions({
      page: positionStore.pagination.currentPage + 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
      search: searchQuery.value
    });

    callbacks?.onSuccess?.();
  } catch (error: any) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    callbacks?.onFinally?.();
  }
};

// Visualização de posição
const onViewClick = (data: PositionListingForListType) => {
  positionFormData.value = { ...data };
  viewDialog.value = true;
};

// Exclusão de posição
const onDelete = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await positionService.deletePosition(deleteId.value);
    selectedPositions.value = selectedPositions.value.filter(pos => pos.id !== deleteId.value);
    await fetchPositions({
      page: positionStore.pagination.currentPage + 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
      search: searchQuery.value
    });
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    toast.error(t('t-toast-message-deleted-erros'));
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null;
  }
};

// Voltar para lista de departamentos
// Adicione no início do seu script setup (junto com os outros imports)
const emit = defineEmits(['onStepChangeforDialog']);

// Depois modifique a função onBack para:
const onBack = () => {
  // Obtém o ID da instituição do departamento atual
  const institutionId = form.value.company;
  console.log("Institution ID:", institutionId);

  if (institutionId) {
    // Navega para a rota de edição da instituição e força a tab 3
    router.push({
      path: `/institution/edit/${institutionId}`,
      query: { tab: '4' } // Adiciona o query param para a tab
    });
  } else {
    // Fallback caso não tenha institutionId
    router.push(`/institution/list/`);
  }
};

// Salvar departamento
const handleSubmit = async () => {
  if (!form.value.name || !form.value.description) {
    toast.error(t('t-please-fill-all-required-fields'));
    return;
  }

  loading.value = true;
  try {
    if (form.value.id) {
      await departmentService.updateDepartment(form.value.id, form.value);
      toast.success(t('t-toast-message-update'));
    } else {
      await departmentService.createDepartment(form.value);
      toast.success(t('t-toast-message-created'));
    }

    await departmentStore.fetchDepartmentsForList(form.value.company);
  } catch (error) {
    toast.error(t('t-message-save-error'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Card title="">
    <v-card-text>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="form.name" :placeholder="$t('t-enter-name')" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-description') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="form.description" :placeholder="$t('t-enter-description')" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="12" class="">
              <div class="font-weight-bold">{{ $t('t-enabled') }}</div>
              <v-checkbox v-model="form.enabled" density="compact" color="primary" class="d-inline-flex">
                <template #label>
                  <span>{{ $t('t-is-enabled') }}</span>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-text>
      <Card :title="$t('t-position-list')" title-class="pt-0">
        <template #title-action>
          <div>
            <v-btn color="primary" class="mx-1" @click="onCreateEditClick(null)">
              <i class="ph-plus-circle me-1" /> {{ $t('t-add-position') }}
            </v-btn>
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
                    <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-position')" />
                  </v-col>
                </v-row>
              </v-card-text>
              <DataTableServer v-model="selectedPositions"
                :headers="positionHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                :items="positionStore.positions_list" :items-per-page="itemsPerPage" :total-items="totalItems"
                :loading="loadingList" :search-query="searchQuery" :search-props="searchProps"
                @load-items="fetchPositions">
                <template #body="{ items }">
                  <tr v-for="item in items as PositionListingForListType[]" :key="item.id">
                    <td>
                      <v-checkbox :model-value="selectedPositions.some(selected => selected.id === item.id)"
                        @update:model-value="toggleSelection(item)" hide-details density="compact" />
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td>
                      <Status :status="item.enabled ? 'enabled' : 'disabled'" />
                    </td>
                    <td style="padding-right: 0px;">
                      <TableAction @onView="onViewClick(item)" @onEdit="onCreateEditClick(item)"
                        @onDelete="onDelete(item.id)" />
                    </td>
                  </tr>
                </template>

                <template v-if="positionStore.positions_list.length === 0" #body>
                  <tr>
                    <td :colspan="positionHeader.length" class="text-center py-10">
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
        <v-btn color="success" variant="elevated" :loading="loading" :disabled="!form.name || !form.description"
          @click="handleSubmit">
          {{ $t('t-save') }}
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </Card>

  <CreateUpdatePositionModal v-if="positionFormData" v-model="dialog" :data="positionFormData"
    @onSubmit="onSubmitPosition" />

  <ViewPositionModal v-if="positionFormData" v-model="viewDialog" :data="positionFormData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" :loading="deleteLoading"
    @onConfirm="onConfirmDelete" />
</template>