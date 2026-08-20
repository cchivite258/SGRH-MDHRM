<script lang="ts" setup>
import { ref } from "vue";
import PreviewDialog100001 from "@/components/ammReports/list/HospitalProceduresReport/PreviewDialog.vue";
import PreviewDialog100002 from "@/components/ammReports/list/CostPerEmployeeReport/PreviewDialog.vue";
import PreviewDialog100003 from "@/components/ammReports/list/ServiceProviderReport/PreviewDialog.vue";
import PreviewDialog100004 from "@/components/ammReports/list/TopServiceTypesByClinicReport/PreviewDialog.vue";
import PreviewDialog100005 from "@/components/ammReports/list/ServiceProviderComparisonReport/PreviewDialog.vue";
import PreviewDialog100006 from "@/components/ammReports/list/CompanyEmployeeLimitsReport/PreviewDialog.vue";
import PreviewDialog100007 from "@/components/ammReports/list/TotalBilledMedicalAssistanceReport/PreviewDialog.vue";
import PreviewDialog100008 from "@/components/ammReports/list/TotalBilledByProviderReport/PreviewDialog.vue";
import PreviewDialog100009 from "@/components/ammReports/list/EmployeeExpenseStatementReport/PreviewDialog.vue";
import PreviewDialog100010 from "@/components/ammReports/list/InvoiceReferenceReport/PreviewDialog.vue";
import PreviewDialog100011 from "@/components/ammReports/list/HospitalProcedureTrendReport/PreviewDialog.vue";
import PreviewDialog100012 from "@/components/ammReports/list/EmployeeHealthPlanLimitsTrendReport/PreviewDialog.vue";
import PreviewDialog100013 from "@/components/ammReports/list/EmployeeFrequencyTrendReport/PreviewDialog.vue";

const previewDialog100001 = ref(false);
const previewDialog100002 = ref(false);
const previewDialog100003 = ref(false);
const previewDialog100004 = ref(false);
const previewDialog100005 = ref(false);
const previewDialog100006 = ref(false);
const previewDialog100007 = ref(false);
const previewDialog100008 = ref(false);
const previewDialog100009 = ref(false);
const previewDialog100010 = ref(false);
const previewDialog100011 = ref(false);
const previewDialog100012 = ref(false);
const previewDialog100013 = ref(false);

const previewDialogs = {
  "100001": previewDialog100001,
  "100002": previewDialog100002,
  "100003": previewDialog100003,
  "100004": previewDialog100004,
  "100005": previewDialog100005,
  "100006": previewDialog100006,
  "100007": previewDialog100007,
  "100008": previewDialog100008,
  "100009": previewDialog100009,
  "100010": previewDialog100010,
  "100011": previewDialog100011,
  "100012": previewDialog100012,
  "100013": previewDialog100013,
};

type ReportPreviewDialogId = keyof typeof previewDialogs;

// Public API used by the reports list and preview navigator.
// Keeping the modal registry here avoids duplicating 13 refs/imports in every screen.
const openPreviewDialog = (reportId: string) => {
  const dialog = previewDialogs[reportId as ReportPreviewDialogId];
  if (dialog) {
    dialog.value = true;
  }
};

defineExpose({ openPreviewDialog });
</script>

<template>
  <PreviewDialog100001 v-model="previewDialog100001" />
  <PreviewDialog100002 v-model="previewDialog100002" />
  <PreviewDialog100003 v-model="previewDialog100003" />
  <PreviewDialog100004 v-model="previewDialog100004" />
  <PreviewDialog100005 v-model="previewDialog100005" />
  <PreviewDialog100006 v-model="previewDialog100006" />
  <PreviewDialog100007 v-model="previewDialog100007" />
  <PreviewDialog100008 v-model="previewDialog100008" />
  <PreviewDialog100009 v-model="previewDialog100009" />
  <PreviewDialog100010 v-model="previewDialog100010" />
  <PreviewDialog100011 v-model="previewDialog100011" />
  <PreviewDialog100012 v-model="previewDialog100012" />
  <PreviewDialog100013 v-model="previewDialog100013" />
</template>
