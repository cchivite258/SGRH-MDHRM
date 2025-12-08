<script lang="ts" setup>
import { useHospitalProceduresReportStore } from "@/store/reports/companyHospitalProceduresBalancesStore";
import ReportPreview from "@/components/ammReports/list/HospitalProceduresReport/PreviewReport.vue";

const store = useHospitalProceduresReportStore();
</script>

<template>
  <div v-if="store.report">
    <ReportPreview :report="store.report" />
  </div>

  <div v-else class="pa-10 text-center">
    <h3>Sem dados para pré-visualização</h3>
  </div>
</template>
