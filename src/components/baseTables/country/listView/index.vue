<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateCountryModal from "@/components/baseTables/country/CreateUpdateCountryModal.vue";
import ViewCountryModal from "@/components/baseTables/country/ViewCountryModal.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useCountryStore } from "@/store/baseTables/countryStore";
import { countryService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { listViewHeader } from "@/components/baseTables/country/listView/utils";
import { CountryListingType, CountryOption } from "@/components/baseTables/country/types";

const { t } = useI18n();
const toast = useToast();
const countryStore = useCountryStore();
const router = useRouter();

const dialog = ref(false);
const viewDialog = ref(false);
const countryData = ref<CountryListingType | null>(null);
const deleteDialog = ref(false);
const deleteId = ref<string | null>(null);
const deleteLoading = ref(false);
const searchQuery = ref("");
const searchProps = "name,code,iso2Code,iso3Code,phoneCode,currency,currencySymbol,currencyCode";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedCountries = ref<any[]>([]);
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const loadingList = computed(() => countryStore.loading);
const totalItems = computed(() => countryStore.pagination.totalElements);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

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

watch(selectedCountries, newSelection => {
  console.log("Países selecionados:", newSelection);
}, { deep: true });

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
    dialog.value = true;
  } else {
    router.push({
      path: "/baseTable/edit-country",
      query: {
        id: data.id,
      },
    });
  }
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
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t('t-message-save-error')).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

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
    getApiErrorMessages(error, t('t-toast-message-deleted-erros')).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
  }
};
</script>

<template>
  <ListingPageShell
    class="base-table-listing-page"
    :title="$t('t-country-list')"
    subtitle="Consulte, pesquise e faça a gestão dos países registados."
    :action-label="$t('t-add-country')"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-country')" />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer v-model="selectedCountries" v-model:page="currentPage"
      :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="countryStore.countries" :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loadingList"
      :search-query="searchQuery" :search-props="searchProps" item-value="id" :show-pagination="false"
      @load-items="fetchCountries">
      <template #body="{ items }">
        <tr v-for="item in items as CountryListingType[]" :key="item.id" class="base-table-listing-page__row">
          <td data-label="">
            <v-checkbox :model-value="selectedCountries.some(selected => selected.id === item.id)"
              @update:model-value="toggleSelection(item)" hide-details density="compact" />
          </td>
          <td data-label="País" class="base-table-listing-page__primary-cell">{{ item.name }}</td>
          <td data-label="Código">{{ item.code }}</td>
          <td data-label="ISO2">{{ item.iso2Code }}</td>
          <td data-label="ISO3">{{ item.iso3Code }}</td>
          <td data-label="Telefone">{{ item.phoneCode }}</td>
          <td data-label="Estado">
            <Status :status="item.enabled ? 'enabled' : 'disabled'" />
          </td>
          <td data-label="Acção" class="base-table-listing-page__actions-cell">
            <TableAction @onEdit="onCreateEditClick(item as CountryListingType)"
              @onView="onViewClick(item as CountryListingType)"
              @onDelete="onDelete((item as CountryListingType).id)" />
          </td>
        </tr>
      </template>

      <template v-if="!countryStore.countries.length" #body>
        <tr>
          <td :colspan="listViewHeader.length + 1" class="base-table-listing-page__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="base-table-listing-page__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="base-table-listing-page__empty-title mt-3">
              {{ $t('t-search-not-found-message') }}
            </div>
            <div class="base-table-listing-page__empty-subtitle mt-1">
              Ajuste a pesquisa e tente novamente.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <CreateUpdateCountryModal v-if="countryData" v-model="dialog" :data="countryData" @onSubmit="onSubmit"
    :error="errorMsg" />

  <ViewCountryModal v-if="countryData" v-model="viewDialog" :data="countryData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />
</template>

<style scoped>
.base-table-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.base-table-listing-page :deep(.v-table),
.base-table-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.base-table-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.base-table-listing-page :deep(.v-table__wrapper > table > thead),
.base-table-listing-page :deep(.v-data-table thead) {
  background: #f3f6fa;
}

.base-table-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.base-table-listing-page :deep(.v-data-table-header th),
.base-table-listing-page :deep(.v-data-table__th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.base-table-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.base-table-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.base-table-listing-page :deep(.v-data-table-header th:last-child),
.base-table-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.base-table-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.base-table-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.base-table-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.base-table-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 0.8rem;
  padding-top: 18px;
  padding-bottom: 18px;
  vertical-align: middle;
  white-space: normal;
}

.base-table-listing-page :deep(.v-data-table__tr:hover) {
  background: #fcfdff !important;
}

.base-table-listing-page :deep(.v-data-table__td--select),
.base-table-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.base-table-listing-page__primary-cell {
  color: #334155;
  font-weight: 500;
}

.base-table-listing-page__actions-cell {
  white-space: nowrap;
}

.base-table-listing-page :deep(.base-table-listing-page__actions-cell .d-flex) {
  gap: 6px;
}

.base-table-listing-page :deep(.base-table-listing-page__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.base-table-listing-page__empty-avatar {
  border: 1px solid #e2e8f0;
}

.base-table-listing-page__empty-title {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 700;
}

.base-table-listing-page__empty-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}
</style>
