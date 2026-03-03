<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { amountFormate } from "@/app/common/amountFormate";
import { formateDate } from "@/app/common/dateFormate";
import { useI18n } from "vue-i18n";
import type {
  CompanyEmployeeLimitEmployeeType,
  CompanyEmployeeLimitsReportType
} from "@/components/ammReports/types";
import { CompanyEmployeeLimitsReportExporter } from "./exportUtils";

const props = defineProps<{
  report: CompanyEmployeeLimitsReportType
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const exporting = ref(false);
const exportMenu = ref(false);

type MonthKey = { year: number; month: number };

const monthRange = computed<MonthKey[]>(() => {
  const start = props.report?.coveragePeriodStartDate ? new Date(props.report.coveragePeriodStartDate) : null;
  const end = props.report?.coveragePeriodEndDate ? new Date(props.report.coveragePeriodEndDate) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const out: MonthKey[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= last) {
    out.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
  }
  return out;
});

const toMonthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`;
const monthLabel = (year: number, month: number) => {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString(locale.value === "en" ? "en-US" : "pt-PT", { month: "short", year: "2-digit" });
};

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const countMonthsInclusive = (start: Date, end: Date): number => {
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  if (endMonth < startMonth) return 0;
  return ((endMonth.getFullYear() - startMonth.getFullYear()) * 12) + (endMonth.getMonth() - startMonth.getMonth()) + 1;
};

const getAnnualSalaryMonthsCount = (employee: CompanyEmployeeLimitEmployeeType): number => {
  const periodStart = parseDate(props.report?.coveragePeriodStartDate);
  const periodEnd = parseDate(props.report?.coveragePeriodEndDate);
  const periodMonthsCount = monthRange.value.length;
  if (!periodStart || !periodEnd) return periodMonthsCount;

  const contractType = String(employee.employeeContractDurationType || "").toUpperCase();
  const hireDate = parseDate(employee.employeeHireDate);
  const terminateDate = parseDate(employee.employeeTerminateDate);

  // Janela do contrato: OPEN_ENDED usa fim do periodo; FIXED_TERM usa data de termino quando existir.
  const contractStart = hireDate || periodStart;
  const contractEnd = contractType === "FIXED_TERM" ? (terminateDate || periodEnd) : periodEnd;

  // Janela elegivel e a intersecao entre periodo do relatorio e periodo do contrato.
  const effectiveStart = contractStart > periodStart ? contractStart : periodStart;
  const effectiveEnd = contractEnd < periodEnd ? contractEnd : periodEnd;
  if (effectiveEnd < effectiveStart) return 0;

  return countMonthsInclusive(effectiveStart, effectiveEnd);
};

const calcLimit = (employee: CompanyEmployeeLimitEmployeeType): number => {
  const limitType = String(employee.healthPlanLimit || "");
  const fixed = Number(employee.fixedAmount || 0);
  const perc = Number(employee.companyContributionPercentage || 0);
  const component = String(employee.salaryComponent || "");
  const base = component === "GROSS_SALARY"
    ? Number(employee.employeeGrossSalary || 0)
    : Number(employee.employeeBaseSalary || 0);

  if (limitType === "FIXED_AMOUNT") return fixed;
  if (limitType === "ANUAL_SALARY" || limitType === "ANNUAL_SALARY") {
    // Limite anual e proporcional aos meses elegiveis do contrato dentro do periodo do relatorio.
    return (base * getAnnualSalaryMonthsCount(employee) * perc) / 100;
  }
  if (limitType === "SALARY_PERCENTAGE") {
    return (base * perc) / 100;
  }
  return fixed;
};

const limitColumnTitle = computed(() => {
  const employee = (props.report?.employees || [])[0];
  if (!employee) return t("t-cel-limit-amount");

  const limitType = String(employee.healthPlanLimit || "");
  const component = String(employee.salaryComponent || "");
  const percentage = Number(employee.companyContributionPercentage || 0);

  if (limitType === "FIXED_AMOUNT") return t("t-cel-limit-fixed-amount");

  if (limitType === "SALARY_PERCENTAGE" || limitType === "ANUAL_SALARY" || limitType === "ANNUAL_SALARY") {
    const formattedPercentage = new Intl.NumberFormat(locale.value === "en" ? "en-US" : "pt-PT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(percentage);
    const componentLabel = component === "GROSS_SALARY"
      ? t("t-cel-gross-salary-lower")
      : t("t-cel-base-salary-lower");
    return `${formattedPercentage}% ${componentLabel}`;
  }

  return t("t-cel-limit-amount");
});

const normalizedRows = computed(() => {
  const rows = (props.report?.employees || []).map((employee) => {
    const employeeName = `${employee.employeeFirstName || ""} ${employee.employeeLastName || ""}`.trim() || "-";
    const contractType = String(employee.employeeContractDurationType || "").toUpperCase();
    const monthValues: Record<string, number> = {};
    (employee.monthlyDetails || []).forEach((m) => {
      monthValues[toMonthKey(Number(m.year || 0), Number(m.month || 0))] = Number(m.totalAmount || 0);
    });
    const limitAmount = calcLimit(employee);
    const totalBilled = Object.values(monthValues).reduce((sum, v) => sum + v, 0);
    const totalAvailable = limitAmount - totalBilled;

    return {
      employeeName,
      department: employee.departmentName || "-",
      position: employee.positionName || "-",
      hireDate: employee.employeeHireDate ? formateDate(employee.employeeHireDate) : "-",
      terminateDate: contractType === "OPEN_ENDED"
        ? "-"
        : (employee.employeeTerminateDate ? formateDate(employee.employeeTerminateDate) : "-"),
      baseSalary: Number(employee.employeeBaseSalary || 0),
      grossSalary: Number(employee.employeeGrossSalary || 0),
      limitAmount,
      monthValues,
      totalBilled,
      totalAvailable
    };
  });

  rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName, locale.value === "en" ? "en-US" : "pt-PT", { sensitivity: "base" }));
  return rows;
});

const totals = computed(() => {
  const rows = normalizedRows.value;
  const monthValues: Record<string, number> = {};
  monthRange.value.forEach((m) => {
    const key = toMonthKey(m.year, m.month);
    monthValues[key] = rows.reduce((sum, row) => sum + (row.monthValues[key] || 0), 0);
  });

  return {
    totalEmployees: rows.length,
    totalBilled: rows.reduce((sum, x) => sum + x.totalBilled, 0),
    totalAvailable: rows.reduce((sum, x) => sum + x.totalAvailable, 0),
    totalLimit: rows.reduce((sum, x) => sum + x.limitAmount, 0),
    totalBaseSalary: rows.reduce((sum, x) => sum + x.baseSalary, 0),
    totalGrossSalary: rows.reduce((sum, x) => sum + x.grossSalary, 0),
    monthValues
  };
});

const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "";
});

const currentDate = computed(() => {
  const uiLocale = locale.value === "en" ? "en-US" : "pt-PT";
  return new Date().toLocaleDateString(uiLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
});

const onBack = () => router.push({ path: "/reports/list" });

const handleExport = async (type: "pdf" | "excel" | "csv") => {
  try {
    exporting.value = true;
    const fileNamePrefix = locale.value === "en" ? "medical-assistance-limits" : "limites-assistencia-medica";
    const fileName = `${fileNamePrefix}-${new Date().toISOString().split("T")[0]}`;

    if (type === "pdf") await CompanyEmployeeLimitsReportExporter.exportToPDF(props.report, userName.value, { fileName });
    if (type === "excel") await CompanyEmployeeLimitsReportExporter.exportToExcel(props.report, userName.value, { fileName });
    if (type === "csv") await CompanyEmployeeLimitsReportExporter.exportToCSV(props.report, userName.value, { fileName });
  } catch (error) {
    console.error(error);
    alert(t("t-error-exporting-report"));
  } finally {
    exporting.value = false;
  }
};
</script>

<template>
  <v-container class="py-8 px-4" max-width="1400px">
    <div class="header-container mb-8">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ $t("t-preview-report") }}</h1>
          <div class="text-caption text-grey mt-1">{{ $t("t-report") }} #100006 - {{ $t("t-report-100006-title") }}</div>
        </div>

        <div class="d-flex align-center">
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
          <div class="text-body-1 font-weight-medium">{{ report.companyName || "-" }}</div>
          <v-divider class="my-2" />
          <div class="text-caption text-grey">{{ $t("t-coverage-period") }}</div>
          <div class="text-body-2">{{ report.coveragePeriodName || "-" }}</div>
          <div class="text-caption text-grey mt-1">
            {{ report.coveragePeriodStartDate ? formateDate(report.coveragePeriodStartDate) : "-" }} -
            {{ report.coveragePeriodEndDate ? formateDate(report.coveragePeriodEndDate) : "-" }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="primary">mdi-account-group</v-icon>
            <div class="text-caption text-grey">{{ $t("t-employees") }}</div>
          </div>
          <div class="text-h6 font-weight-bold">{{ totals.totalEmployees }}</div>
          <v-divider class="my-2" />
          <div class="text-caption text-grey">{{ $t("t-cel-total-limit") }}</div>
          <div class="text-body-1 font-weight-medium">{{ amountFormate(totals.totalLimit) }} MT</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="primary">mdi-cash-multiple</v-icon>
            <div class="text-caption text-grey">{{ $t("t-cel-total-billed") }}</div>
          </div>
          <div class="text-h6 font-weight-bold text-red-darken-2">{{ amountFormate(totals.totalBilled) }} MT</div>
          <v-divider class="my-2" />
          <div class="text-caption text-grey">{{ $t("t-cel-total-available") }}</div>
          <div class="text-body-1 font-weight-medium" :class="totals.totalAvailable < 0 ? 'text-red-darken-2' : ''">
            {{ amountFormate(totals.totalAvailable) }} MT
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="mb-6" elevation="0">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="grey-darken-2">mdi-table</v-icon>
        <span class="text-body-1 font-weight-medium">{{ $t("t-cel-detailed-table") }}</span>
      </v-card-title>
      <v-divider />

      <div class="table-responsive">
        <v-table density="comfortable" hover>
          <thead>
            <tr class="table-head-row">
              <th class="text-left pa-3">{{ $t("t-name") }}</th>
              <th class="text-left pa-3">{{ $t("t-department") }}</th>
              <th class="text-left pa-3">{{ $t("t-position") }}</th>
              <th class="text-left pa-3">{{ $t("t-hire-date") }}</th>
              <th class="text-left pa-3">{{ $t("t-termination-date") }}</th>
              <th class="text-right pa-3">{{ $t("t-base-salary") }}</th>
              <th class="text-right pa-3">{{ $t("t-gross-salary") }}</th>
              <th class="text-right pa-3">{{ limitColumnTitle }}</th>
              <th v-for="m in monthRange" :key="`${m.year}-${m.month}`" class="text-right pa-3">{{ monthLabel(m.year, m.month) }}</th>
              <th class="text-right pa-3">{{ $t("t-cel-total-billed") }}</th>
              <th class="text-right pa-3">{{ $t("t-cel-total-available") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in normalizedRows" :key="i" class="table-row">
              <td class="pa-3">{{ row.employeeName }}</td>
              <td class="pa-3">{{ row.department }}</td>
              <td class="pa-3">{{ row.position }}</td>
              <td class="pa-3">{{ row.hireDate }}</td>
              <td class="pa-3">{{ row.terminateDate }}</td>
              <td class="text-right pa-3">{{ amountFormate(row.baseSalary) }}</td>
              <td class="text-right pa-3">{{ amountFormate(row.grossSalary) }}</td>
              <td class="text-right pa-3 font-weight-medium">{{ amountFormate(row.limitAmount) }}</td>
              <td v-for="m in monthRange" :key="`${m.year}-${m.month}-row-${i}`" class="text-right pa-3">
                {{ amountFormate(row.monthValues[toMonthKey(m.year, m.month)] || 0) }}
              </td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(row.totalBilled) }}</td>
              <td class="text-right pa-3 font-weight-bold" :class="row.totalAvailable < 0 ? 'text-red-darken-2' : ''">{{ amountFormate(row.totalAvailable) }}</td>
            </tr>
            <tr class="totals-row">
              <td class="pa-3 font-weight-bold">{{ $t("t-totals") }}</td>
              <td class="pa-3 font-weight-bold">-</td>
              <td class="pa-3 font-weight-bold">-</td>
              <td class="pa-3 font-weight-bold">-</td>
              <td class="pa-3 font-weight-bold">-</td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(totals.totalBaseSalary) }}</td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(totals.totalGrossSalary) }}</td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(totals.totalLimit) }}</td>
              <td v-for="m in monthRange" :key="`${m.year}-${m.month}-total`" class="text-right pa-3 font-weight-bold">
                {{ amountFormate(totals.monthValues[toMonthKey(m.year, m.month)] || 0) }}
              </td>
              <td class="text-right pa-3 font-weight-bold">{{ amountFormate(totals.totalBilled) }}</td>
              <td class="text-right pa-3 font-weight-bold" :class="totals.totalAvailable < 0 ? 'text-red-darken-2' : ''">{{ amountFormate(totals.totalAvailable) }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>

    <v-card variant="outlined" class="mt-8" elevation="0">
      <v-card-text class="pa-4">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <div class="text-caption text-grey">
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">mdi-information</v-icon>
              {{ $t("t-report-generated-automatically") }}
            </div>
            <div class="mt-1">
              {{ $t("t-spr-system-footer") }} - {{ currentDate }}
            </div>
          </div>

          <div class="text-right">
            <div class="text-caption text-grey">
              {{ $t("t-generated-by") }}: {{ userName || $t("t-spr-system-user") }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

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
.export-menu-list :deep(.v-list-item) { min-height: 34px; padding-inline: 10px; }
.export-menu-title { font-size: 14px; font-weight: 500; line-height: 1.2; font-family: inherit; }
</style>
