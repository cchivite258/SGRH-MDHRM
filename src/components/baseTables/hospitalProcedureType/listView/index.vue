<script lang="ts" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import { listViewHeader } from "@/components/baseTables/hospitalProcedureType/listView/utils";
import { HospitalProcedureTypeInsert, HospitalProcedureTypeListing, HospitalProcedureTypeUpdate } from "@/components/baseTables/hospitalProcedureType/types";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateCurrencyModal from "@/components/baseTables/hospitalProcedureType/CreateUpdateHospitalProcedureTypeModal.vue";
import ViewHospitalProcedureTypeModal from "@/components/baseTables/hospitalProcedureType/ViewHospitalProcedureTypeModal.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { hospitalProcedureTypeService } from "@/app/http/httpServiceProvider";
import { useHospitalProcedureTypeStore } from "@/store/baseTables/hospitalProcedureTypeStore";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { HospitalProcedureTypeOption } from "@/components/baseTables/hospitalProcedureType/types";


const { t } = useI18n();
//criacao da mensagem toast
const toast = useToast();

const hospitalProcedureTypeStore = useHospitalProcedureTypeStore();

const router = useRouter();
const dialog = ref(false);
const viewDialog = ref(false);
const hospitalProcedureTypeData = ref<HospitalProcedureTypeListing | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const isSelectAll = ref(false);

// Campos para pesquisa
const searchQuery = ref("");
const searchProps = "name,description";

// Paginação
const itemsPerPage = ref(10);
const loadingList = computed(() => hospitalProcedureTypeStore.loading);
const totalItems = computed(() => hospitalProcedureTypeStore.pagination.totalElements);
const selectedHospitalProcedureTypes = ref<any[]>([])
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const message = getApiErrorMessages(error, t("t-message-save-error"))[0] || t("t-message-save-error");

  errorMsg.value = message;

  console.log("errorMsg.value ==>", errorMsg.value)

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
  fetchHospitalProcedureTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});



// Carregamento inicial
onMounted(() => {
  fetchHospitalProcedureTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});

// Observa mudanças nos funcionários selecionados
watch(selectedHospitalProcedureTypes, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })

// Função de carregamento da tabela
const fetchHospitalProcedureTypes = async ({ page, itemsPerPage, sortBy, search }: HospitalProcedureTypeOption) => {
  await hospitalProcedureTypeStore.fetchHospitalProcedureTypes(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
};

const toggleSelection = (item: HospitalProcedureTypeListing) => {
  const index = selectedHospitalProcedureTypes.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedHospitalProcedureTypes.value = [...selectedHospitalProcedureTypes.value, item];
  } else {
    selectedHospitalProcedureTypes.value = selectedHospitalProcedureTypes.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    hospitalProcedureTypeData.value = null;
  }
});

const onCreateEditClick = (data: HospitalProcedureTypeListing | null) => {
  if (!data) {
    hospitalProcedureTypeData.value = {
      id: "-1",
      name: "",
      description: "",
      enabled: true
    };
  } else {
    hospitalProcedureTypeData.value = data;
  }

  dialog.value = true;
};

const onSubmit = async (data: HospitalProcedureTypeListing, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      await hospitalProcedureTypeService.createHospitalProcedureType(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await hospitalProcedureTypeService.updateHospitalProcedureType(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await fetchHospitalProcedureTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

    // Callback de sucesso (fecha a modal)
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t('t-message-save-error')).forEach((message) => toast.error(message));
    handleApiError(error);
  } finally {
    // Callback para desativar o loading
    callbacks?.onFinally?.();
  }
};


//Consulta do utilizador
watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    hospitalProcedureTypeData.value = null;
  }
});

const onViewClick = (data: HospitalProcedureTypeListing | null) => {
  if (!data) {
    hospitalProcedureTypeData.value = {
      id: "-1",
      name: "",
      description: "",
      enabled: true
    };
  } else {
    hospitalProcedureTypeData.value = data;

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
    await hospitalProcedureTypeService.deleteHospitalProcedureType(deleteId.value!);

    await fetchHospitalProcedureTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    getApiErrorMessages(error, t('t-toast-message-deleted-erros')).forEach((message) => toast.error(message));
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
          <span class="text-body-1 font-weight-bold">{{ $t('t-type-list') }}</span>
        </v-col>

        <!-- Container dos elementos à direita -->
        <v-col lg="8" class="d-flex justify-end">
          <v-row justify="end" align="center" no-gutters>
            <v-col lg="4" class="me-3">
              <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-hospital-procedure-type')" />
            </v-col>
            <v-col lg="auto">
              <v-btn color="secondary" @click="onCreateEditClick(null)">
                <i class="ph-plus-circle me-1" /> {{ $t('t-add-hospital-procedure-type') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2">
      <DataTableServer v-model="selectedHospitalProcedureTypes" :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="hospitalProcedureTypeStore.hospital_procedure_types" :items-per-page="itemsPerPage"
        :total-items="totalItems" :loading="loadingList" :search-query="searchQuery" :search-props="searchProps"
        item-value="id" @load-items="fetchHospitalProcedureTypes">
        <template #body="{ items }">
          <tr v-for="item in items as HospitalProcedureTypeListing[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedHospitalProcedureTypes.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.description }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td>
              <TableAction @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)" />
            </td>
          </tr>
        </template>
        <template v-if="!hospitalProcedureTypeStore.hospital_procedure_types.length" #body>
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

  <CreateUpdateCurrencyModal v-if="hospitalProcedureTypeData" v-model="dialog" :data="hospitalProcedureTypeData"
    :error="errorMsg" @onSubmit="onSubmit" />

  <ViewHospitalProcedureTypeModal v-if="hospitalProcedureTypeData" v-model="viewDialog"
    :data="hospitalProcedureTypeData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>

