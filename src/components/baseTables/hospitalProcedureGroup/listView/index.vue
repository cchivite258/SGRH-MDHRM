<script lang="ts" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import { listViewHeader } from "@/components/baseTables/hospitalProcedureGroup/listView/utils";
import { HospitalProcedureGroupInsert, HospitalProcedureGroupListing, HospitalProcedureGroupUpdate } from "@/components/baseTables/hospitalProcedureGroup/types";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateHospitalProcedureGroupModal from "@/components/baseTables/hospitalProcedureGroup/CreateUpdateHospitalProcedureGroupModal.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { hospitalProcedureGroupService } from "@/app/http/httpServiceProvider";
import { useHospitalProcedureGroupStore } from "@/store/baseTables/hospitalProcedureGroupStore";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { HospitalProcedureGroupOption } from "@/components/baseTables/hospitalProcedureGroup/types";


const { t } = useI18n();
//criacao da mensagem toast
const toast = useToast();

const hospitalProcedureGroupStore = useHospitalProcedureGroupStore();

const router = useRouter();
const dialog = ref(false);
const hospitalProcedureGroupData = ref<HospitalProcedureGroupListing | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const isSelectAll = ref(false);

// Campos para pesquisa
const searchQuery = ref("");
const searchProps = "name,description";

// Paginação
const itemsPerPage = ref(10);
const loadingList = computed(() => hospitalProcedureGroupStore.loading);
const totalItems = computed(() => hospitalProcedureGroupStore.pagination.totalElements);
const selectedHospitalProcedureGroups = ref<any[]>([])
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
  fetchHospitalProcedureGroups({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});

// Observa mudanças nos funcionários selecionados
watch(selectedHospitalProcedureGroups, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })

// Função de carregamento da tabela
const fetchHospitalProcedureGroups = async ({ page, itemsPerPage, sortBy, search }: HospitalProcedureGroupOption) => {
  await hospitalProcedureGroupStore.fetchHospitalProcedureGroups(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
};

const toggleSelection = (item: HospitalProcedureGroupListing) => {
  const index = selectedHospitalProcedureGroups.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedHospitalProcedureGroups.value = [...selectedHospitalProcedureGroups.value, item];
  } else {
    selectedHospitalProcedureGroups.value = selectedHospitalProcedureGroups.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    hospitalProcedureGroupData.value = null;
  }
});

const onCreateEditClick = (data: HospitalProcedureGroupListing | null) => {
  if (!data) {
    hospitalProcedureGroupData.value = {
      id: "-1",
      name: "",
      description: "",
      enabled: true
    };
    dialog.value = true;
  } else {
    router.push(`/baseTable/edit-hospital-procedure-group/${data.id}`);
  }
};

const onSubmit = async (data: HospitalProcedureGroupListing, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      await hospitalProcedureGroupService.createHospitalProcedureGroup(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await hospitalProcedureGroupService.updateHospitalProcedureGroup(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await fetchHospitalProcedureGroups({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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


const onViewClick = (data: HospitalProcedureGroupListing | null) => {
  if (!data) return;
  router.push(`/baseTable/view-hospital-procedure-group/${data.id}`);
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
    await hospitalProcedureGroupService.deleteHospitalProcedureGroup(deleteId.value!);

    await fetchHospitalProcedureGroups({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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
        <v-col lg="auto" class="d-flex align-center">
          <span class="text-body-1 font-weight-bold">{{ $t('t-group-list') }}</span>
        </v-col>

        <v-col lg="8" class="d-flex justify-end">
          <v-row justify="end" align="center" no-gutters>
            <v-col lg="4" class="me-3">
              <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-hospital-procedure-group')" />
            </v-col>
            <v-col lg="auto">
              <v-btn color="secondary" @click="onCreateEditClick(null)">
                <i class="ph-plus-circle me-1" /> {{ $t('t-add-hospital-procedure-group') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2">
      <DataTableServer v-model="selectedHospitalProcedureGroups" :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="hospitalProcedureGroupStore.hospital_procedure_groups" :items-per-page="itemsPerPage"
        :total-items="totalItems" :loading="loadingList" :search-query="searchQuery" :search-props="searchProps"
        item-value="id" @load-items="fetchHospitalProcedureGroups">
        <template #body="{ items }">
          <tr v-for="item in items as HospitalProcedureGroupListing[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedHospitalProcedureGroups.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td class="text-primary cursor-pointer" @click="onViewClick(item)">{{ item.name }}</td>
            <td>{{ item.description }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td>
              <TableAction @onEdit="onCreateEditClick(item)" @on-view="onViewClick(item)"
                @onDelete="onDelete(item.id)" />
            </td>
          </tr>
        </template>
        <template v-if="!hospitalProcedureGroupStore.hospital_procedure_groups.length" #body>
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

  <CreateUpdateHospitalProcedureGroupModal v-if="hospitalProcedureGroupData" v-model="dialog" :data="hospitalProcedureGroupData"
    :error="errorMsg" @onSubmit="onSubmit" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>
