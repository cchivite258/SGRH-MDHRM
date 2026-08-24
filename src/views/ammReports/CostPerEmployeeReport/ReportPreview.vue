<script lang="ts" setup>
import { useCostPerEmployeeStore } from "@/store/reports/costPerEmployeeStore";
import ReportPreview from "@/components/ammReports/list/CostPerEmployeeReport/PreviewReport.vue";
import ReportPreviewNavigator from "@/components/ammReports/list/ReportPreviewNavigator.vue";
import { useRouter } from "vue-router";

const store = useCostPerEmployeeStore();
const router = useRouter();

const onBackToReports = () => {
  router.push({ path: "/reports/list" });
};
</script>

<template>
  <ReportPreviewNavigator current-report-id="100002" :report="store.report" />

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
