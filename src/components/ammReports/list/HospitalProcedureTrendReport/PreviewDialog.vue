<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { hospitalProcedureTrendReportService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { useHospitalProcedureTrendReportStore } from "@/store/reports/hospitalProcedureTrendReportStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import type { CoveragePeriodListingType } from "@/components/institution/types";
import type { HospitalProcedureTrendFilterType } from "@/components/ammReports/types";
import { useReportPreviewFiltersStore } from "@/store/reports/reportPreviewFiltersStore";
import { buildPreviewParameters, getOptionLabel } from "@/components/ammReports/list/reportPreviewFilterUtils";
import ReportFilterCard from "@/components/ammReports/list/ReportFilterCard.vue";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const reportStore = useHospitalProcedureTrendReportStore();
const institutionStore = useInstitutionStore();
const coveragePeriodStore = useCoveragePeriodStore();
const previewFiltersStore = useReportPreviewFiltersStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
const contractId = ref("");
const coveragePeriodId = ref("");
const top = ref<number | string>(10);
const sortOrder = ref<"desc" | "asc">("desc");
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
  top: [
    (v: string | number) => String(v ?? "").trim().length > 0 || t("t-hpt-please-enter-top"),
    (v: string | number) => Number.isInteger(Number(v)) && Number(v) > 0 || t("t-hpt-top-must-be-positive")
  ],
};

const sortOrderOptions = computed(() => [
  { value: "desc", label: t("t-hpt-most-used") },
  { value: "asc", label: t("t-hpt-least-used") },
]);

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
    const payload: HospitalProcedureTrendFilterType = {
      contractId: contractId.value,
      coveragePeriodId: coveragePeriodId.value,
      top: Number(top.value),
      ascending: sortOrder.value === "asc",
    };

    console.log("[HospitalProcedureTrendReport] payload sent to API:", payload);

    const response = await hospitalProcedureTrendReportService.createReport(payload);
    console.log("[HospitalProcedureTrendReport] API response:", response);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t("t-error-generating-report")).forEach((message) => toast.error(message));
      return;
    }

    if (!response.data) {
      toast.error(t("t-no-report-data"));
      return;
    }

    reportStore.setReport(response.data);
    previewFiltersStore.setParameters("100011", buildPreviewParameters([
      { label: t("t-institution"), value: getOptionLabel(institutions.value, contractId.value) },
      { label: t("t-coverage-period"), value: getOptionLabel(coveragePeriods.value, coveragePeriodId.value) },
      { label: t("t-hpt-top"), value: String(top.value) },
      { label: t("t-hpt-order"), value: getOptionLabel(sortOrderOptions.value, sortOrder.value) },
    ]));
    emit("update:modelValue", false);
    router.push({ name: "ReportPreview100011" });
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
      <ReportFilterCard report-id="100011">
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

            <v-col cols="12" md="6" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-hpt-top") }} <i class="ph-asterisk text-danger" /></div>
              <v-text-field
                v-model="top"
                class="text-field-component"
                type="number"
                min="1"
                variant="solo"
                density="compact"
                :rules="requiredRules.top"
                hide-spin-buttons
              />
            </v-col>

            <v-col cols="12" md="6" class="mt-n6 d-flex align-center">
              <div class="w-100">
                <div class="font-weight-bold text-caption mb-1">{{ $t("t-hpt-order") }}</div>
                <MenuSelect v-model="sortOrder" :items="sortOrderOptions" />
              </div>
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
