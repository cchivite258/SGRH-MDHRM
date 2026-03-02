<script lang="ts" setup>
import { useEmployeeExpenseStatementReportStore } from "@/store/reports/employeeExpenseStatementReportStore";
import ReportPreview from "@/components/ammReports/list/EmployeeExpenseStatementReport/PreviewReport.vue";
import { useRouter } from "vue-router";

const store = useEmployeeExpenseStatementReportStore();
const router = useRouter();

const onBackToReports = () => {
  router.push({ path: "/reports/list" });
};
</script>

<template>
  <div v-if="store.report">
    <ReportPreview :report="store.report" />
  </div>

  <div v-else class="pa-10 text-center">
    <h3>{{ $t("t-noDataForPreview") }}</h3>
    <v-btn color="secondary" variant="outlined" class="mt-4" @click="onBackToReports">
      {{ $t("t-back") }} <i class="ph-arrow-left ms-2" />
    </v-btn>
  </div>
</template>
