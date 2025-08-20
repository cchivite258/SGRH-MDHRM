<script lang="ts" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import { listViewHeader } from "@/components/baseTables/institutionTypes/listView/utils";
import { InstitutionTypeInsert, InstitutionTypeListing, InstitutionTypeUpdate } from "@/components/baseTables/institutionTypes/types";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateInstitutionTypeModal from "@/components/baseTables/institutionTypes/CreateUpdateInstitutionTypeModal.vue";
import ViewInstitutionTypeModal from "@/components/baseTables/institutionTypes/ViewInstitutionTypeModal.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { institutionTypeService } from "@/app/http/httpServiceProvider";
import { useInstitutionTypeStore } from "@/store/baseTables/institutionTypeServiceStore";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { InstitutionTypeOption } from "@/components/baseTables/institutionTypes/types";


const { t } = useI18n();
//criacao da mensagem toast
const toast = useToast();

const institutionTypeStore = useInstitutionTypeStore();

const router = useRouter();
const dialog = ref(false);
const viewDialog = ref(false);
const institutionTypeData = ref<InstitutionTypeListing | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const isSelectAll = ref(false);

// Campos para pesquisa
const searchQuery = ref("");
const searchProps = "name,description";

// Paginação
const itemsPerPage = ref(10);
const loadingList = computed(() => institutionTypeStore.loading);
const totalItems = computed(() => institutionTypeStore.pagination.totalElements);
const selectedInstitutionTypes = ref<any[]>([])

const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const message =
    error?.error?.errors?.name?.[0] || // tenta capturar erro por campo
    error?.error?.errors?.description?.[0]
    error?.message ||                                  // erro genérico
    t("t-message-save-error");                         // fallback traduzido

  errorMsg.value = message;

  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});

onMounted(() => {
  fetchInstitutionTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});


// Observa mudanças nos funcionários selecionados
watch(selectedInstitutionTypes, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })

// Função de carregamento da tabela
const fetchInstitutionTypes = async ({ page, itemsPerPage, sortBy, search }: InstitutionTypeOption) => {
  await institutionTypeStore.fetchInstitutionTypes(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
};

const toggleSelection = (item: InstitutionTypeListing) => {
  const index = selectedInstitutionTypes.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedInstitutionTypes.value = [...selectedInstitutionTypes.value, item];
  } else {
    selectedInstitutionTypes.value = selectedInstitutionTypes.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    institutionTypeData.value = null;
  }
});

const onCreateEditClick = (data: InstitutionTypeListing | null) => {
  if (!data) {
    institutionTypeData.value = {
      id: "-1",
      name: "",
      description: "",
      enabled: true
    };
  } else {
    institutionTypeData.value = data;
  }

  dialog.value = true;
};

const onSubmit = async (data: InstitutionTypeListing, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      await institutionTypeService.createInstitutionType(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await institutionTypeService.updateInstitutionType(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await fetchInstitutionTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

    // Callback de sucesso (fecha a modal)
    callbacks?.onSuccess?.();
  } catch (error) {
    toast.error(t('t-message-save-error'));
    handleApiError(error);
  } finally {
    // Callback para desativar o loading
    callbacks?.onFinally?.();
  }
};


//Consulta do utilizador
watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    institutionTypeData.value = null;
  }
});

const onViewClick = (data: InstitutionTypeListing | null) => {
  if (!data) {
    institutionTypeData.value = {
      id: "-1",
      name: "",
      description: "",
      enabled: true

    };
  } else {
    institutionTypeData.value = data;

  }

  viewDialog.value = true;
};


//Delete do utilizador
watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});
const onDelete = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  deleteLoading.value = true;

  try {
    await institutionTypeService.deleteInstitutionType(deleteId.value!);

    await fetchInstitutionTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    toast.error(t('t-toast-message-deleted-erros'));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }

};

</script>
<template>
  <v-card>
    <v-card-title class="mt-2">
      <v-row justify="space-between" align="center" no-gutters>
        <!-- Novo texto à esquerda -->
        <v-col lg="auto" class="d-flex align-center">
          <span class="text-body-1 font-weight-bold">{{ $t('t-institution-type-list') }}</span>
        </v-col>
        <!-- Container dos elementos à direita -->
        <v-col lg="8" class="d-flex justify-end">
          <v-row justify="end" align="center" no-gutters>
            <v-col lg="4" class="me-3">
              <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-institution-type')" />
            </v-col>
            <v-col lg="auto">
              <v-btn color="secondary" @click="onCreateEditClick(null)">
                <i class="ph-plus-circle me-1" /> {{ $t('t-add-institution-type') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2">
      <DataTableServer v-model="selectedInstitutionTypes" :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="institutionTypeStore.institution_types" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" item-value="id"
        @load-items="fetchInstitutionTypes">
        <template #body="{ items }">
          <tr v-for="item in items as InstitutionTypeListing[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedInstitutionTypes.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td style="padding-right: 200px;">{{ item.name }}</td>
            <td style="padding-right: 200px;">{{ item.description?.toUpperCase() }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" /> 
            </td>
            <td>
              <TableAction @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)" />
            </td>
          </tr>
        </template>
        <template v-if="!institutionTypeStore.institution_types.length" #body>
          <tr>
            <td :colspan="listViewHeader.length + 2" class="text-center py-10">
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

  <CreateUpdateInstitutionTypeModal v-if="institutionTypeData" v-model="dialog" :data="institutionTypeData"
    :error="errorMsg" @onSubmit="onSubmit"/>

  <ViewInstitutionTypeModal v-if="institutionTypeData" v-model="viewDialog" :data="institutionTypeData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>
