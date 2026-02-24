<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { topServiceTypesByClinicReportService } from "@/app/http/httpServiceProvider";
import type { TopServiceTypesByClinicFilterType } from "@/components/ammReports/types";
import { TopServiceTypesByClinicReportExporter } from "./exportUtils";
import { useAuthStore } from "@/store/authStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import type { CoveragePeriodListingType } from "@/components/institution/types";

const { t, locale } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
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
const errorMsg = ref("");
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

const userName = computed(() => {
  const user = authStore.user;
  if (!user) return "Sistema";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Sistema";
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
  errorMsg.value = "";
  try {
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

    const payload: TopServiceTypesByClinicFilterType = {
      startDate: finalStartDate,
      endDate: finalEndDate,
    };

    const response = await topServiceTypesByClinicReportService.createReport(payload);
    if (response.status === "error") {
      toast.error(response.error?.message || t("t-error-generating-report"));
      return;
    }

    const data = response.data || [];
    if (!data.length) {
      toast.error(t("t-no-report-data"));
      return;
    }

    const prefix = locale.value === "en" ? "top-service-types-by-service-provider" : "tipos-servico-mais-realizados-por-provedor-de-servico";
    const fileName = `${prefix}-${new Date().toISOString().split("T")[0]}`;
    await TopServiceTypesByClinicReportExporter.exportToPDF(data, userName.value, { fileName });

    emit("update:modelValue", false);
    toast.success(t("t-pdf-generated-successfully"));
  } catch (error: any) {
    errorMsg.value = t("t-error-generating-pdf");
    toast.error(errorMsg.value);
  } finally {
    localLoading.value = false;
  }
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

            <v-col cols="12" class="mt-1" v-if="companyId">
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

            <v-col cols="12" class="mt-1" v-if="filterType === '1'">
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
              <v-col cols="12" lg="6" class="mt-1">
                <div class="font-weight-bold text-caption mb-1">{{ $t("t-start-date") }} <i class="ph-asterisk text-danger" /></div>
                <ValidatedDatePicker v-model="startDate" :rules="requiredRules.startDate" :teleport="true" />
              </v-col>
              <v-col cols="12" lg="6" class="mt-1">
                <div class="font-weight-bold text-caption mb-1">{{ $t("t-end-date") }} <i class="ph-asterisk text-danger" /></div>
                <ValidatedDatePicker v-model="endDate" :rules="requiredRules.endDate" :teleport="true" />
              </v-col>
            </template>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-2" @click="emit('update:modelValue', false)" :disabled="localLoading">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            <template v-if="localLoading">
              <v-progress-circular indeterminate size="20" width="2" class="mr-2" />
              {{ $t("t-generating-pdf") }}
            </template>
            <template v-else>
              <i class="ph-file-pdf me-1" /> {{ $t("t-generate-pdf") }}
            </template>
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
