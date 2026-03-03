<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import {
  reports,
  reportHeader,
  reportAction,
} from "@/components/ammReports/list/utils";

import Table from "@/app/common/components/Table.vue";
import { ReportType } from "@/components/ammReports/types";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Card from "@/app/common/components/Card.vue";

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
const noOfItems = computed(() => {
  return finalData.value.length;
});
const tableData = ref<ReportType[]>([]);
const loading = ref(false);

const config = ref({
  page: page.value,
  start: 0,
  end: 0,
  noOfItems: noOfItems.value,
  itemsPerPage: 10,
});

const getPaginatedData = () => {
  const { itemsPerPage, page } = config.value;
  const start = (page - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  end = end <= noOfItems.value ? end : noOfItems.value;

  config.value = {
    ...config.value,
    start,
    end,
  };

  const data = filteredReports.value.slice(
    config.value.start,
    config.value.end
  );

  loading.value = true;
  tableData.value = [];

  setTimeout(() => {
  tableData.value = data.map(item => ({
    ...item,
  }));

  // aplica o selectAll se estiver ativo
  if (isAllChecked.value) {
    tableData.value.forEach(item => (item.isChecked = true));
  }

  loading.value = false;
}, 200);

};

onMounted(() => {
  getPaginatedData();
});

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
});


const onSelectAll = () => {
  isAllChecked.value = !isAllChecked.value;

  // Atualiza todos os itens filtrados
  filteredReports.value.forEach(item => {
    item.isChecked = isAllChecked.value;
  });

  // Atualiza os itens da página actual
  tableData.value.forEach(item => {
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


const updateTableData = (newVal: ReportType[]) => {
  loading.value = true;
  const { itemsPerPage } = config.value;

  const start = 1;
  let end = start + itemsPerPage;
  end = end <= newVal.length ? end : newVal.length;
  tableData.value = [];

  setTimeout(() => {
    tableData.value = newVal;
    config.value = {
      ...config.value,
      start,
      end,
      noOfItems: newVal.length,
    };
    loading.value = false;
  }, 200);
};

const searchQuery = ref("");

watch(searchQuery, (value) => {
  const val = value.toLowerCase();

  filteredReports.value = finalData.value.filter((report) =>
    t(`t-${report.title}`).toLowerCase().includes(val)
  );

  updateTableData(filteredReports.value);
});

</script>
<template>
  <Card :title="$t('t-reports')" class="mt-7 reports-card">
    <v-card-text>
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
      <v-row>
        <v-col cols="12" lg="12">
          <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-report')" />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text>
      <Table v-model="page" :config="config"
        :headerItems="reportHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" is-pagination
        :loading="loading" @onSelectAll="onSelectAll">
        <template #body>
          <tr v-for="item in tableData" :key="item.id" class="report-row">
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
                <v-avatar color="light" class="pa-2 mx-1 report-avatar" rounded>
                  <i :class="item.img"></i>
                </v-avatar>
                <span class="font-weight-bold report-title-text">{{ $t(`t-${item.title}`) }}</span>
              </div>
            </td>
            <td class="text-end">
              <ListMenuWithIcon :menuItems="reportAction.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" @onSelect="onSelect($event, item)" />
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
    </v-card-text>
  </Card>


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
.reports-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}

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

.report-avatar {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.report-title-text {
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 960px) {
  .reports-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
