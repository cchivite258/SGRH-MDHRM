<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { totalBilledByProviderReportService } from "@/app/http/httpServiceProvider";
import type { TotalBilledByProviderFilterType } from "@/components/ammReports/types";
import { TotalBilledByProviderReportExporter } from "./exportUtils";
import { useAuthStore } from "@/store/authStore";
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import type { CoveragePeriodListingType } from "@/components/institution/types";

const { t, locale } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
const serviceProviderStore = useServiceProviderStore();
const institutionStore = useInstitutionStore();
const coveragePeriodStore = useCoveragePeriodStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
const contractId = ref("");
const filterType = ref("");
const serviceProviderId = ref("");
const coveragePeriodId = ref("");
const startDate = ref<Date>(new Date());
const endDate = ref<Date>(new Date());
const localLoading = ref(false);
const errorMsg = ref("");
const exportMenu = ref(false);
type ExportType = "pdf" | "excel" | "csv";
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const providers = computed(() => {
  const list = serviceProviderStore.enabledServiceProviders?.length
    ? serviceProviderStore.enabledServiceProviders
    : serviceProviderStore.service_provider_list;
  return (list || []).map((item: any) => ({ value: item.id, label: item.name }));
});

const institutions = computed(() => {
  return (institutionStore.enabledInstitutions || []).map((item: any) => ({ value: item.id, label: item.name }));
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
  serviceProviderId: [(v: string) => !!v || t("t-please-enter-service-provider")],
  contractId: [(v: string) => !!v || t("t-please-enter-institution")],
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

watch(contractId, async (value) => {
  if (!value) return;
  filterType.value = "";
  coveragePeriodId.value = "";
  startDate.value = new Date();
  endDate.value = new Date();
  await coveragePeriodStore.fetchCoveragePeriodsForDropdown(value, 0, 10000000);
});

const onSubmit = async (exportType: ExportType = "pdf") => {
  const filter = String(filterType.value || "");
  const isMissingRequired =
    !serviceProviderId.value ||
    !contractId.value ||
    !filter ||
    (filter === "1" && !coveragePeriodId.value) ||
    (filter === "2" && (!startDate.value || !endDate.value));

  if (isMissingRequired) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;
  errorMsg.value = "";

  try {
    const payload: TotalBilledByProviderFilterType = {
      contractId: contractId.value,
      serviceProviderId: serviceProviderId.value,
      coveragePeriodId: filter === "1" ? coveragePeriodId.value : undefined,
      startDate: filter === "2" ? startDate.value : undefined,
      endDate: filter === "2" ? endDate.value : undefined,
    };

    const response = await totalBilledByProviderReportService.createReport(payload);
    if (response.status === "error") {
      toast.error(response.error?.message || t("t-error-generating-report"));
      return;
    }

    const data = response.data;
    if (!data) {
      toast.error(t("t-no-report-data"));
      return;
    }

    const prefix = locale.value === "en" ? "total-billed-by-provider" : "total-facturado-por-provedor";
    const fileName = `${prefix}-${new Date().toISOString().split("T")[0]}`;

    if (exportType === "pdf") {
      await TotalBilledByProviderReportExporter.exportToPDF(data, userName.value, { fileName });
    } else if (exportType === "excel") {
      await TotalBilledByProviderReportExporter.exportToExcel(data, userName.value, { fileName });
    } else {
      await TotalBilledByProviderReportExporter.exportToCSV(data, userName.value, { fileName });
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
  await serviceProviderStore.fetchServiceProvidersForDropdown(0, 10000000);
  await institutionStore.fetchInstitutionsforListing(0, 10000000);
});
</script>

<template>
  <v-dialog :model-value="props.modelValue" width="500" persistent>
    <v-form ref="form" @submit.prevent="() => onSubmit()">
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
                {{ $t('t-service-provider') }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect
                v-model="serviceProviderId"
                :items="providers"
                :rules="requiredRules.serviceProviderId"
                :loading="serviceProviderStore.loading"
              />
            </v-col>

            <v-col cols="12" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-institution') }} <i class="ph-asterisk text-danger" />
              </div>
              <MenuSelect
                v-model="contractId"
                :items="institutions"
                :rules="requiredRules.contractId"
                :loading="institutionStore.loading"
              />
            </v-col>

            <v-col cols="12" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-filter-by') }} <i class="ph-asterisk text-danger" />
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
                {{ $t('t-coverage-period') }} <i class="ph-asterisk text-danger" />
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
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-start-date') }} <i class="ph-asterisk text-danger" />
                </div>
                <ValidatedDatePicker v-model="startDate" :rules="requiredRules.startDate" :teleport="false" />
              </v-col>

              <v-col cols="12" lg="6" class="mt-n6">
                <div class="font-weight-bold text-caption mb-1">
                  {{ $t('t-end-date') }} <i class="ph-asterisk text-danger" />
                </div>
                <ValidatedDatePicker v-model="endDate" :rules="requiredRules.endDate" :teleport="false" />
              </v-col>
            </template>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-2" @click="emit('update:modelValue', false)" :disabled="localLoading">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>

          <v-menu v-model="exportMenu">
            <template #activator="{ props }">
              <v-btn color="primary" variant="elevated" v-bind="props" :loading="localLoading" :disabled="localLoading">
                <template v-if="localLoading">
                  <v-progress-circular indeterminate size="20" width="2" class="mr-2" />
                  {{ $t('t-preparing') }}
                </template>
                <template v-else>
                  <i class="ph-download-simple me-1" /> {{ $t('t-generate') }}
                </template>
              </v-btn>
            </template>
            <v-list density="compact" class="export-menu-list">
              <v-list-item
                v-for="option in exportOptions"
                :key="option.value"
                class="export-menu-item"
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

