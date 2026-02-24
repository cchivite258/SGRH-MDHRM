<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useServiceProviderComparisonReportStore } from "@/store/reports/serviceProviderComparisonReportStore";
import ReportPreview from "@/components/ammReports/list/ServiceProviderComparisonReport/PreviewReport.vue";
import type { ServiceProviderComparisonReportType } from "@/components/ammReports/types";

const store = useServiceProviderComparisonReportStore();
const router = useRouter();
const route = useRoute();
const reportData = ref<ServiceProviderComparisonReportType>([]);

onMounted(() => {
  const key = String(route.query.rk || "");
  if (key) {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ServiceProviderComparisonReportType;
        if (Array.isArray(parsed)) {
          reportData.value = parsed;
        }
      } catch (error) {
        console.warn("Invalid report snapshot for key:", key, error);
      }
    }
  }

  if (!reportData.value.length && store.report?.length) {
    reportData.value = store.report;
  }

  if (!reportData.value.length) {
    const sp1 = String(route.query.sp1 || "").trim();
    const sp2 = String(route.query.sp2 || "").trim();

    if (sp1 || sp2) {
      reportData.value = [
        {
          serviceProviderName: sp1 || "",
          serviceProviderTypeName: "",
          totalAmount: 0,
          details: []
        },
        {
          serviceProviderName: sp2 || "",
          serviceProviderTypeName: "",
          totalAmount: 0,
          details: []
        }
      ];
    }
  }
});

const onBackToReports = () => {
  router.push({ path: "/reports/list" });
};
</script>

<template>
  <div v-if="reportData && reportData.length">
    <ReportPreview :report="reportData" />
  </div>

  <div v-else class="pa-10 text-center">
    <h3>{{ $t("t-noDataForPreview") }}</h3>
    <v-btn color="secondary" variant="outlined" class="mt-4" @click="onBackToReports">
      {{ $t("t-back") }} <i class="ph-arrow-left ms-2" />
    </v-btn>
  </div>
</template>
