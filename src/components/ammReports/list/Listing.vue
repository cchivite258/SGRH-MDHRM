<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import TableActionMenu from "@/app/common/components/TableActionMenu.vue";
import {
  reports,
  reportHeader,
  reportAction,
} from "@/components/ammReports/list/utils";

import Table from "@/app/common/components/Table.vue";
import { ReportType } from "@/components/ammReports/types";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import { useRoute, useRouter } from "vue-router";
import ReportPreviewDialogsHost from "@/components/ammReports/list/ReportPreviewDialogsHost.vue";
import ReportGenerateDialogsHost from "@/components/ammReports/list/ReportGenerateDialogsHost.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { can, canAny } = usePermissions();
const route = useRoute();
const router = useRouter();

const previewDialogsHost = ref<InstanceType<typeof ReportPreviewDialogsHost> | null>(null);
const generateDialogsHost = ref<InstanceType<typeof ReportGenerateDialogsHost> | null>(null);

const prop = defineProps({
  filters: {
    type: Object,
    default: () => { },
  },
});

const isAllChecked = ref(false);
const mappedReports = reports.map((data) => {
  return {
    ...data,
    isChecked: false,
  };
});

const page = ref(1);
const searchQuery = ref("");
const canGenerateReports = computed(() => can(PERMISSIONS.REPORTS.GENERATE));
const visibleReportHeader = computed(() => (
  canGenerateReports.value ? reportHeader : reportHeader.filter((item) => !item.isCheck)
));

const getReportPermission = (report: ReportType) => {
  return PERMISSIONS.REPORTS.BY_ID[report.id as keyof typeof PERMISSIONS.REPORTS.BY_ID] || PERMISSIONS.REPORTS.VIEW;
};

// Cada relatorio aparece se o utilizador tiver a permissao geral de relatorios
// ou a permissao especifica mapeada para esse relatorio.
const canReadReport = (report: ReportType) => {
  return canAny([PERMISSIONS.REPORTS.VIEW, getReportPermission(report)]);
};

const filteredReports = computed(() => {
  const val = searchQuery.value.toLowerCase();

  return mappedReports.filter((report) =>
    canReadReport(report) && t(`t-${report.title}`).toLowerCase().includes(val)
  );
});

const noOfItems = computed(() => filteredReports.value.length);
const loading = ref(false);

const config = ref({
  page: page.value,
  start: 1,
  end: Math.min(10, noOfItems.value),
  noOfItems: noOfItems.value,
  itemsPerPage: 10,
});

const paginatedReports = computed(() => {
  const { itemsPerPage } = config.value;
  const startIndex = (page.value - 1) * itemsPerPage;
  return filteredReports.value.slice(startIndex, startIndex + itemsPerPage);
});

const syncConfig = () => {
  const { itemsPerPage } = config.value;
  const start = filteredReports.value.length === 0 ? 0 : (page.value - 1) * itemsPerPage + 1;
  const end = Math.min(page.value * itemsPerPage, filteredReports.value.length);

  config.value = {
    ...config.value,
    page: page.value,
    start,
    end,
    noOfItems: filteredReports.value.length,
  };
};

onMounted(() => {
  syncConfig();
});
watch(page, syncConfig);
watch(filteredReports, syncConfig, { deep: true });


const onSelectAll = () => {
  if (!canGenerateReports.value) return;

  isAllChecked.value = !isAllChecked.value;

  // Atualiza todos os itens filtrados
  filteredReports.value.forEach(item => {
    item.isChecked = isAllChecked.value;
  });

  // Atualiza os itens da página actual
  paginatedReports.value.forEach(item => {
    item.isChecked = isAllChecked.value;
  });
};


const onSelect = (action: string, data: ReportType) => {
  if (action === "preview" && !canReadReport(data)) return;
  if (action === "generate" && !canGenerateReports.value) return;

  if (action === "preview") {
    previewDialogsHost.value?.openPreviewDialog(data.id);
    return;
  }

  if (action === "generate") {
    generateDialogsHost.value?.openGenerateDialog(data.id);
  }
};

