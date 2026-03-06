<script lang="ts" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import { listViewHeader } from "@/components/baseTables/languages/listView/utils";
import type { LanguagesUpdate, LanguagesListing, LanguagesInsert } from "@/components/baseTables/languages/types";
import Rtl from "@/app/common/components/Rtl.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateLanguagesModal from "@/components/baseTables/languages/CreateUpdateLanguagesModal.vue";
import ViewLanguagesModal from "@/components/baseTables/languages/ViewLanguagesModal.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { languageService } from "@/app/http/httpServiceProvider";
import { useLanguagesStore } from "@/store/baseTables/languageStore";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { LanguagesOption } from "@/components/baseTables/languages/types";
import Status from "@/app/common/components/Status.vue";

const { t } = useI18n();
const toast = useToast();

const languagesStore = useLanguagesStore();

const router = useRouter();
const dialog = ref(false);
const viewDialog = ref(false);
const languagesData = ref<LanguagesListing | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const isSelectAll = ref(false);

// Campos para pesquisa
const searchQuery = ref("");
const searchProps = "name,region,code,localizedName";

// Paginação
const itemsPerPage = ref(10);
const loadingList = computed(() => languagesStore.loading);
const totalItems = computed(() => languagesStore.pagination.totalElements);
const selectedLanguages = ref<any[]>([])

const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const message = getApiErrorMessages(error, t("t-message-save-error"))[0] || t("t-message-save-error");

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
  fetchLanguages({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});


// Observa mudanças nos funcionários selecionados
watch(selectedLanguages, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })

// Função de carregamento da tabela
const fetchLanguages = async ({ page, itemsPerPage, sortBy, search }: LanguagesOption) => {
  await languagesStore.fetchLanguages(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
};

const toggleSelection = (item: LanguagesListing) => {
  const index = selectedLanguages.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedLanguages.value = [...selectedLanguages.value, item];
  } else {
    selectedLanguages.value = selectedLanguages.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    languagesData.value = null;
  }
});

const onCreateEditClick = (data: LanguagesListing | null) => {
  if (!data) {
    languagesData.value = {
      id: "-1",
      name: "",
      code: "",
      localizedName: "",
      region: "",
      rtl: false,
      enabled: true
    };
  } else {
    languagesData.value = data;
  }

  dialog.value = true;
};

const onSubmit = async (data: LanguagesListing, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      await languageService.createLanguages(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await languageService.updateLanguages(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await fetchLanguages({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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
    languagesData.value = null;
  }
});

const onViewClick = (data: LanguagesListing | null) => {
  if (!data) {
    languagesData.value = {
      id: "-1",
      name: "",
      code: "",
      localizedName: "",
      region: "",
      rtl: false,
      enabled: true

    };
  } else {
    languagesData.value = data;

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
    await languageService.deleteLanguages(deleteId.value!);

    await fetchLanguages({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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
          <span class="text-body-1 font-weight-bold">{{ $t('t-language-list') }}</span>
        </v-col>
        <!-- Container dos elementos à direita -->
        <v-col lg="8" class="d-flex justify-end">
          <v-row justify="end" align="center" no-gutters>
            <v-col lg="4" class="me-3">
              <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-language')" />
            </v-col>
            <v-col lg="auto">
              <v-btn color="secondary" @click="onCreateEditClick(null)">
                <i class="ph-plus-circle me-1" /> {{ $t('t-add-language') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2">
      <DataTableServer v-model="selectedLanguages" :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="languagesStore.languages" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" item-value="id"
        @load-items="fetchLanguages">
        <template #body="{ items }">
          <tr v-for="item in items as LanguagesListing[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedLanguages.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ item.name?.toUpperCase() }}</td>
            <td>{{ item.code?.toUpperCase() }}</td>
            <td>{{ item.localizedName?.toUpperCase() }}</td>
            <td>{{ item.region?.toUpperCase() }}</td>
            <td>
              <Rtl :rtl="item.rtl ? 'true' : 'false'" />
            </td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td>
              <TableAction @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)" />
            </td>
          </tr>
        </template>
        <template v-if="!languagesStore.languages.length" #body>
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

  <CreateUpdateLanguagesModal v-if="languagesData" v-model="dialog" :data="languagesData" :error="errorMsg"
    @onSubmit="onSubmit" />

  <ViewLanguagesModal v-if="languagesData" v-model="viewDialog" :data="languagesData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>

