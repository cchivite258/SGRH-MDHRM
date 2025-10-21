<script lang="ts" setup>
/**
 * TabContacts - Componente para  de pessoas de contato de instituições
 * 
 * Funcionalidades:
 * - Listagem de departamentos
 * - Criação/Edição de departamentos
 * - Visualização de detalhes
 * - Exclusão de departamentos
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
import CreateEditDepartmentDialog from "@/components/institution/create/CreateEditDepartmentDialog.vue";
import ViewDepartmentDialog from "@/components/institution/create/ViewDepartmentDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
// Stores e Services
import { useDepartmentStore } from "@/store/institution/departmentStore";
import { departmentService } from "@/app/http/httpServiceProvider";

// Types
import type {
  DepartmentInsertType,
  DepartmentListingForListType,
  DepartmentListingType
} from "@/components/institution/types";

// Utils
import { departmentHeader } from "@/components/institution/create/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const departmentStore = useDepartmentStore();

// props
const props = defineProps({
  institutionId: {
    type: String as PropType<string | null>,
    default: null
  }
});

// Modifique a lógica para usar o prop institutionId
const institutionId = ref(props.institutionId);

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const departmentData = ref<DepartmentInsertType | null>(null);
const departmentDataView = ref<DepartmentListingType | null>(null);
const deleteId = ref<string | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "name,description"; 
const itemsPerPage = ref(10);
const selectedDepartments = ref<DepartmentListingForListType[]>([]);

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed properties
const loadingList = computed(() => departmentStore.loading);
const totalItems = computed(() => departmentStore.pagination.totalElements);

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

/**
 * Busca pessoas de contato com paginação e filtros
 */
const fetchDepartments = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!institutionId.value) return;

  await departmentStore.fetchDepartmentsForList(
    institutionId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

/**
 * Alterna seleção de pessoas de contato
 */
const toggleSelection = (item: DepartmentListingForListType) => {
  const index = selectedDepartments.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedDepartments.value = [...selectedDepartments.value, item];
  } else {
    selectedDepartments.value = selectedDepartments.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Prepara dados para criação/edição
 */
watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    departmentData.value = null;
  }
});
const onCreateClick = (data: DepartmentInsertType | null) => {
  const company = institutionId.value || "";

  departmentData.value = data
    ? {
      ...data,
      company: company // sobrescreve com o institutionId atual
    }
    : {
      id: undefined,
      name: "",
      description: "",
      company: company,
      enabled: true
    };

  dialog.value = true;
};


/**
 * Submete dados do formulário
 */
const onSubmit = async (
  data: DepartmentInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onFinally?: () => void
  }
) => {
  try {
    if (!data.id) {
      await departmentService.createDepartment(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await departmentService.updateDepartment(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await departmentStore.fetchDepartmentsForList(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    callbacks?.onSuccess?.();
  } catch (error) {
    console.error("Erro ao gravar pessoa de contacto:", error);
    toast.error(t('t-message-save-error'));
  } finally {
    callbacks?.onFinally?.();
  }
};

/**
 * Prepara dados para visualização
 */
watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    departmentData.value = null;
  }
});
const onViewClick = (data: DepartmentListingType) => {
  departmentDataView.value = { ...data };
  viewDialog.value = true;
};

/**
 * Prepara exclusão de contato
 */
const onDelete = (id: string | null) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

/**
 * Confirma exclusão de contato
 */
const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await departmentService.deleteDepartment(deleteId.value);
    selectedDepartments.value = selectedDepartments.value.filter(
      user => user.id !== deleteId.value
    );
    await departmentStore.fetchDepartmentsForList(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    toast.error(t('t-toast-message-deleted-erros'));
    console.error("Delete error:", error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null;
  }
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
  <Card :title="$t('t-department-list')" title-class="py-5">
    <template #title-action>
      <div>
        <v-btn color="primary" class="mx-1" @click="onCreateClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-department') }}
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
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-department')" />
          </v-col>
        </v-row>
      </v-card-text>
      <DataTableServer v-model="selectedDepartments"
        :headers="departmentHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="departmentStore.departmentsList" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" @load-items="fetchDepartments" 
        item-value="id" show-select>
        <template #body="{ items }">
          <tr v-for="item in items as DepartmentListingType[]" :key="item.id" height="50"> 
            <td>
              <v-checkbox :model-value="selectedDepartments.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td style="padding-right: 200px;">{{ item.name }}</td>
            <td style="padding-right: 200px;">{{ item.description }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td class="text-end" style="padding-right: 5px;">
              <TableAction 
              @onEdit="() => router.push(`/institution/department/${item.id}`)" 
              @onView="onViewClick(item)" 
              @onDelete="onDelete(item.id)" />
            </td>
          </tr>
        </template>

        <template v-if="departmentStore.departmentsList.length === 0" #body>
          <tr>
            <td :colspan="departmentHeader.length" class="text-center py-10">
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
  <CreateEditDepartmentDialog v-model="dialog" :data="departmentData" @onSubmit="onSubmit" />
  <ViewDepartmentDialog v-model="viewDialog" :data="departmentDataView" />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />

  <v-card-actions class="d-flex justify-space-between mt-5">

  <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 3)">
    {{ $t('t-back-to-health-plan') }} <i class="ph-arrow-left ms-2" />
  </v-btn>
  <v-btn color="success" variant="elevated" @click="$emit('onStepChange', 5)">
    {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
  </v-btn>
</v-card-actions>
</template>

