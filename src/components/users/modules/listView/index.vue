<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import ListingSearchCard from "@/app/common/components/listing/ListingSearchCard.vue";
import Status from "@/app/common/components/Status.vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { useModuleStore } from "@/store/moduleStore";
import ViewModuleModal from "@/components/users/modules/ViewModuleModal.vue";
import type { OptionType } from "@/app/common/types/option.type";
import type { ModuleFetchParams, ModuleListingType } from "@/components/users/modules/types";
import { moduleHeader } from "@/components/users/modules/listView/utils";

const { t } = useI18n();
const toast = useToast();
const moduleStore = useModuleStore();

const searchQuery = ref("");
const searchProps = "name,description";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const viewDialog = ref(false);
const moduleData = ref<ModuleListingType | null>(null);

const actionOptions: OptionType[] = [
  { title: t("t-view"), value: "view", icon: "ph-eye" },
];

const loadingList = computed(() => moduleStore.loading);
const totalItems = computed(() => moduleStore.pagination.totalElements);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const fetchModules = async ({ page, itemsPerPage, sortBy, search }: ModuleFetchParams) => {
  try {
    await moduleStore.fetchModules(
      page - 1,
      itemsPerPage,
      sortBy[0]?.key || "name",
      sortBy[0]?.order || "asc",
      search || searchQuery.value,
      searchProps
    );

    currentPage.value = (moduleStore.pagination.currentPage ?? page - 1) + 1;
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach(message => toast.error(message));
  }
};

const onViewClick = (data: ModuleListingType) => {
  moduleData.value = data;
  viewDialog.value = true;
};
</script>

<template>
  <ListingPageShell
    class="module-listing-page"
    :title="$t('t-modules-list')"
    subtitle="Consulte e pesquise os modulos configurados para gestao de acessos."
    :show-action="false"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
  >
    <template #filters>
      <ListingSearchCard v-model="searchQuery" :placeholder="$t('t-search-for-modules')" />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer
      v-model:page="currentPage"
      :headers="moduleHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
      :items="moduleStore.modules"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :loading="loadingList"
      :search-query="searchQuery"
      :search-props="searchProps"
      item-value="id"
      :show-pagination="false"
      :show-select="false"
      @load-items="fetchModules"
    >
      <template #body="{ items }">
        <tr v-for="item in items as ModuleListingType[]" :key="item.id" class="module-listing-table__row">
          <td data-label="Nome" class="module-listing-table__primary-cell">
            {{ item.name || "-" }}
          </td>
          <td data-label="Descricao">
            {{ item.description || "-" }}
          </td>
          <td data-label="Disponibilidade">
            <Status :status="item.enabled ? 'active' : 'unactive'" />
          </td>
          <td data-label="Accao" class="module-listing-table__actions-cell">
            <TableActionMenu :menu-items="actionOptions" @onView="onViewClick(item)" />
          </td>
        </tr>
      </template>

      <template v-if="moduleStore.modules.length === 0" #body>
        <tr>
          <td :colspan="moduleHeader.length" class="module-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="module-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="module-listing-table__empty-title mt-3">
              {{ $t("t-search-not-found-message") }}
            </div>
            <div class="module-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faca uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <ViewModuleModal v-if="moduleData" v-model="viewDialog" :data="moduleData" />
</template>

<style scoped>
.module-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.module-listing-page :deep(.v-table),
.module-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.module-listing-page :deep(.v-table__wrapper > table > thead),
.module-listing-page :deep(.v-data-table thead) {
  background: #f3f6fa;
}

.module-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.module-listing-page :deep(.v-data-table-header th),
.module-listing-page :deep(.v-data-table__th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-bottom: 10px;
  padding-top: 10px;
  text-transform: none;
}

.module-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.module-listing-page :deep(.v-data-table-header th:last-child),
.module-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.module-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.module-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.module-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.module-listing-table__primary-cell {
  color: #0f172a;
  font-weight: 700;
}

.module-listing-table__actions-cell {
  text-align: center;
}

.module-listing-table__empty-title {
  color: #172033;
  font-size: 0.95rem;
  font-weight: 700;
}

.module-listing-table__empty-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}

@media (max-width: 767px) {
  .module-listing-page :deep(.v-table__wrapper) {
    overflow-x: auto;
  }
}
</style>
