<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import { useI18n } from "vue-i18n";
import type { EmployeeHealthPlanLimitsTrendReportType } from "@/components/ammReports/types";
import { EmployeeHealthPlanLimitsTrendReportExporter } from "./exportUtils";
import ReportPreviewFooter from "@/components/ammReports/list/ReportPreviewFooter.vue";
import ReportPreviewPagination from "@/components/ammReports/list/ReportPreviewPagination.vue";
import { useReportPreviewPagination } from "@/components/ammReports/list/reportPreviewPagination";

const props = defineProps<{
  report: EmployeeHealthPlanLimitsTrendReportType
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const exporting = ref(false);
const exportMenu = ref(false);

const numberFormatter = computed(() => new Intl.NumberFormat(locale.value === "en" ? "en-US" : "pt-PT"));
const percentFormatter = computed(() => new Intl.NumberFormat(locale.value === "en" ? "en-US" : "pt-PT", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
}));

const formatPercent = (value?: number) => `${percentFormatter.value.format(Number(value || 0))}%`;

const employeeName = (item: any) => {
  const employee = item.employee || {};
  return `${employee.firstName || ""} ${employee.middleName || ""} ${employee.lastName || ""}`.replace(/\s+/g, " ").trim() || "-";
};

const normalizedRows = computed(() => {
  return (props.report?.details || []).map((item) => ({
    employeeName: employeeName(item),
    employeeNumber: item.employee?.employeeNumber || "-",
    allocatedBalance: Number(item.allocatedBalance || 0),
    usedBalance: Number(item.usedBalance || 0),
    remainingBalance: Number(item.remainingBalance || 0),
    percentSpended: Number(item.percentSpended || 0),
    percentRemaining: Number(item.percentRemaining || 0)
  }));
});

