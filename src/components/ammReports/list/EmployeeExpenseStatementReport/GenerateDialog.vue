<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { employeeExpenseStatementReportService } from "@/app/http/httpServiceProvider";
import type { EmployeeExpenseStatementFilterType } from "@/components/ammReports/types";
import { EmployeeExpenseStatementReportExporter } from "./exportUtils";
import { useAuthStore } from "@/store/authStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import { useEmployeeStore } from "@/store/employee/employeeStore";
import type { CoveragePeriodListingType } from "@/components/institution/types";

const { t, locale } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
const institutionStore = useInstitutionStore();
const coveragePeriodStore = useCoveragePeriodStore();
const employeeStore = useEmployeeStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const companyId = ref("");
const coveragePeriodId = ref("");
const employeeId = ref("");
const localLoading = ref(false);
const errorMsg = ref("");
const exportMenu = ref(false);
type ExportType = "pdf" | "excel" | "csv";

const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "Sistema";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Sistema";
});

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
  companyId: [(v: string) => !!v || t("t-please-enter-institution")],
  coveragePeriodId: [(v: string) => !!v || t("t-please-enter-coverage-period")],
  employeeId: [(v: string) => !!v || t("t-please-enter-employee")],
};

watch(companyId, async (value) => {
  coveragePeriodId.value = "";
  employeeId.value = "";
  employeeStore.clearEmployeesForDropdown();

  if (!value) return;

  await Promise.all([
    coveragePeriodStore.fetchCoveragePeriodsForDropdown(value, 0, 10000000),
    employeeStore.fetchEmployeesForDropdown(value, 0, 10000000),
  ]);
});

const onSubmit = async (exportType: ExportType = "pdf") => {
  if (!companyId.value || !coveragePeriodId.value || !employeeId.value) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;
  errorMsg.value = "";

  try {
    const payload: EmployeeExpenseStatementFilterType = {
      companyId: companyId.value,
      coveragePeriodId: coveragePeriodId.value,
      employeeId: employeeId.value,
    };

    const response = await employeeExpenseStatementReportService.createReport(payload);
    if (response.status === "error") {
      toast.error(response.error?.message || t("t-error-generating-report"));
      return;
    }

    const data = response.data;
    if (!data) {
      toast.error(t("t-no-report-data"));
      return;
    }

    const selectedCoverage = (coveragePeriodStore.coverage_periods_for_dropdown || []).find(
      (item: any) => String(item.id) === String(coveragePeriodId.value)
    );

    const report = {
      ...data,
      coveragePeriodId: coveragePeriodId.value,
      coveragePeriodName: selectedCoverage?.name || "",
    };

    const prefix = locale.value === "en" ? "employee-expense-statement" : "extrato-por-colaborador";
    const fileName = `${prefix}-${new Date().toISOString().split("T")[0]}`;

    if (exportType === "pdf") {
      await EmployeeExpenseStatementReportExporter.exportToPDF(report, userName.value, { fileName });
    } else if (exportType === "excel") {
      await EmployeeExpenseStatementReportExporter.exportToExcel(report, userName.value, { fileName });
    } else {
      await EmployeeExpenseStatementReportExporter.exportToCSV(report, userName.value, { fileName });
    }

    emit("update:modelValue", false);
    toast.success(t("t-file-generated-successfully", { format: exportType.toUpperCase() }));
  } catch {
    errorMsg.value = t("t-error-generating-pdf");
    toast.error(errorMsg.value);
  } finally {
    localLoading.value = false;
  }
};

const exportOptions = [
  { title: "PDF", icon: "mdi-file-pdf-box", color: "red", value: "pdf" as ExportType },
  { title: "Excel", icon: "mdi-file-excel", color: "green", value: "excel" as ExportType },
  { title: "CSV", icon: "mdi-file-delimited", color: "blue", value: "csv" as ExportType },
];

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
          <v-alert
            v-if="errorMsg"
            :text="errorMsg"
            type="error"
            class="mb-4"
            variant="tonal"
            density="compact"
            closable
            @click:close="errorMsg = ''"
          />

          <v-row>
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-institution") }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect
                v-model="companyId"
                :items="institutions"
                :rules="requiredRules.companyId"
                :loading="institutionStore.loading"
              />
            </v-col>

            <v-col cols="12" class="mt-n6" v-if="companyId">
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

            <v-col cols="12" class="mt-n6" v-if="companyId">
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
          <v-btn color="danger" class="me-2" @click="emit('update:modelValue', false)" :disabled="localLoading">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>

          <v-menu v-model="exportMenu">
            <template #activator="{ props }">
              <v-btn color="primary" variant="elevated" v-bind="props" :loading="localLoading" :disabled="localLoading">
                <template v-if="localLoading">
                  <v-progress-circular indeterminate size="20" width="2" class="mr-2" />
                  {{ $t("t-preparing") }}
                </template>
                <template v-else>
                  <i class="ph-download-simple me-1" /> {{ $t("t-generate") }}
                </template>
              </v-btn>
            </template>
            <v-list density="compact" class="export-menu-list">
              <v-list-item
                v-for="option in exportOptions"
                :key="option.value"
                @click="onSubmit(option.value); exportMenu = false"
              >
                <template #prepend>
                  <v-icon :color="option.color" size="18">{{ option.icon }}</v-icon>
                </template>
                <v-list-item-title class="export-menu-title">{{ option.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.export-menu-list :deep(.v-list-item) {
  min-height: 34px;
  padding-inline: 10px;
}

.export-menu-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  font-family: inherit;
}
</style>
