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

import PreviewDialog100001 from "@/components/ammReports/list/HospitalProceduresReport/PreviewDialog.vue";
import GenerateDialog100001 from "@/components/ammReports/list/HospitalProceduresReport/GenerateDialog.vue";

import PreviewDialog100002 from "@/components/ammReports/list/CostPerEmployeeReport/PreviewDialog.vue";
import GenerateDialog100002 from "@/components/ammReports/list/CostPerEmployeeReport/GenerateDialog.vue";
import PreviewDialog100003 from "@/components/ammReports/list/ServiceProviderReport/PreviewDialog.vue";
import GenerateDialog100003 from "@/components/ammReports/list/ServiceProviderReport/GenerateDialog.vue";
import PreviewDialog100004 from "@/components/ammReports/list/TopServiceTypesByClinicReport/PreviewDialog.vue";
import GenerateDialog100004 from "@/components/ammReports/list/TopServiceTypesByClinicReport/GenerateDialog.vue";
import PreviewDialog100005 from "@/components/ammReports/list/ServiceProviderComparisonReport/PreviewDialog.vue";
import GenerateDialog100005 from "@/components/ammReports/list/ServiceProviderComparisonReport/GenerateDialog.vue";
import PreviewDialog100006 from "@/components/ammReports/list/CompanyEmployeeLimitsReport/PreviewDialog.vue";
import GenerateDialog100006 from "@/components/ammReports/list/CompanyEmployeeLimitsReport/GenerateDialog.vue";
import PreviewDialog100007 from "@/components/ammReports/list/TotalBilledMedicalAssistanceReport/PreviewDialog.vue";
import GenerateDialog100007 from "@/components/ammReports/list/TotalBilledMedicalAssistanceReport/GenerateDialog.vue";
import PreviewDialog100008 from "@/components/ammReports/list/TotalBilledByProviderReport/PreviewDialog.vue";
import GenerateDialog100008 from "@/components/ammReports/list/TotalBilledByProviderReport/GenerateDialog.vue";
import PreviewDialog100009 from "@/components/ammReports/list/EmployeeExpenseStatementReport/PreviewDialog.vue";
import GenerateDialog100009 from "@/components/ammReports/list/EmployeeExpenseStatementReport/GenerateDialog.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const previewDialog100001 = ref(false);
const generateDialog100001 = ref(false);

const previewDialog100002 = ref(false);
const generateDialog100002 = ref(false);
const previewDialog100003 = ref(false);
const generateDialog100003 = ref(false);
const previewDialog100004 = ref(false);
const generateDialog100004 = ref(false);
const previewDialog100005 = ref(false);
const generateDialog100005 = ref(false);
const previewDialog100006 = ref(false);
const generateDialog100006 = ref(false);
const previewDialog100007 = ref(false);
const generateDialog100007 = ref(false);
const previewDialog100008 = ref(false);
const generateDialog100008 = ref(false);
const previewDialog100009 = ref(false);
const generateDialog100009 = ref(false);

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

const filteredReports = ref<ReportType[]>(mappedReports);
const finalData = ref<ReportType[]>(filteredReports.value);

const page = ref(1);
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

onMounted(syncConfig);
watch(page, syncConfig);
watch(filteredReports, syncConfig, { deep: true });


const onSelectAll = () => {
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


const reportHandlers: Record<string, {
  preview?: () => void;
  generate?: () => void;
}> = {
  "100001": {
    preview: () => previewDialog100001.value = true,
    generate: () => generateDialog100001.value = true,
  },
  "100002": {
     preview: () => previewDialog100002.value = true,
     generate: () => generateDialog100002.value = true
  },
  "100003": {
     preview: () => previewDialog100003.value = true,
     generate: () => generateDialog100003.value = true
  },
  "100004": {
     preview: () => previewDialog100004.value = true,
     generate: () => generateDialog100004.value = true
  },
  "100005": {
     preview: () => previewDialog100005.value = true,
     generate: () => generateDialog100005.value = true
  },
  "100006": {
     preview: () => previewDialog100006.value = true,
     generate: () => generateDialog100006.value = true
  },
  "100007": {
     preview: () => previewDialog100007.value = true,
     generate: () => generateDialog100007.value = true
  },
  "100008": {
     preview: () => previewDialog100008.value = true,
     generate: () => generateDialog100008.value = true
  },
  "100009": {
     preview: () => previewDialog100009.value = true,
     generate: () => generateDialog100009.value = true
  },
};



const onSelect = (action: string, data: ReportType) => {
  const handler = reportHandlers[data.id];

  if (!handler) {
    console.warn("Nenhum handler definido para relatório ID:", data.id);
    return;
  }

  if (action === "preview" && handler.preview) {
  handler.preview();
}

if (action === "generate" && handler.generate) {
  handler.generate();
}

};

const reportActions = computed(() => {
  return reportAction.map((item) => ({
    ...item,
    title: t(`t-${item.title}`),
  }));
});


const searchQuery = ref("");

watch(searchQuery, (value) => {
  const val = value.toLowerCase();

  filteredReports.value = finalData.value.filter((report) =>
    t(`t-${report.title}`).toLowerCase().includes(val)
  );
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
        :headerItems="reportHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" is-pagination
        :loading="loading" @onSelectAll="onSelectAll">
        <template #body>
          <tr v-for="item in paginatedReports" :key="item.id" class="report-row">
            <td>
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
              <TableActionMenu :menuItems="reportActions" @onSelect="onSelect($event, item)" />
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


  <PreviewDialog100001 v-model="previewDialog100001"  />
  <GenerateDialog100001 v-model="generateDialog100001"  />


  <PreviewDialog100002 v-model="previewDialog100002"  />
  <GenerateDialog100002 v-model="generateDialog100002"  />

  <PreviewDialog100003 v-model="previewDialog100003"  />
  <GenerateDialog100003 v-model="generateDialog100003"  />
  <PreviewDialog100004 v-model="previewDialog100004"  />
  <GenerateDialog100004 v-model="generateDialog100004"  />
  <PreviewDialog100005 v-model="previewDialog100005"  />
  <GenerateDialog100005 v-model="generateDialog100005"  />
  <PreviewDialog100006 v-model="previewDialog100006"  />
  <GenerateDialog100006 v-model="generateDialog100006"  />
  <PreviewDialog100007 v-model="previewDialog100007"  />
  <GenerateDialog100007 v-model="generateDialog100007"  />
  <PreviewDialog100008 v-model="previewDialog100008"  />
  <GenerateDialog100008 v-model="generateDialog100008"  />
  <PreviewDialog100009 v-model="previewDialog100009"  />
  <GenerateDialog100009 v-model="generateDialog100009"  />



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
