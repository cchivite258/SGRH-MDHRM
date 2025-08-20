<script lang="ts" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import { listViewHeader } from "@/components/baseTables/country/listView/utils";
import { CountryListingType, CountryInsertType } from "@/components/baseTables/country/types";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateCountryModal from "@/components/baseTables/country/CreateUpdateCountryModal.vue";
import ViewCountryModal from "@/components/baseTables/country/ViewCountryModal.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useCountryStore } from "@/store/baseTables/countryStore";
import { countryService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import { CountryOption } from "@/components/baseTables/country/types";


const { t } = useI18n();
//criacao da mensagem toast
const toast = useToast();

const countryStore = useCountryStore();

const router = useRouter();
const dialog = ref(false);
const viewDialog = ref(false);
const countryData = ref<CountryListingType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const isSelectAll = ref(false);

onMounted(() => {
  fetchCountries({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});

// Campos para pesquisa
const searchQuery = ref("");
const searchProps = "name,code,iso2Code,iso3Code,phoneCode,currency,currencySymbol,currencyCode";

// Paginação
const itemsPerPage = ref(10);
const loadingList = computed(() => countryStore.loading);
const totalItems = computed(() => countryStore.pagination.totalElements);
const selectedCountries = ref<any[]>([])
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const message =
    error?.response?.data?.error?.errors?.name?.[0] ||
    error?.response?.data?.error?.errors?.code?.[0] ||
    error?.response?.data?.error?.errors?.currency?.[0] ||
    error?.response?.data?.error?.errors?.currencyCode?.[0] ||
    error?.response?.data?.error?.errors?.currencySymbol?.[0] ||
    error?.response?.data?.error?.errors?.iso2Code?.[0] ||
    error?.response?.data?.error?.errors?.iso3Code?.[0] ||
    error?.response?.data?.error?.errors?.phoneCode?.[0] ||
    error?.response?.data?.message ||
    error?.message ||
    t("t-message-save-error");

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
  fetchCountries({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
});

// Observa mudanças nos funcionários selecionados
watch(selectedCountries, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })

// Função de carregamento da tabela
const fetchCountries = async ({ page, itemsPerPage, sortBy, search }: CountryOption) => {
  await countryStore.fetchCountries(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
};

const toggleSelection = (item: CountryListingType) => {
  const index = selectedCountries.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedCountries.value = [...selectedCountries.value, item];
  } else {
    selectedCountries.value = selectedCountries.value.filter(selected => selected.id !== item.id);
  }
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    countryData.value = null;
  }
});

const onCreateEditClick = (data: CountryListingType | null) => {
  if (!data) {
    countryData.value = {
      id: "-1",
      name: "",
      code: "",
      iso2Code: "",
      iso3Code: "",
      phoneCode: "",
      currency: "",
      currencySymbol: "",
      currencyCode: "",
      enabled: true
    };
  } else {
    router.push({
      path: "/baseTable/edit-country",
      query: {
        id: data.id,
      },
    });

  }

  dialog.value = true;
};

const onSubmit = async (data: CountryListingType, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      await countryService.createCountry(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await countryService.updateCountry(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await fetchCountries({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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
    countryData.value = null;
  }
});

const onViewClick = (data: CountryListingType | null) => {
  if (!data) {
    countryData.value = {
      id: "-1",
      name: "",
      code: "",
      iso2Code: "",
      iso3Code: "",
      phoneCode: "",
      currency: "",
      currencySymbol: "",
      currencyCode: "",
      enabled: true
    };
  } else {
    countryData.value = data;

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
    await countryService.deleteCountry(deleteId.value!);

    await fetchCountries({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: searchQuery.value });

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
          <span class="text-body-1 font-weight-bold">{{ $t('t-country-list') }}</span>
        </v-col>

        <!-- Container dos elementos à direita -->
        <v-col lg="8" class="d-flex justify-end">
          <v-row justify="end" align="center" no-gutters>
            <v-col lg="4" class="me-3">
              <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-country')" />
            </v-col>
            <v-col lg="auto">
              <v-btn color="secondary" @click="onCreateEditClick(null)">
                <i class="ph-plus-circle me-1" /> {{ $t('t-add-country') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2">
      <DataTableServer v-model="selectedCountries"
        :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="countryStore.countries" :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loadingList"
        :search-query="searchQuery" :search-props="searchProps" item-value="id" @load-items="fetchCountries">
        <template #body="{ items }">
          <tr v-for="item in items as CountryListingType[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedCountries.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.code }}</td>
            <td>{{ item.iso2Code }}</td>
            <td>{{ item.iso3Code }}</td>
            <td>{{ item.phoneCode }}</td>
            <td>{{ item.currency }}</td>
            <td>{{ item.currencySymbol }}</td>
            <td>{{ item.currencyCode }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td> 
            <td>
              <TableAction @onEdit="onCreateEditClick(item as CountryListingType)"
                @onView="onViewClick(item as CountryListingType)"
                @onDelete="onDelete((item as CountryListingType).id)" />

            </td>
          </tr>
        </template>
        <template v-if="!countryStore.countries.length" #body>
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

  <CreateUpdateCountryModal v-if="countryData" v-model="dialog" :data="countryData" @onSubmit="onSubmit"
    :error="errorMsg" />

  <ViewCountryModal v-if="countryData" v-model="viewDialog" :data="countryData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>
