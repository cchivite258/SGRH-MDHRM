<script setup lang="ts">
import { computed, ref } from "vue";
import type { TotalBilledByProviderReportType } from "@/components/ammReports/types";
import { formateDate } from "@/app/common/dateFormate";
import { amountFormate } from "@/app/common/amountFormate";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { TotalBilledByProviderReportExporter } from "./exportUtils";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  report: TotalBilledByProviderReportType
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const exporting = ref(false);
const exportType = ref<"pdf" | "excel" | "csv" | null>(null);
const exportMenu = ref(false);

const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "";
});

const startPeriod = computed(() => props.report?.startDate ? formateDate(props.report.startDate) : "-");
const endPeriod = computed(() => props.report?.endDate ? formateDate(props.report.endDate) : "-");
const totalAmount = computed(() => Number(props.report?.totalBilled || 0));
const totalEmployees = computed(() => Number(props.report?.totalEmployees || 0));

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
const handlePrint = async () => handleExport("pdf");

const handleExport = async (type: "pdf" | "excel" | "csv") => {
  try {
    exporting.value = true;
    exportType.value = type;

    const fileNamePrefix = locale.value === "en" ? "total-billed-by-provider" : "total-facturado-por-provedor";
    const fileName = `${fileNamePrefix}-${new Date().toISOString().split("T")[0]}`;

    switch (type) {
      case "pdf":
        await TotalBilledByProviderReportExporter.exportToPDF(props.report, userName.value, { fileName });
        break;
      case "excel":
        await TotalBilledByProviderReportExporter.exportToExcel(props.report, userName.value, { fileName });
        break;
      case "csv":
        await TotalBilledByProviderReportExporter.exportToCSV(props.report, userName.value, { fileName });
        break;
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    alert(t("t-error-exporting-report"));
  } finally {
    exporting.value = false;
    exportType.value = null;
  }
};

const exportOptions = [
  { title: "PDF", icon: "mdi-file-pdf-box", color: "red", action: () => handleExport("pdf") },
  { title: "Excel", icon: "mdi-file-excel", color: "green", action: () => handleExport("excel") },
  { title: "CSV", icon: "mdi-file-delimited", color: "blue", action: () => handleExport("csv") },
];
</script>

<template>
  <v-container class="py-8 px-4" max-width="1200px">
    <div class="header-container mb-8">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ $t("t-preview-report") }}</h1>
          <div class="text-caption text-grey mt-1">
            {{ $t("t-report") }} #100008 - {{ $t("t-report-100008-title") }}
          </div>
        </div>

        <div class="d-flex align-center">
          <v-chip variant="outlined" size="small" class="mr-3">
            <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
            {{ currentDate }}
          </v-chip>

          <v-btn-group variant="outlined" density="comfortable">
            <v-btn color="primary" prepend-icon="mdi-printer" @click="handlePrint" :disabled="exporting">
              {{ $t("t-print") }}
            </v-btn>

            <v-menu v-model="exportMenu" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn color="grey-darken-2" prepend-icon="mdi-download" v-bind="props" :disabled="exporting" :loading="exporting">
                  {{ $t("t-export") }}
                  <v-icon end>mdi-chevron-down</v-icon>
                </v-btn>
              </template>

              <v-list density="compact" class="export-menu-list">
                <v-list-item v-for="(option, index) in exportOptions" :key="index" @click="option.action(); exportMenu = false">
                  <template #prepend>
                    <v-icon :color="option.color" size="18">{{ option.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="export-menu-title">{{ option.title }}</v-list-item-title>
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
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-blue-lighten-5 mr-3">
              <v-icon color="blue-darken-2">mdi-hospital-box</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t("t-service-provider") }}</div>
              <div class="text-h6 font-weight-bold">{{ report.serviceProviderName || "-" }}</div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t("t-provider-type") }}:</span>
              <span class="font-weight-medium">{{ report.serviceProviderTypeName || "-" }}</span>
            </div>
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t("t-institution") }}:</span>
              <span class="font-weight-medium">{{ report.contractName || "-" }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-green-lighten-5 mr-3">
              <v-icon color="green-darken-2">mdi-calendar-range</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t("t-period") }}</div>
              <div class="text-body-1 font-weight-medium">{{ $t("t-custom-period") }}</div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t("t-start-period") }}:</span>
              <span class="font-weight-medium">{{ startPeriod }}</span>
            </div>
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t("t-end-period") }}:</span>
              <span class="font-weight-medium">{{ endPeriod }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-red-lighten-5 mr-3">
              <v-icon color="red-darken-2">mdi-cash-multiple</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t("t-total-billed") }}</div>
              <div class="text-h6 font-weight-bold text-red-darken-2">{{ amountFormate(totalAmount) }} MT</div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t("t-total-employees") }}:</span>
              <span class="font-weight-medium">{{ totalEmployees }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined" class="mb-6" elevation="0">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="grey-darken-2">mdi-table</v-icon>
        <span class="text-body-1 font-weight-medium">{{ $t("t-report-details") }}</span>
      </v-card-title>

      <v-divider></v-divider>

      <div class="table-responsive">
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-left text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">{{ $t("t-service-provider") }}</th>
              <th class="text-left text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">{{ $t("t-provider-type") }}</th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">{{ $t("t-total-employees") }}</th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">{{ $t("t-total-billed") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="table-row">
              <td class="pa-4">{{ report.serviceProviderName || "-" }}</td>
              <td class="pa-4">{{ report.serviceProviderTypeName || "-" }}</td>
              <td class="text-right pa-4">{{ totalEmployees }}</td>
              <td class="text-right pa-4 font-weight-medium">{{ amountFormate(totalAmount) }} MT</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="pa-4 font-weight-bold text-grey-darken-3">{{ $t("t-totals") }}</td>
              <td class="pa-4 text-grey">-</td>
              <td class="text-right pa-4 font-weight-bold">{{ totalEmployees }}</td>
              <td class="text-right pa-4"><div class="text-body-1 font-weight-bold text-red-darken-2">{{ amountFormate(totalAmount) }} MT</div></td>
            </tr>
          </tfoot>
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
              {{ $t("t-generated-by") }}: {{ userName }}
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
.icon-container { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.table-responsive { overflow-x: auto; }
.table-row { transition: background-color 0.2s ease; border-bottom: 1px solid #f0f0f0; }
.table-row:hover { background-color: #f8f9fa; }
.total-row { background-color: #f8f9fa; border-top: 2px solid #e0e0e0; }
@media print {
  .header-container { border: none; background: none; padding: 0; }
  .v-btn { display: none !important; }
  .table-row:hover { background-color: transparent; }
}
@media (max-width: 960px) {
  .header-container { padding: 16px; }
  .d-flex.justify-space-between { flex-direction: column; align-items: flex-start; gap: 16px; }
  .d-flex.align-center:last-child { align-self: flex-end; }
}
.h-100 { height: 100%; }
.bg-blue-lighten-5 { background-color: #e3f2fd; }
.bg-green-lighten-5 { background-color: #e8f5e9; }
.bg-red-lighten-5 { background-color: #ffebee; }
.export-menu-list :deep(.v-list-item) { min-height: 34px; padding-inline: 10px; }
.export-menu-title { font-size: 14px; font-weight: 500; line-height: 1.2; font-family: inherit; }
</style>

