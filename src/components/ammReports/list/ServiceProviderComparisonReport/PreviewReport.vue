<script setup lang="ts">
import { computed, ref } from "vue";
import type { ServiceProviderComparisonReportType, ServiceProviderReportType } from "@/components/ammReports/types";
import { formateDate } from "@/app/common/dateFormate";
import { amountFormate } from "@/app/common/amountFormate";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { ServiceProviderComparisonReportExporter } from "./exportUtils";
import { useI18n } from "vue-i18n";

type ComparisonRow = {
  procedureName: string;
  providerAAmount?: number;
  providerBAmount?: number;
};

const props = defineProps<{
  report: ServiceProviderComparisonReportType
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const exporting = ref(false);
const exportType = ref<"pdf" | "excel" | "csv" | null>(null);
const exportMenu = ref(false);

const providerA = computed<ServiceProviderReportType | undefined>(() => props.report?.[0]);
const providerB = computed<ServiceProviderReportType | undefined>(() => props.report?.[1]);

const buildDetailKey = (detail: any): string => {
  if (detail?.hospitalProcedureTypeId !== undefined && detail?.hospitalProcedureTypeId !== null) {
    return `id:${String(detail.hospitalProcedureTypeId)}`;
  }
  return `name:${String(detail?.hospitalProcedureTypeName || "").trim().toLowerCase()}`;
};

const comparisonRows = computed<ComparisonRow[]>(() => {
  const map = new Map<string, ComparisonRow>();

  (providerA.value?.details || []).forEach((detail) => {
    const key = buildDetailKey(detail);
    const existing = map.get(key) || {
      procedureName: detail.hospitalProcedureTypeName || "-",
      providerAAmount: undefined,
      providerBAmount: undefined,
    };

    existing.providerAAmount = detail.totalBilled || 0;
    if (!existing.procedureName || existing.procedureName === "-") {
      existing.procedureName = detail.hospitalProcedureTypeName || "-";
    }

    map.set(key, existing);
  });

  (providerB.value?.details || []).forEach((detail) => {
    const key = buildDetailKey(detail);
    const existing = map.get(key) || {
      procedureName: detail.hospitalProcedureTypeName || "-",
      providerAAmount: undefined,
      providerBAmount: undefined,
    };

    existing.providerBAmount = detail.totalBilled || 0;
    if (!existing.procedureName || existing.procedureName === "-") {
      existing.procedureName = detail.hospitalProcedureTypeName || "-";
    }

    map.set(key, existing);
  });

  return Array.from(map.values()).sort((a, b) => {
    const maxA = Math.max(a.providerAAmount || 0, a.providerBAmount || 0);
    const maxB = Math.max(b.providerAAmount || 0, b.providerBAmount || 0);
    return maxB - maxA;
  });
});

const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "";
  return `${user.firstName} ${user.lastName}`.trim();
});

const startPeriod = computed(() => {
  const date = props.report?.[0]?.startDate;
  return date ? formateDate(date) : "-";
});

const endPeriod = computed(() => {
  const date = props.report?.[0]?.endDate;
  return date ? formateDate(date) : "-";
});

const providerATotal = computed(() => {
  return (providerA.value?.details || []).reduce((sum, item) => sum + (item.totalBilled || 0), 0);
});

const providerBTotal = computed(() => {
  return (providerB.value?.details || []).reduce((sum, item) => sum + (item.totalBilled || 0), 0);
});

const totalAmount = computed(() => providerATotal.value + providerBTotal.value);
const differenceAmount = computed(() => Math.abs(providerATotal.value - providerBTotal.value));

const providerALabel = computed(() => {
  const name = providerA.value?.serviceProviderName || "";
  const type = providerA.value?.serviceProviderTypeName || "";
  return type ? `${name} - ${type}` : name;
});

