<script lang="ts" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import { listViewHeader } from "@/components/baseTables/currency/listView/utils";
import { CurrencyListingType, CurrencyInsertType } from "@/components/baseTables/currency/types";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateCurrencyModal from "@/components/baseTables/currency/CreateUpdateCurrencyModal.vue";
import ViewCurrencyModal from "@/components/baseTables/currency/ViewCurrencyModal.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { currencyService } from "@/app/http/httpServiceProvider";
import { useCurrencyStore } from "@/store/baseTables/currencyStore";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { CurrencyOption } from "@/components/baseTables/currency/types";
import { getApiErrorMessages } from "@/app/common/apiErrors";


const { t } = useI18n();
//criacao da mensagem toast
const toast = useToast();

const currencyStore = useCurrencyStore();

const router = useRouter();
const dialog = ref(false);
const viewDialog = ref(false);
const currencyData = ref<CurrencyListingType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const isSelectAll = ref(false);

// Campos para pesquisa
const searchQuery = ref("");
const searchProps = "name,symbol";

// Paginação
const itemsPerPage = ref(10);
const loadingList = computed(() => currencyStore.loading);
const totalItems = computed(() => currencyStore.pagination.totalElements);
const selectedCurrencies = ref<any[]>([]);
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const handleApiError = (error: any) => {
  console.error(" ERRO COMPLETO:", JSON.stringify(error, null, 2));
  console.error(" RESPONSE:", error?.response);
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


// Carregamento inicial
onMounted(() => {
  fetchCurrencies({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});

// Observa mudanças nos funcionários selecionados
watch(selectedCurrencies, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })

// Função de carregamento da tabela
const fetchCurrencies = async ({ page, itemsPerPage, sortBy, search }: CurrencyOption) => {
  await currencyStore.fetchCurrencies(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
};

const toggleSelection = (item: CurrencyListingType) => {
  const index = selectedCurrencies.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedCurrencies.value = [...selectedCurrencies.value, item];
  } else {
    selectedCurrencies.value = selectedCurrencies.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    currencyData.value = null;
  }
});

const onCreateEditClick = (data: CurrencyListingType | null) => {
  if (!data) {
    currencyData.value = {
      id: "-1",
      name: "",
      symbol: "",
      enabled: true
    };
  } else {
    currencyData.value = data;
  }

  dialog.value = true;
};

const onSubmit = async (data: CurrencyListingType, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      await currencyService.createCurrency(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await currencyService.updateCurrency((data.id), data);
      toast.success(t('t-toast-message-update'));
    }

    await fetchCurrencies({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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
    currencyData.value = null;
  }
});

const onViewClick = (data: CurrencyListingType | null) => {
  if (!data) {
    currencyData.value = {
      id: "-1",
      name: "",
      symbol: "",
      enabled: true
    };
  } else {
    currencyData.value = data;

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
    await currencyService.deleteCurrency(deleteId.value!);

    await fetchCurrencies({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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
          <span class="text-body-1 font-weight-bold">{{ $t('t-currency-list') }}</span>
        </v-col>

        <!-- Container dos elementos à direita -->
        <v-col lg="8" class="d-flex justify-end">
          <v-row justify="end" align="center" no-gutters>
            <v-col lg="4" class="me-3">
              <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-currency')" />
            </v-col>
            <v-col lg="auto">
              <v-btn color="secondary" @click="onCreateEditClick(null)">
                <i class="ph-plus-circle me-1" /> {{ $t('t-add-currency') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2">
      <DataTableServer v-model="selectedCurrencies" :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="currencyStore.currencies" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" item-value="id"
        @load-items="fetchCurrencies">
        <template #body="{ items }">
          <tr v-for="item in items as CurrencyListingType[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedCurrencies.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td style="padding-right: 200px;">{{ item.name }}</td>
            <td style="padding-right: 200px;">{{ item.symbol }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td> 
            <td>
              <TableAction @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)" />
            </td>
          </tr>
        </template>
        <template v-if="!currencyStore.currencies.length" #body>
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

  <CreateUpdateCurrencyModal v-if="currencyData" v-model="dialog" :data="currencyData" :error="errorMsg"
    @onSubmit="onSubmit" />

  <ViewCurrencyModal v-if="currencyData" v-model="viewDialog" :data="currencyData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>


