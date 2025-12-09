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
    <h3>{{$t('t-noDataForPreview')}}</h3>
  </div>
</template>
