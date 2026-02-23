<script lang="ts" setup>
import { useCostPerEmployeeStore } from "@/store/reports/costPerEmployeeStore";
import ReportPreview from "@/components/ammReports/list/CostPerEmployeeReport/PreviewReport.vue";

const store = useCostPerEmployeeStore();
</script>

<template>
  <div v-if="store.report">
    <ReportPreview :report="store.report" />
  </div>

  <div v-else class="pa-10 text-center">
    <h3>{{$t('t-noDataForPreview')}}</h3>
  </div>
</template>
