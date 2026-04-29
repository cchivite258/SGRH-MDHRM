<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { employeeExpenseStatementReportService } from "@/app/http/httpServiceProvider";
import type { EmployeeExpenseStatementFilterType } from "@/components/ammReports/types";
import { useEmployeeExpenseStatementReportStore } from "@/store/reports/employeeExpenseStatementReportStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import { useEmployeeStore } from "@/store/employee/employeeStore";
import type { CoveragePeriodListingType } from "@/components/institution/types";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();

const reportStore = useEmployeeExpenseStatementReportStore();
const institutionStore = useInstitutionStore();
const coveragePeriodStore = useCoveragePeriodStore();
const employeeStore = useEmployeeStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const contractId = ref("");
const coveragePeriodId = ref("");
const employeeId = ref("");
const localLoading = ref(false);

const institutions = computed(() => {
  return (institutionStore.enabledInstitutions || []).map((item: any) => ({
    value: item.id,
    label: item.name,
  }));
});

const coveragePeriods = computed(() => {
  return (coveragePeriodStore.coverage_periods_for_dropdown || []).map((item: CoveragePeriodListingType) => ({
    value: item.id,
    label: item.name,
  }));
});

const employees = computed(() => {
  const list = employeeStore.enabledEmployees?.length
    ? employeeStore.enabledEmployees
    : employeeStore.employeesForDropdown;

  return (list || []).map((item: any) => ({
    value: item.id,
    label: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.employeeNumber || String(item.id),
  }));
});

const requiredRules = {
  contractId: [(v: string) => !!v || t("t-please-enter-institution")],
  coveragePeriodId: [(v: string) => !!v || t("t-please-enter-coverage-period")],
  employeeId: [(v: string) => !!v || t("t-please-enter-employee")],
};

watch(contractId, async (value) => {
  coveragePeriodId.value = "";
  employeeId.value = "";
  employeeStore.clearEmployeesForDropdown();

  if (!value) return;

  await Promise.all([
    coveragePeriodStore.fetchCoveragePeriodsForDropdown(value, 0, 10000000),
    employeeStore.fetchEmployeesForDropdown(value, 0, 10000000),
  ]);
});

const onSubmit = async () => {
  if (!contractId.value || !coveragePeriodId.value || !employeeId.value) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const payload: EmployeeExpenseStatementFilterType = {
    contractId: contractId.value,
    coveragePeriodId: coveragePeriodId.value,
    employeeId: employeeId.value,
  };

  const response = await employeeExpenseStatementReportService.createReport(payload);
  localLoading.value = false;

  if (response.status === "error") {
    toast.error(response.error?.message || t("t-error-generating-report"));
    return;
  }

  const reportData = response.data;
  if (!reportData) {
    toast.error(t("t-no-report-data"));
    return;
  }

  const selectedCoverage = (coveragePeriodStore.coverage_periods_for_dropdown || []).find(
    (item: any) => String(item.id) === String(coveragePeriodId.value)
  );

  reportStore.setReport({
    ...reportData,
    coveragePeriodId: coveragePeriodId.value,
    coveragePeriodName: selectedCoverage?.name || "",
  });

  emit("update:modelValue", false);
  router.push({ name: "ReportPreview100009" });
};

onMounted(async () => {
  await institutionStore.fetchInstitutionsforListing(0, 10000000);
});
</script>

<template>
  <v-dialog :model-value="props.modelValue" width="500" persistent>
    <v-form @submit.prevent="onSubmit">
      <Card :title="$t('t-filters')" title-class="py-0">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="emit('update:modelValue', false)" />
        </template>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-institution") }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect
                v-model="contractId"
                :items="institutions"
                :rules="requiredRules.contractId"
                :loading="institutionStore.loading"
              />
            </v-col>

            <v-col cols="12" class="mt-n6" v-if="contractId">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-coverage-period") }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect
                v-model="coveragePeriodId"
                :items="coveragePeriods"
                :rules="requiredRules.coveragePeriodId"
                :loading="coveragePeriodStore.loading"
              />
            </v-col>

            <v-col cols="12" class="mt-n6" v-if="contractId">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-employee") }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect
                v-model="employeeId"
                :items="employees"
                :rules="requiredRules.employeeId"
                :loading="employeeStore.loading"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="emit('update:modelValue', false)">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-preparing") : $t("t-preview") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
