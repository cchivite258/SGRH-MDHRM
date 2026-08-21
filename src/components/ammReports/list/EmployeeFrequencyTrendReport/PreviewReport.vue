<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { formateDate } from "@/app/common/dateFormate";
import { useI18n } from "vue-i18n";
import type { EmployeeFrequencyTrendReportType } from "@/components/ammReports/types";
import { EmployeeFrequencyTrendReportExporter } from "./exportUtils";
import ReportPreviewFooter from "@/components/ammReports/list/ReportPreviewFooter.vue";
import ReportPreviewPagination from "@/components/ammReports/list/ReportPreviewPagination.vue";
import { useReportPreviewPagination } from "@/components/ammReports/list/reportPreviewPagination";

const props = defineProps<{
  report: EmployeeFrequencyTrendReportType
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const exporting = ref(false);
const exportMenu = ref(false);

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value === "en" ? "en-US" : "pt-PT"));

const employeeName = (item: NonNullable<EmployeeFrequencyTrendReportType["employees"]>[number]) => {
  const employee = item.employee;
  return `${employee?.firstName || ""} ${employee?.middleName || ""} ${employee?.lastName || ""}`.replace(/\s+/g, " ").trim() || "-";
};

const normalizedRows = computed(() => {
  return (props.report?.employees || []).map((item) => ({
    employeeName: employeeName(item),
    employeeNumber: item.employee?.employeeNumber || "-",
    frequency: Number(item.frequency || 0)
  })).sort((a, b) => b.frequency - a.frequency);
});

const employeeTotals = computed(() => {
  return normalizedRows.value.map((item) => ({
    employeeName: item.employeeName,
    employeeNumber: item.employeeNumber,
    frequency: item.frequency
  })).sort((a, b) => b.frequency - a.frequency);
});

const totals = computed(() => {
  const rows = normalizedRows.value;
  const frequencySum = rows.reduce((sum, row) => sum + row.frequency, 0);
  const maxFrequency = rows.reduce((max, row) => Math.max(max, row.frequency), 0);
  const topEmployee = employeeTotals.value[0];

  return {
    employeeCount: props.report?.employees?.length || 0,
    maxFrequency,
    averageFrequency: props.report?.employees?.length ? frequencySum / (props.report.employees.length || 1) : 0,
    topEmployeeName: topEmployee?.employeeName || "-",
    topEmployeeFrequency: topEmployee?.frequency || 0
  };
});

const { page, itemsPerPage, paginatedRows: paginatedRows } = useReportPreviewPagination(normalizedRows);

const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "";
});