const providerBLabel = computed(() => {
  const name = providerB.value?.serviceProviderName || "";
  const type = providerB.value?.serviceProviderTypeName || "";
  return type ? `${name} - ${type}` : name;
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

const onBack = () => {
  router.push({ path: "/reports/list" });
};

const handlePrint = async () => {
  await handleExport("pdf");
};

const handleExport = async (type: "pdf" | "excel" | "csv") => {
  try {
    exporting.value = true;
    exportType.value = type;

    const fileNamePrefix = locale.value === "en"
      ? "service-provider-comparison"
      : "comparacao-entre-provedores-de-servico";
    const fileName = `${fileNamePrefix}-${new Date().toISOString().split("T")[0]}`;

    switch (type) {
      case "pdf":
        await ServiceProviderComparisonReportExporter.exportToPDF(props.report, userName.value, { fileName });
        break;
      case "excel":
        await ServiceProviderComparisonReportExporter.exportToExcel(props.report, userName.value, { fileName });
        break;
      case "csv":
        await ServiceProviderComparisonReportExporter.exportToCSV(props.report, userName.value, { fileName });
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

const getComparisonClass = (row: ComparisonRow, provider: "A" | "B") => {
  const a = row.providerAAmount;
  const b = row.providerBAmount;
  const current = provider === "A" ? a : b;
  const other = provider === "A" ? b : a;

  if (current === undefined) return "text-grey";
  if (other === undefined) return "text-red-darken-2";
  if (current > other) return "text-red-darken-2";
  return "text-black";
};

const getTotalComparisonClass = (provider: "A" | "B") => {
  const a = providerATotal.value;
  const b = providerBTotal.value;
  const current = provider === "A" ? a : b;
  const other = provider === "A" ? b : a;
  if (current > other) return "text-red-darken-2";
  return "text-black";
};
</script>

<template>
  <v-container class="py-8 px-4" max-width="1200px">
    <div class="header-container mb-8">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ $t("t-preview-report") }}</h1>
          <div class="text-caption text-grey mt-1">
            {{ $t("t-report") }} #100005 - {{ $t("t-report-100005-title") }}
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
              <template v-slot:activator="{ props }">
                <v-btn
                  color="grey-darken-2"
                  prepend-icon="mdi-download"
                  v-bind="props"
                  :disabled="exporting"
                  :loading="exporting"
                >
                  {{ $t("t-export") }}
                  <v-icon end>mdi-chevron-down</v-icon>
                </v-btn>
              </template>

              <v-list density="compact" class="export-menu-list">
                <v-list-item v-for="(option, index) in exportOptions" :key="index" @click="option.action(); exportMenu = false">
                  <template v-slot:prepend>
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
              <div class="text-caption text-grey">{{ $t("t-spc-provider-1") }}</div>
              <div class="text-body-1 font-weight-medium">{{ providerALabel }}</div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t("t-total-spent") }}:</span>
              <span class="font-weight-medium">{{ amountFormate(providerATotal) }} MT</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-red-lighten-5 mr-3">
              <v-icon color="red-darken-2">mdi-hospital-box</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t("t-spc-provider-2") }}</div>
              <div class="text-body-1 font-weight-medium">{{ providerBLabel }}</div>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="text-caption text-grey">
            <div class="d-flex justify-space-between my-1">
              <span>{{ $t("t-total-spent") }}:</span>
              <span class="font-weight-medium">{{ amountFormate(providerBTotal) }} MT</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined" class="pa-4 h-100 difference-highlight" elevation="0">
          <div class="d-flex align-center mb-3">
            <div class="icon-container bg-green-lighten-5 mr-3">
              <v-icon color="green-darken-2">mdi-scale-balance</v-icon>
            </div>
            <div>
              <div class="text-caption text-grey">{{ $t("t-spc-difference") }}</div>
              <div class="text-h6 font-weight-bold text-green-darken-3">{{ amountFormate(differenceAmount) }} MT</div>
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
    </v-row>

    <v-card variant="outlined" class="mb-6" elevation="0">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="grey-darken-2">mdi-format-list-bulleted</v-icon>
        <span class="text-body-1 font-weight-medium">{{ $t("t-spc-detailed-section") }}</span>
        <v-chip size="small" variant="outlined" class="ml-3">
          {{ comparisonRows.length }} {{ $t("t-procedures") }}
        </v-chip>
      </v-card-title>

      <v-divider></v-divider>

      <div class="table-responsive">
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-left text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">{{ $t("t-procedure") }}</th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">{{ providerALabel }}</th>
              <th class="text-right text-subtitle-2 font-weight-bold text-grey-darken-3 pa-4">{{ providerBLabel }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in comparisonRows" :key="i" class="table-row">
              <td class="pa-4">{{ row.procedureName }}</td>
              <td class="text-right pa-4 font-weight-medium" :class="getComparisonClass(row, 'A')">
                {{ row.providerAAmount !== undefined ? `${amountFormate(row.providerAAmount)} MT` : "-" }}
              </td>
              <td class="text-right pa-4 font-weight-medium" :class="getComparisonClass(row, 'B')">
                {{ row.providerBAmount !== undefined ? `${amountFormate(row.providerBAmount)} MT` : "-" }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="pa-4 font-weight-bold text-grey-darken-3">{{ $t("t-totals") }}</td>
              <td class="text-right pa-4 font-weight-bold" :class="getTotalComparisonClass('A')">{{ amountFormate(providerATotal) }} MT</td>
              <td class="text-right pa-4 font-weight-bold" :class="getTotalComparisonClass('B')">{{ amountFormate(providerBTotal) }} MT</td>
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
.difference-highlight { border: 1px solid #000000; background: linear-gradient(135deg, #f1f8e9, #ffffff); }
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
