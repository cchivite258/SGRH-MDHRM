<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { totalBilledMedicalAssistanceReportService } from "@/app/http/httpServiceProvider";
import { useTotalBilledMedicalAssistanceReportStore } from "@/store/reports/totalBilledMedicalAssistanceReportStore";
import { useRouter } from "vue-router";
import type { TotalBilledMedicalAssistanceFilterType } from "@/components/ammReports/types";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import type { CoveragePeriodListingType } from "@/components/institution/types";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const reportStore = useTotalBilledMedicalAssistanceReportStore();
const institutionStore = useInstitutionStore();
const coveragePeriodStore = useCoveragePeriodStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const companyId = ref("");
const filterType = ref("");
const coveragePeriodId = ref("");
const startDate = ref<Date>(new Date());
const endDate = ref<Date>(new Date());
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
  companyId: [(v: string) => !!v || t("t-please-enter-institution")],
  filterType: [(v: string) => !!v || t("t-please-select-filter")],
  coveragePeriodId: [
    (v: string) => {
      if (filterType.value === "1") return !!v || t("t-please-enter-coverage-period");
      return true;
    }
  ],
  startDate: [
    (v: Date | null) => {
      if (filterType.value === "2") return !!v || t("t-please-enter-start-date");
      return true;
    }
  ],
  endDate: [
    (v: Date | null) => {
      if (filterType.value === "2") return !!v || t("t-please-enter-end-date");
      return true;
    }
  ],
};

watch(companyId, async (value) => {
  if (!value) return;
  filterType.value = "";
  coveragePeriodId.value = "";
  startDate.value = new Date();
  endDate.value = new Date();
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
  let finalStartDate: Date | undefined;
  let finalEndDate: Date | undefined;

  if (filterType.value === "1") {
    const selectedCoverage = (coveragePeriodStore.coverage_periods_for_dropdown || []).find(
      (item: any) => String(item.id) === String(coveragePeriodId.value)
    );
    if (!selectedCoverage?.startDate || !selectedCoverage?.endDate) {
      localLoading.value = false;
      toast.error(t("t-please-enter-coverage-period"));
      return;
    }
    finalStartDate = new Date(selectedCoverage.startDate);
    finalEndDate = new Date(selectedCoverage.endDate);
  } else {
    finalStartDate = startDate.value;
    finalEndDate = endDate.value;
  }

  const payload: TotalBilledMedicalAssistanceFilterType = {
    companyId: companyId.value,
    startDate: finalStartDate,
    endDate: finalEndDate,
  };

  const response = await totalBilledMedicalAssistanceReportService.createReport(payload);
  localLoading.value = false;

  if (response.status === "error") {
    toast.error(response.error?.message || t("t-error-generating-report"));
    return;
  }

  reportStore.setReport(response.data || []);
  emit("update:modelValue", false);
  router.push({ name: "ReportPreview100007" });
};

onMounted(async () => {
  await institutionStore.fetchInstitutionsforListing(0, 10000000);
});
</script>

<template>
  <v-dialog :model-value="props.modelValue" width="500" persistent>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="$t('t-filters')" title-class="py-0">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="emit('update:modelValue', false)" />
        </template>

        <v-divider />

        <v-card-text>
          <v-row>
            <v-col cols="12" class="mt-1">
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
                {{ $t("t-filter-by") }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect
                v-model="filterType"
                :items="[
                  { value: '1', label: $t('t-coverage-period') },
                  { value: '2', label: $t('t-dates') }
                ]"
                :rules="requiredRules.filterType"
              />
            </v-col>

            <v-col cols="12" class="mt-n6" v-if="filterType === '1'">
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

            <template v-if="filterType === '2'">
              <v-col cols="12" lg="6" class="mt-n6">
                <div class="font-weight-bold text-caption mb-1">{{ $t("t-start-date") }} <i class="ph-asterisk text-danger" /></div>
                <ValidatedDatePicker v-model="startDate" :rules="requiredRules.startDate" :teleport="true" />
              </v-col>
              <v-col cols="12" lg="6" class="mt-n6">
                <div class="font-weight-bold text-caption mb-1">{{ $t("t-end-date") }} <i class="ph-asterisk text-danger" /></div>
                <ValidatedDatePicker v-model="endDate" :rules="requiredRules.endDate" :teleport="true" />
              </v-col>
            </template>
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