const getReportActions = (report: ReportType) => {
  return reportAction
    .filter((item) => {
      if (item.value === "preview") return canReadReport(report);
      if (item.value === "generate") return canGenerateReports.value;
      return false;
    })
    .map((item) => ({
      ...item,
      title: t(`t-${item.title}`),
    }));
};

const openPreviewFromRoute = () => {
  const reportId = String(route.query.previewReport || "");
  if (!reportId) return;

  // Deep link compativel: /reports/list?previewReport=100004 abre o filtro
  // sem duplicar refs/imports dos dialogs de preview neste componente.
  const report = mappedReports.find((item) => item.id === reportId);
  if (report) {
    onSelect("preview", report);
  }

  const query = { ...route.query };
  delete query.previewReport;
  router.replace({ name: "ReportsList", query });
};

onMounted(openPreviewFromRoute);
watch(() => route.query.previewReport, openPreviewFromRoute);

watch(searchQuery, () => {
  page.value = 1;
});

</script>
<template>
  <ListingPageShell
    class="reports-card"
    :title="$t('t-reports-list')"
    subtitle="Consulte, pesquise e execute os relatórios disponíveis no sistema."
    :show-action="false"
    :show-pagination="false"
  >
    <template #afterHeader>
      <div class="reports-header mb-4">
        <div class="reports-header-left">
          <div class="reports-header-subtitle">{{ filteredReports.length }} {{ $t('t-results') }}</div>
        </div>
        <div class="reports-header-right">
          <v-chip size="x-small" variant="outlined" color="grey-darken-1">
            {{ $t('t-search-for-report') }}
          </v-chip>
        </div>
      </div>
    </template>

    <template #filters>
      <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-report')" />
    </template>

    <div>
      <Table v-model="page" :config="config"
        :headerItems="visibleReportHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" is-pagination
        :loading="loading" @onSelectAll="onSelectAll">
        <template #body>
          <tr v-for="item in paginatedReports" :key="item.id" class="report-row">
            <td v-if="canGenerateReports">
              <v-checkbox v-model="item.isChecked" color="primary" hide-details />
            </td>
            <td class="text-primary cursor-pointer">
              <span class="report-code-badge">
                #{{ item.id || 'N/A' }}
              </span>
            </td>
            <td>
              <div class="d-flex align-center report-title-cell">
                <v-btn
                  icon
                  rounded
                  variant="outlined"
                  density="comfortable"
                  class="report-document-trigger"
                  @click="onSelect('preview', item)"
                >
                  <i :class="item.img"></i>
                </v-btn>
                <span class="font-weight-bold report-title-text">{{ $t(`t-${item.title}`) }}</span>
              </div>
            </td>
            <td class="report-actions-cell">
              <TableActionMenu
                v-if="getReportActions(item).length"
                :menuItems="getReportActions(item)"
                @onSelect="onSelect($event, item)"
              />
            </td>
          </tr>
        </template>
      </Table>
      <div v-if="!filteredReports.length" class="text-center pa-7">
        <div class="mb-3">
          <v-avatar color="primary" variant="tonal" size="x-large">
            <i class="ph-magnifying-glass ph-lg"></i>
          </v-avatar>
        </div>
        <div class="text-subtitle-1 font-weight-bold">
          {{ $t("t-search-not-found-message") }}
        </div>
      </div>
    </div>
  </ListingPageShell>


  <ReportPreviewDialogsHost ref="previewDialogsHost" />
  <ReportGenerateDialogsHost ref="generateDialogsHost" />
</template>

<style scoped>
.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.14);
}

.reports-header-title {
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.reports-header-subtitle {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.68);
  margin-top: 2px;
}

.report-row {
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.report-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.report-row td {
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.report-code-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(var(--v-theme-primary), 0.45);
  background: rgba(var(--v-theme-primary), 0.16);
  color: rgb(var(--v-theme-primary));
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.15px;
}

.report-title-cell {
  gap: 8px;
}

.report-document-trigger {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow: none;
}

.report-title-text {
  color: rgb(var(--v-theme-on-surface));
}

.report-actions-cell {
  text-align: center;
}

.reports-card :deep(.report-actions-cell .d-flex) {
  justify-content: center !important;
  width: 100%;
}

.reports-card :deep(.report-actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

@media (max-width: 960px) {
  .reports-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