const currentDate = computed(() => {
  return new Date().toLocaleDateString(locale.value === "en" ? "en-US" : "pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
});

const periodRange = computed(() => {
  const period = props.report?.coveragePeriod;
  const start = period?.startDate ? formateDate(period.startDate) : "-";
  const end = period?.endDate ? formateDate(period.endDate) : "-";
  return `${start} - ${end}`;
});

const usagePercent = (value: number) => {
  if (!totals.value.maxFrequency) return 0;
  return Math.max(4, Math.round((value / totals.value.maxFrequency) * 100));
};

const onBack = () => router.push({ path: "/reports/list" });

const handleExport = async (type: "pdf" | "excel" | "csv") => {
  try {
    exporting.value = true;
    const prefix = locale.value === "en" ? "employee-frequency-trend" : "tendencia-frequencia-colaboradores";
    const fileName = `${prefix}-${new Date().toISOString().split("T")[0]}`;

    if (type === "pdf") await EmployeeFrequencyTrendReportExporter.exportToPDF(props.report, userName.value, { fileName });
    if (type === "excel") await EmployeeFrequencyTrendReportExporter.exportToExcel(props.report, userName.value, { fileName });
    if (type === "csv") await EmployeeFrequencyTrendReportExporter.exportToCSV(props.report, userName.value, { fileName });
  } catch (error) {
    console.error(error);
    alert(t("t-error-exporting-report"));
  } finally {
    exporting.value = false;
  }
};
</script>

<template>
  <v-container class="py-8 px-4" max-width="1100px">
    <div class="header-container mb-8">
      <div class="d-flex justify-space-between align-center mb-4 header-row">
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ $t("t-preview-report") }}</h1>
          <div class="text-caption text-grey mt-1">{{ $t("t-report") }} #100013 - {{ $t("t-report-100013-title") }}</div>
        </div>

        <div class="d-flex align-center header-actions">
          <v-chip variant="outlined" size="small" class="mr-3">
            <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
            {{ currentDate }}
          </v-chip>
          <v-btn-group variant="outlined" density="comfortable">
            <v-btn color="primary" prepend-icon="mdi-printer" @click="handleExport('pdf')" :disabled="exporting">{{ $t("t-print") }}</v-btn>
            <v-menu v-model="exportMenu" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn color="grey-darken-2" prepend-icon="mdi-download" v-bind="props" :disabled="exporting" :loading="exporting">
                  {{ $t("t-export") }} <v-icon end>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" class="export-menu-list">
                <v-list-item @click="handleExport('pdf'); exportMenu = false">
                  <template #prepend><v-icon color="red" size="18">mdi-file-pdf-box</v-icon></template>
                  <v-list-item-title class="export-menu-title">PDF</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleExport('excel'); exportMenu = false">
                  <template #prepend><v-icon color="green" size="18">mdi-file-excel</v-icon></template>
                  <v-list-item-title class="export-menu-title">Excel</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleExport('csv'); exportMenu = false">
                  <template #prepend><v-icon color="blue" size="18">mdi-file-delimited</v-icon></template>
                  <v-list-item-title class="export-menu-title">CSV</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn-group>
        </div>
      </div>
      <v-divider thickness="2" class="mb-6"></v-divider>
    </div>

    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="primary">mdi-domain</v-icon>
            <div class="text-caption text-grey">{{ $t("t-institution") }}</div>
          </div>
          <div class="text-body-1 font-weight-medium">{{ report.contract?.name || "-" }}</div>
          <v-divider class="my-2" />
          <div class="text-caption text-grey">{{ $t("t-coverage-period") }}</div>
          <div class="text-body-2">{{ report.coveragePeriod?.name || "-" }}</div>
          <div class="text-caption text-grey mt-1">{{ periodRange }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="primary">mdi-account-group</v-icon>
            <div class="text-caption text-grey">{{ $t("t-employees") }}</div>
          </div>
          <div class="text-h6 font-weight-bold">{{ numberFormatter.format(totals.employeeCount) }}</div>
          <v-divider class="my-2" />
          <div class="text-caption text-grey">{{ $t("t-eft-average-frequency") }}</div>
          <div class="text-body-1 font-weight-medium">{{ numberFormatter.format(Math.round(totals.averageFrequency)) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="primary">mdi-chart-bar</v-icon>
            <div class="text-caption text-grey">{{ $t("t-eft-top-employee") }}</div>
          </div>
          <div class="text-h6 font-weight-bold text-red-darken-2 text-truncate">{{ totals.topEmployeeName }}</div>
          <v-divider class="my-2" />
          <div class="text-caption text-grey">{{ $t("t-eft-frequency") }}</div>
          <div class="text-body-2 font-weight-medium">{{ numberFormatter.format(totals.topEmployeeFrequency) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="mb-6" elevation="0">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="grey-darken-2">mdi-table</v-icon>
        <span class="text-body-1 font-weight-medium">{{ $t("t-eft-detailed-table") }}</span>
        <v-chip size="small" variant="outlined" class="ml-3">{{ normalizedRows.length }} {{ $t("t-employees") }}</v-chip>
      </v-card-title>
      <v-divider />

      <div class="table-responsive">
        <v-table density="comfortable" hover class="frequency-table">
          <thead>
            <tr class="table-head-row">
              <th class="text-left pa-3 employee-column">{{ $t("t-employee") }}</th>
              <th class="text-left pa-3 employee-number-column">{{ $t("t-employee-number") }}</th>
              <th class="text-left pa-3 trend-column">{{ $t("t-eft-frequency") }}</th>
              <th class="text-right pa-3 frequency-column">{{ $t("t-value") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in paginatedRows" :key="`${row.employeeNumber}-${i}`" class="table-row">
              <td class="pa-3 employee-column">
                <div class="font-weight-medium">{{ row.employeeName }}</div>
              </td>
              <td class="pa-3 employee-number-column">{{ row.employeeNumber }}</td>
              <td class="pa-3 trend-column">
                <div class="usage-track">
                  <div class="usage-bar" :style="{ width: `${usagePercent(row.frequency)}%` }"></div>
                </div>
              </td>
              <td class="text-right pa-3 font-weight-bold frequency-column">{{ numberFormatter.format(row.frequency) }}</td>
            </tr>
            <tr v-if="!normalizedRows.length">
              <td colspan="4" class="text-center pa-6 text-grey">{{ $t("t-no-report-data") }}</td>
            </tr>
          </tbody>
        </v-table>
        <ReportPreviewPagination
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :total-items="normalizedRows.length"
        />
      </div>
    </v-card>
    <ReportPreviewFooter system-footer-key="t-spr-system-footer" :generated-by="userName" />

    <v-card-actions class="d-flex justify-space-between mt-3">
      <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack">
        {{ $t("t-back") }} <i class="ph-arrow-left ms-2" />
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<style scoped>
.header-container { background: linear-gradient(to right, #f8f9fa, #ffffff); padding: 24px; border-radius: 12px; border: 1px solid #e0e0e0; }
.table-responsive { overflow-x: auto; width: 100%; }
.frequency-table { width: 100%; }
.frequency-table :deep(table) { width: 100%; table-layout: fixed; }
.table-head-row :deep(th) { background-color: #dcebff; color: #1f3a93; font-weight: 700 !important; }
.table-row:hover { background-color: #f8f9fa; }
.h-100 { height: 100%; }
.employee-column { width: 42%; }
.employee-number-column { width: 18%; }
.trend-column { min-width: 180px; width: 28%; }
.frequency-column { width: 12%; }
.usage-track { width: 100%; height: 10px; border-radius: 999px; background: #eef2f7; overflow: hidden; }
.usage-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #1f3a93, #3f7ee8); }
.export-menu-list :deep(.v-list-item) { min-height: 34px; padding-inline: 10px; }
.export-menu-title { font-size: 14px; font-weight: 500; line-height: 1.2; font-family: inherit; }

@media (max-width: 960px) {
  .header-row,
  .header-actions,
  .footer-row {
    align-items: flex-start !important;
    flex-direction: column;
    gap: 12px;
  }

  .trend-column {
    min-width: 160px;
  }

  .employee-column {
    min-width: 220px;
  }

  .employee-number-column,
  .frequency-column {
    min-width: 140px;
  }
}
</style>
