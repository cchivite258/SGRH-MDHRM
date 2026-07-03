<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { dashboardService } from "@/app/http/httpServiceProvider";
import { useCoveragePeriodStore } from "@/store/institution/coveragePeriodStore";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import type { CoveragePeriodListingType, InstitutionListingType } from "@/components/institution/types";

type SelectOption = {
  label: string;
  value: string | number;
};

type DashboardCard = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
  value: number | null;
  data: Record<string, any> | null;
  loading: boolean;
  errorKey: string | null;
};

const { t } = useI18n();
const institutionStore = useInstitutionStore();
const coveragePeriodStore = useCoveragePeriodStore();

const selectedContractId = ref<string | number | null>(null);
const selectedCoveragePeriodId = ref<string | number | null>(null);
const loadingCoveragePeriods = ref(false);
const dashboardErrorKey = ref<string | null>(null);

const cards = ref<DashboardCard[]>([
  {
    key: "budgetExecution",
    titleKey: "t-dashboard-budget-execution-title",
    descriptionKey: "t-dashboard-budget-execution-description",
    icon: "ph-chart-line-up",
    color: "success",
    value: null,
    data: null,
    loading: false,
    errorKey: null
  },
  {
    key: "beneficiariesUsage",
    titleKey: "t-dashboard-beneficiaries-usage-title",
    descriptionKey: "t-dashboard-beneficiaries-usage-description",
    icon: "ph-users-three",
    color: "primary",
    value: null,
    data: null,
    loading: false,
    errorKey: null
  },
  {
    key: "networkUtilization",
    titleKey: "t-dashboard-network-utilization-title",
    descriptionKey: "t-dashboard-network-utilization-description",
    icon: "ph-first-aid-kit",
    color: "info",
    value: null,
    data: null,
    loading: false,
    errorKey: null
  }
]);

const contractOptions = computed<SelectOption[]>(() =>
  (institutionStore.enabledInstitutions as InstitutionListingType[]).map((item) => ({
    label: item.name,
    value: item.id
  }))
);

const activeCoveragePeriods = computed<CoveragePeriodListingType[]>(() => {
  const periods = coveragePeriodStore.coverage_periods_for_dropdown as CoveragePeriodListingType[];

  return [...periods]
    .filter((item) => item.enabled === true)
    .sort((a, b) => Number(isActivePeriod(b)) - Number(isActivePeriod(a)));
});

const coveragePeriodOptions = computed<SelectOption[]>(() =>
  activeCoveragePeriods.value.map((item) => ({
    label: item.name,
    value: item.id
  }))
);

const filtersLoading = computed(
  () => institutionStore.loading || loadingCoveragePeriods.value
);

const hasDashboardSelection = computed(
  () => selectedContractId.value !== null && selectedCoveragePeriodId.value !== null
);

const isActivePeriod = (period: CoveragePeriodListingType) => {
  const normalizedStatus = String(period.status || "").toUpperCase();
  return ["ACTIVE", "OPEN", "STARTED", "RUNNING", "IN_PROGRESS", "ONGOING"].includes(normalizedStatus);
};

