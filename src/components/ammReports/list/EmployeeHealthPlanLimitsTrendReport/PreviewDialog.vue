<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { employeeHealthPlanLimitsTrendReportService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { useEmployeeHealthPlanLimitsTrendReportStore } from "@/store/reports/employeeHealthPlanLimitsTrendReportStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import type { CoveragePeriodListingType } from "@/components/institution/types";
import type { EmployeeHealthPlanLimitsTrendFilterType } from "@/components/ammReports/types";
import { useReportPreviewFiltersStore } from "@/store/reports/reportPreviewFiltersStore";
import { buildPreviewParameters, getOptionLabel } from "@/components/ammReports/list/reportPreviewFilterUtils";
import ReportFilterCard from "@/components/ammReports/list/ReportFilterCard.vue";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const reportStore = useEmployeeHealthPlanLimitsTrendReportStore();
const institutionStore = useInstitutionStore();
const coveragePeriodStore = useCoveragePeriodStore();
const previewFiltersStore = useReportPreviewFiltersStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
const contractId = ref("");
const coveragePeriodId = ref("");
const usagePercentageAbove = ref<number | string>(0);
const localLoading = ref(false);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

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

const requiredRules = {
  contractId: [(v: string) => !!v || t("t-please-enter-institution")],
  coveragePeriodId: [(v: string) => !!v || t("t-please-enter-coverage-period")],
  usagePercentageAbove: [
    (v: string | number) => String(v ?? "").trim().length > 0 || t("t-ehplt-please-enter-usage-percentage"),
    (v: string | number) => !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100 || t("t-ehplt-usage-percentage-range")
  ],
};

watch(contractId, async (value) => {
  coveragePeriodId.value = "";
  if (!value) return;
  await coveragePeriodStore.fetchCoveragePeriodsForDropdown(value, 0, 10000000);
});

const onSubmit = async () => {
  if (!form.value) return;
  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  try {
    const payload: EmployeeHealthPlanLimitsTrendFilterType = {
      contractId: contractId.value,
      coveragePeriodId: coveragePeriodId.value,
      usagePercentageAbove: Number(usagePercentageAbove.value),
    };

    console.log("[EmployeeHealthPlanLimitsTrendReport] payload sent to API:", payload);

    const response = await employeeHealthPlanLimitsTrendReportService.createReport(payload);
    console.log("[EmployeeHealthPlanLimitsTrendReport] API response:", response);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-error-generating-report")).forEach((message) => toast.error(message));
      return;
    }

    if (!response.data) {
      toast.error(t("t-no-report-data"));
      return;
    }

    reportStore.setReport(response.data);
    previewFiltersStore.setParameters("100012", buildPreviewParameters([
      { label: t("t-institution"), value: getOptionLabel(institutions.value, contractId.value) },
      { label: t("t-coverage-period"), value: getOptionLabel(coveragePeriods.value, coveragePeriodId.value) },
      { label: t("t-ehplt-usage-percentage-above"), value: `${usagePercentageAbove.value}%` },
    ]));
    emit("update:modelValue", false);
    router.push({ name: "ReportPreview100012" });
  } catch (error: any) {
    getApiErrorMessages(error, t("t-error-generating-report")).forEach((message) => toast.error(message));
  } finally {
    localLoading.value = false;
  }
};

onMounted(async () => {
  await institutionStore.fetchInstitutionsforListing(0, 10000000);
});
</script>

<template>
  <v-dialog :model-value="props.modelValue" width="520" persistent>
    <v-form ref="form" @submit.prevent="onSubmit">
      <ReportFilterCard report-id="100012">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="emit('update:modelValue', false)" />
        </template>

        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12" class="mt-1">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-institution") }} <i class="ph-asterisk text-danger" /></div>
              <MenuSelect v-model="contractId" :items="institutions" :rules="requiredRules.contractId" :loading="institutionStore.loading" />
            </v-col>

            <v-col cols="12" class="mt-n6" v-if="contractId">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-coverage-period") }} <i class="ph-asterisk text-danger" /></div>
              <MenuSelect v-model="coveragePeriodId" :items="coveragePeriods" :rules="requiredRules.coveragePeriodId" :loading="coveragePeriodStore.loading" />
            </v-col>

            <v-col cols="12" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-ehplt-usage-percentage-above") }} <i class="ph-asterisk text-danger" /></div>
              <v-text-field
                v-model="usagePercentageAbove"
                class="text-field-component percentage-field"
                type="number"
                min="0"
                max="100"
                variant="solo"
                density="compact"
                :rules="requiredRules.usagePercentageAbove"
                hide-spin-buttons
              >
                <template #append-inner>
                  <span class="percentage-field__suffix">%</span>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="emit('update:modelValue', false)" :disabled="localLoading">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-preparing") : $t("t-preview") }}
          </v-btn>
        </v-card-actions>
      </ReportFilterCard>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.percentage-field__suffix {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 13px;
  line-height: 1;
}
</style>
