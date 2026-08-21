<script lang="ts" setup>
import { useInvoiceReferenceReportStore } from "@/store/reports/invoiceReferenceReportStore";
import ReportPreview from "@/components/ammReports/list/InvoiceReferenceReport/PreviewReport.vue";
import ReportPreviewShell from "@/components/ammReports/list/ReportPreviewShell.vue";
import { useRouter } from "vue-router";

const store = useInvoiceReferenceReportStore();
const router = useRouter();

const onBackToReports = () => {
  router.push({ path: "/reports/list" });
};
</script>

<template>
  <ReportPreviewShell current-report-id="100010" :report="store.report">

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