const formatPercentage = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  return `${value.toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
};

const formatCurrency = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "--";

  return `${numberValue.toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} MZN`;
};

const formatNumber = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "--";

  return numberValue.toLocaleString("pt-MZ", {
    maximumFractionDigits: 0
  });
};

const progressWidth = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "0%";
  return `${Math.min(Math.max(value, 0), 100)}%`;
};

const getCardDetail = (card: DashboardCard) => {
  if (card.errorKey) return t(card.errorKey);
  if (!card.data) return t(card.descriptionKey);

  if (card.key === "budgetExecution") {
    return t("t-dashboard-budget-execution-detail", {
      executed: formatCurrency(card.data.totalRevenue),
      budget: formatCurrency(card.data.totalBudget)
    });
  }

  if (card.key === "beneficiariesUsage") {
    return t("t-dashboard-beneficiaries-usage-detail", {
      used: formatNumber(card.data.totalBeneficiariesWithRevenue),
      total: formatNumber(card.data.totalBeneficiaries)
    });
  }

  if (card.key === "networkUtilization") {
    return t("t-dashboard-network-utilization-detail", {
      network: formatCurrency(card.data.totalNetworkUtilizationFee),
      total: formatCurrency(card.data.totalRevenue)
    });
  }

  return t(card.descriptionKey);
};

const getMetricValue = (data: Record<string, any> | null, field: string) => {
  const value = Number(data?.[field]);
  return Number.isFinite(value) ? value : null;
};

const setAllCardsLoading = (loading: boolean) => {
  cards.value = cards.value.map((card) => ({
    ...card,
    loading,
    errorKey: loading ? null : card.errorKey
  }));
};

const resetCardValues = () => {
  cards.value = cards.value.map((card) => ({
    ...card,
    value: null,
    data: null,
    loading: false,
    errorKey: null
  }));
};

const setCardResult = (
  key: string,
  data: Record<string, any> | null,
  valueField: string,
  errorKey: string | null = null
) => {
  cards.value = cards.value.map((card) =>
    card.key === key
      ? {
          ...card,
          value: getMetricValue(data, valueField),
          data,
          loading: false,
          errorKey
        }
      : card
  );
};

const loadCoveragePeriodsForContract = async (contractId: string | number | null) => {
  selectedCoveragePeriodId.value = null;
  resetCardValues();

  if (contractId === null) {
    coveragePeriodStore.coverage_periods_for_dropdown = [];
    return;
  }

  loadingCoveragePeriods.value = true;
  dashboardErrorKey.value = null;

  try {
    await coveragePeriodStore.fetchCoveragePeriodsForDropdown(String(contractId), 0, 10000000);
    const firstPeriod = coveragePeriodOptions.value[0];
    selectedCoveragePeriodId.value = firstPeriod?.value ?? null;

    if (!firstPeriod) {
      dashboardErrorKey.value = "t-dashboard-no-active-coverage-period";
    }
  } catch {
    dashboardErrorKey.value = "t-dashboard-error-loading-coverage-periods";
  } finally {
    loadingCoveragePeriods.value = false;
  }
};

const loadDashboardCards = async () => {
  if (!hasDashboardSelection.value) {
    resetCardValues();
    return;
  }

  const payload = {
    contractId: selectedContractId.value as string | number,
    coveragePeriodId: selectedCoveragePeriodId.value as string | number
  };

  setAllCardsLoading(true);
  dashboardErrorKey.value = null;

  const results = await Promise.allSettled([
    dashboardService.getPercentageOfBudgetExecution(payload),
    dashboardService.getPercentageOfBudgetExecutionByBeneficiaries(payload),
    dashboardService.getNetworkUtilizationFee(payload)
  ]);

  setCardResult(
    "budgetExecution",
    results[0].status === "fulfilled" ? results[0].value : null,
    "percentageOfBudgetExecution",
    results[0].status === "rejected" ? "t-dashboard-error-loading-indicator" : null
  );
  setCardResult(
    "beneficiariesUsage",
    results[1].status === "fulfilled" ? results[1].value : null,
    "percentageOfBeneficiariesWithRevenue",
    results[1].status === "rejected" ? "t-dashboard-error-loading-indicator" : null
  );
  setCardResult(
    "networkUtilization",
    results[2].status === "fulfilled" ? results[2].value : null,
    "percentageOfNetworkUtilizationFee",
    results[2].status === "rejected" ? "t-dashboard-error-loading-indicator" : null
  );

  if (results.some((result) => result.status === "rejected")) {
    dashboardErrorKey.value = "t-dashboard-some-indicators-not-loaded";
  }
};

watch(selectedContractId, async (contractId) => {
  await loadCoveragePeriodsForContract(contractId);
});

watch(selectedCoveragePeriodId, async () => {
  await loadDashboardCards();
});

onMounted(async () => {
  dashboardErrorKey.value = null;

  try {
    await institutionStore.fetchInstitutionsforListing(0, 10000000);
    selectedContractId.value = contractOptions.value[0]?.value ?? null;

    if (!selectedContractId.value) {
      dashboardErrorKey.value = "t-dashboard-no-active-contracts";
    }
  } catch {
    dashboardErrorKey.value = "t-dashboard-error-loading-contracts";
  }
});
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-page__header">
      <div>
        <h4 class="dashboard-page__title">{{ $t("t-dashboard-title") }}</h4>
        <p class="dashboard-page__subtitle mb-0">
          {{ $t("t-dashboard-subtitle") }}
        </p>
      </div>

      <div class="dashboard-toolbar">
        <div class="dashboard-filter-field dashboard-filter-field--contract">
          <div class="dashboard-filter-label">{{ $t("t-contract") }}</div>
          <v-autocomplete
            v-model="selectedContractId"
            :items="contractOptions"
            :loading="institutionStore.loading"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            :placeholder="$t('t-dashboard-select-contract')"
            :no-data-text="$t('t-dashboard-no-active-contracts-short')"
          />
        </div>

        <div class="dashboard-filter-field dashboard-filter-field--period">
          <div class="dashboard-filter-label">{{ $t("t-coverage-period") }}</div>
          <v-autocomplete
            v-model="selectedCoveragePeriodId"
            :items="coveragePeriodOptions"
            :loading="loadingCoveragePeriods"
            :disabled="!selectedContractId || loadingCoveragePeriods"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            :placeholder="$t('t-dashboard-select-coverage-period')"
            :no-data-text="$t('t-dashboard-no-active-coverage-period-short')"
          />
        </div>

        <v-btn
          class="dashboard-refresh-btn"
          color="primary"
          variant="tonal"
          :loading="filtersLoading"
          :disabled="!hasDashboardSelection"
          @click="loadDashboardCards"
        >
          {{ $t("t-dashboard-refresh") }}
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="dashboardErrorKey"
      type="warning"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ $t(dashboardErrorKey) }}
    </v-alert>

    <v-row>
      <v-col
        v-for="card in cards"
        :key="card.key"
        cols="12"
        md="4"
      >
        <v-card class="dashboard-metric-card" :class="`dashboard-metric-card--${card.color}`" elevation="0">
          <v-card-text>
            <div class="dashboard-metric-card__top">
              <div
                class="dashboard-metric-card__icon"
                :class="`dashboard-metric-card__icon--${card.color}`"
              >
                <i :class="card.icon"></i>
              </div>

              <div class="dashboard-metric-card__main">
                <div class="dashboard-metric-card__title">{{ $t(card.titleKey) }}</div>
                <div class="dashboard-metric-card__value">
                  {{ formatPercentage(card.value) }}
                </div>
              </div>

              <v-progress-circular
                v-if="card.loading"
                indeterminate
                size="22"
                width="3"
                :color="card.color"
              />
            </div>

            <div class="dashboard-metric-card__progress">
              <span :style="{ width: progressWidth(card.value) }"></span>
            </div>

            <div class="dashboard-metric-card__description">
              {{ getCardDetail(card) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 18px 0 0;
}

.dashboard-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.dashboard-page__title {
  font-size: 1.28rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.dashboard-page__subtitle {
  color: #6c757d;
  font-size: 0.88rem;
}

.dashboard-toolbar {
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}

.dashboard-filter-field {
  min-width: 180px;
}

.dashboard-filter-field--contract {
  width: 260px;
}

.dashboard-filter-field--period {
  width: 220px;
}

.dashboard-filter-label {
  color: #111827;
  font-size: 0.76rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.dashboard-toolbar :deep(.v-field) {
  border-radius: 8px;
  min-height: 38px;
}

.dashboard-toolbar :deep(.v-field__input) {
  min-height: 38px;
  padding-bottom: 6px;
  padding-top: 6px;
}

.dashboard-refresh-btn {
  min-height: 38px;
  min-width: 118px;
}

.dashboard-metric-card {
  border: 1px solid #e9edf3;
  border-radius: 8px !important;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.055) !important;
  min-height: 166px;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.dashboard-metric-card:hover {
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08) !important;
  transform: translateY(-2px);
}

.dashboard-metric-card--primary {
  background: linear-gradient(135deg, #ffffff 0%, #f5f8ff 100%);
}

.dashboard-metric-card--success {
  background: linear-gradient(135deg, #ffffff 0%, #f5fbf7 100%);
}

.dashboard-metric-card--info {
  background: linear-gradient(135deg, #ffffff 0%, #f8f5ff 100%);
}

.dashboard-metric-card :deep(.v-card-text) {
  padding: 20px 22px;
}

.dashboard-metric-card__top {
  align-items: flex-start;
  display: flex;
  gap: 16px;
}

.dashboard-metric-card__icon {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 1.65rem;
  height: 64px;
  justify-content: center;
  width: 64px;
}

.dashboard-metric-card__icon--primary {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.dashboard-metric-card__icon--success {
  background: rgba(46, 125, 50, 0.12);
  color: #2e7d32;
}

.dashboard-metric-card__icon--info {
  background: rgba(112, 64, 183, 0.12);
  color: #7040b7;
}

.dashboard-metric-card__main {
  min-width: 0;
}

.dashboard-metric-card__title {
  color: #111827;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.28;
  min-height: 36px;
}

.dashboard-metric-card__value {
  color: #2563eb;
  font-size: 1.95rem;
  font-weight: 700;
  line-height: 1.1;
  margin-top: 10px;
}

.dashboard-metric-card--success .dashboard-metric-card__value {
  color: #2e7d32;
}

.dashboard-metric-card--info .dashboard-metric-card__value {
  color: #7040b7;
}

.dashboard-metric-card__progress {
  background: #e7eaf0;
  border-radius: 999px;
  height: 6px;
  margin: 18px 2px 14px;
  overflow: hidden;
}

.dashboard-metric-card__progress span {
  background: #2563eb;
  border-radius: inherit;
  display: block;
  height: 100%;
  transition: width 0.25s ease;
}

.dashboard-metric-card--success .dashboard-metric-card__progress span {
  background: #2e7d32;
}

.dashboard-metric-card--info .dashboard-metric-card__progress span {
  background: #7040b7;
}

.dashboard-metric-card__description {
  color: #4b5563;
  font-size: 0.76rem;
  line-height: 1.35;
}

@media (max-width: 959px) {
  .dashboard-page__header {
    display: block;
  }

  .dashboard-toolbar {
    justify-content: flex-start;
    margin-top: 14px;
  }

  .dashboard-filter-field {
    width: 100%;
  }

  .dashboard-refresh-btn {
    width: 100%;
  }
}
</style>
