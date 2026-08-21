<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useEmployeeHealthPlanLimitsTrendReportStore } from "@/store/reports/employeeHealthPlanLimitsTrendReportStore";
import ReportPreview from "@/components/ammReports/list/EmployeeHealthPlanLimitsTrendReport/PreviewReport.vue";
import ReportPreviewShell from "@/components/ammReports/list/ReportPreviewShell.vue";

const store = useEmployeeHealthPlanLimitsTrendReportStore();
const router = useRouter();

const onBackToReports = () => {
  router.push({ path: "/reports/list" });
};
</script>

<template>
  <ReportPreviewShell current-report-id="100012" :report="store.report">

    <div v-if="store.report">
      <ReportPreview :report="store.report" />
    </div>

    <div v-else class="pa-10 text-center">
      <h3>{{ $t("t-noDataForPreview") }}</h3>
      <v-btn color="secondary" variant="outlined" class="mt-4" @click="onBackToReports">
        {{ $t("t-back") }} <i class="ph-arrow-left ms-2" />
      </v-btn>
    </div>
  </ReportPreviewShell>
</template>