const totals = computed(() => {
  const rows = normalizedRows.value;
  return {
    employeeCount: Number(props.report?.numberOfEmployees ?? rows.length),
    allocatedBalance: rows.reduce((sum, row) => sum + row.allocatedBalance, 0),
    usedBalance: rows.reduce((sum, row) => sum + row.usedBalance, 0),
    remainingBalance: rows.reduce((sum, row) => sum + row.remainingBalance, 0),
    maxPercentSpended: rows.reduce((max, row) => Math.max(max, row.percentSpended), 0)
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

const usagePercent = (value: number) => Math.max(4, Math.min(100, Math.round(Number(value || 0))));

const onBack = () => router.push({ path: "/reports/list" });

const handleExport = async (type: "pdf" | "excel" | "csv") => {
  try {
    exporting.value = true;
    const prefix = locale.value === "en" ? "employee-health-plan-limits-trend" : "tendencia-limites-plano-saude-colaboradores";
    const fileName = `${prefix}-${new Date().toISOString().split("T")[0]}`;

    if (type === "pdf") await EmployeeHealthPlanLimitsTrendReportExporter.exportToPDF(props.report, userName.value, { fileName });
    if (type === "excel") await EmployeeHealthPlanLimitsTrendReportExporter.exportToExcel(props.report, userName.value, { fileName });
    if (type === "csv") await EmployeeHealthPlanLimitsTrendReportExporter.exportToCSV(props.report, userName.value, { fileName });
  } catch (error) {
    console.error(error);
    alert(t("t-error-exporting-report"));
  } finally {
    exporting.value = false;
  }
};
</script>

<template>
  <v-container class="py-8 px-4" max-width="1200px">
    <div class="header-container mb-8">
      <div class="d-flex justify-space-between align-center mb-4 header-row">
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ $t("t-preview-report") }}</h1>
          <div class="text-caption text-grey mt-1">{{ $t("t-report") }} #100012 - {{ $t("t-report-100012-title") }}</div>
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
          <div class="text-caption text-grey">{{ $t("t-ehplt-percent-spent") }}</div>
          <div class="text-body-1 font-weight-medium">{{ formatPercent(report.percentSpended) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="primary">mdi-cash-multiple</v-icon>
            <div class="text-caption text-grey">{{ $t("t-ehplt-used-balance") }}</div>
          </div>
          <div class="text-h6 font-weight-bold text-red-darken-2">{{ amountFormate(totals.usedBalance) }} MT</div>
          <v-divider class="my-2" />
          <div class="text-caption text-grey">{{ $t("t-ehplt-remaining-balance") }}</div>
          <div class="text-body-1 font-weight-medium">{{ amountFormate(totals.remainingBalance) }} MT</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="mb-6" elevation="0">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="grey-darken-2">mdi-table</v-icon>
        <span class="text-body-1 font-weight-medium">{{ $t("t-ehplt-detailed-table") }}</span>
        <v-chip size="small" variant="outlined" class="ml-3">{{ normalizedRows.length }} {{ $t("t-employees") }}</v-chip>
      </v-card-title>
      <v-divider />

      <div class="table-responsive">
        <v-table density="comfortable" hover>
          <thead>
            <tr class="table-head-row">
              <th class="text-left pa-3">{{ $t("t-employee") }}</th>
              <th class="text-left pa-3">{{ $t("t-employee-number") }}</th>
              <th class="text-left pa-3 usage-column">{{ $t("t-ehplt-usage") }}</th>
              <th class="text-right pa-3">{{ $t("t-ehplt-allocated-balance") }}</th>
              <th class="text-right pa-3">{{ $t("t-ehplt-used-balance") }}</th>
              <th class="text-right pa-3">{{ $t("t-ehplt-remaining-balance") }}</th>
              <th class="text-right pa-3">{{ $t("t-ehplt-percent-spent") }}</th>
              <th class="text-right pa-3">{{ $t("t-ehplt-percent-remaining") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in paginatedRows" :key="`${row.employeeNumber}-${i}`" class="table-row">
              <td class="pa-3 font-weight-medium">{{ row.employeeName }}</td>
              <td class="pa-3">{{ row.employeeNumber }}</td>
              <td class="pa-3 usage-column">
                <div class="usage-track">
                  <div class="usage-bar" :style="{ width: `${usagePercent(row.percentSpended)}%` }"></div>
                </div>
              </td>
              <td class="text-right pa-3">{{ amountFormate(row.allocatedBalance) }}</td>
              <td class="text-right pa-3 font-weight-bold text-red-darken-2">{{ amountFormate(row.usedBalance) }}</td>
              <td class="text-right pa-3">{{ amountFormate(row.remainingBalance) }}</td>
              <td class="text-right pa-3 font-weight-bold">{{ formatPercent(row.percentSpended) }}</td>
              <td class="text-right pa-3">{{ formatPercent(row.percentRemaining) }}</td>
            </tr>
            <tr v-if="!normalizedRows.length">
              <td colspan="8" class="text-center pa-6 text-grey">{{ $t("t-no-report-data") }}</td>
            </tr>
            <tr class="totals-row">
              <td class="pa-3 font-weight-bold">{{ $t("t-totals") }}</td>
              <td class="pa-3 font-weight-bold">-</td>
              <td class="pa-3"></td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(totals.allocatedBalance) }}</td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(totals.usedBalance) }}</td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(totals.remainingBalance) }}</td>
              <td class="text-right pa-3 font-weight-bold">{{ formatPercent(report.percentSpended) }}</td>
              <td class="text-right pa-3 font-weight-bold">{{ formatPercent(report.percentRemaining) }}</td>
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
.table-responsive { overflow-x: auto; }
.table-head-row :deep(th) { background-color: #dcebff; color: #1f3a93; font-weight: 700 !important; }
.table-row:hover { background-color: #f8f9fa; }
.totals-row { background-color: #eef4ff; }
.h-100 { height: 100%; }
.usage-column { min-width: 160px; width: 20%; }
.usage-track { width: 100%; height: 10px; border-radius: 999px; background: #eef2f7; overflow: hidden; }
.usage-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #1f3a93, #e53935); }
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

  .usage-column {
    min-width: 140px;
  }
}
</style>
