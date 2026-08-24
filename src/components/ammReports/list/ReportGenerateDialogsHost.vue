<script lang="ts" setup>
import { ref } from "vue";
import GenerateDialog100001 from "@/components/ammReports/list/HospitalProceduresReport/GenerateDialog.vue";
import GenerateDialog100002 from "@/components/ammReports/list/CostPerEmployeeReport/GenerateDialog.vue";
import GenerateDialog100003 from "@/components/ammReports/list/ServiceProviderReport/GenerateDialog.vue";
import GenerateDialog100004 from "@/components/ammReports/list/TopServiceTypesByClinicReport/GenerateDialog.vue";
import GenerateDialog100005 from "@/components/ammReports/list/ServiceProviderComparisonReport/GenerateDialog.vue";
import GenerateDialog100006 from "@/components/ammReports/list/CompanyEmployeeLimitsReport/GenerateDialog.vue";
import GenerateDialog100007 from "@/components/ammReports/list/TotalBilledMedicalAssistanceReport/GenerateDialog.vue";
import GenerateDialog100008 from "@/components/ammReports/list/TotalBilledByProviderReport/GenerateDialog.vue";
import GenerateDialog100009 from "@/components/ammReports/list/EmployeeExpenseStatementReport/GenerateDialog.vue";
import GenerateDialog100010 from "@/components/ammReports/list/InvoiceReferenceReport/GenerateDialog.vue";
import GenerateDialog100011 from "@/components/ammReports/list/HospitalProcedureTrendReport/GenerateDialog.vue";
import GenerateDialog100012 from "@/components/ammReports/list/EmployeeHealthPlanLimitsTrendReport/GenerateDialog.vue";
import GenerateDialog100013 from "@/components/ammReports/list/EmployeeFrequencyTrendReport/GenerateDialog.vue";

const generateDialog100001 = ref(false);
const generateDialog100002 = ref(false);
const generateDialog100003 = ref(false);
const generateDialog100004 = ref(false);
const generateDialog100005 = ref(false);
const generateDialog100006 = ref(false);
const generateDialog100007 = ref(false);
const generateDialog100008 = ref(false);
const generateDialog100009 = ref(false);
const generateDialog100010 = ref(false);
const generateDialog100011 = ref(false);
const generateDialog100012 = ref(false);
const generateDialog100013 = ref(false);

const generateDialogs = {
  "100001": generateDialog100001,
  "100002": generateDialog100002,
  "100003": generateDialog100003,
  "100004": generateDialog100004,
  "100005": generateDialog100005,
  "100006": generateDialog100006,
  "100007": generateDialog100007,
  "100008": generateDialog100008,
  "100009": generateDialog100009,
  "100010": generateDialog100010,
  "100011": generateDialog100011,
  "100012": generateDialog100012,
  "100013": generateDialog100013,
};

type ReportGenerateDialogId = keyof typeof generateDialogs;

// Public API used by the reports list. New generated reports only need a new entry here.
const openGenerateDialog = (reportId: string) => {
  const dialog = generateDialogs[reportId as ReportGenerateDialogId];
  if (dialog) {
    dialog.value = true;
  }
};

defineExpose({ openGenerateDialog });
</script>

<template>
  <GenerateDialog100001 v-model="generateDialog100001" />
  <GenerateDialog100002 v-model="generateDialog100002" />
  <GenerateDialog100003 v-model="generateDialog100003" />
  <GenerateDialog100004 v-model="generateDialog100004" />
  <GenerateDialog100005 v-model="generateDialog100005" />
  <GenerateDialog100006 v-model="generateDialog100006" />
  <GenerateDialog100007 v-model="generateDialog100007" />
  <GenerateDialog100008 v-model="generateDialog100008" />
  <GenerateDialog100009 v-model="generateDialog100009" />
  <GenerateDialog100010 v-model="generateDialog100010" />
  <GenerateDialog100011 v-model="generateDialog100011" />
  <GenerateDialog100012 v-model="generateDialog100012" />
  <GenerateDialog100013 v-model="generateDialog100013" />
</template>
