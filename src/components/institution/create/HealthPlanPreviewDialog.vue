<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { amountFormate } from "@/app/common/amountFormate";
import type { HospitalProcedureListingType } from "@/components/institution/types";
import { healthPlanLimitOptions, limitTypeDefinitionOptions } from "@/components/institution/create/utils";

const props = defineProps<{
  modelValue: boolean;
  healthPlan: any;
  procedures: HospitalProcedureListingType[];
  loading?: boolean;
  exporting?: boolean;
  contextLabel?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  export: [];
}>();

const { t } = useI18n();
const healthPlanProcedureSearch = ref("");

const dialog = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const activePlanCoveragePeriod = computed(() =>
  props.healthPlan?.coveragePeriod?.name
  || props.healthPlan?.coveragePeriodName
  || props.healthPlan?.name
  || "-"
);

const activePlanProcedures = computed(() => props.procedures || []);

const filteredPlanProcedures = computed(() => {
  const search = healthPlanProcedureSearch.value.trim().toLowerCase();
  if (!search) return activePlanProcedures.value;

  return activePlanProcedures.value.filter((procedure) => {
    const procedureType = procedure.hospitalProcedureType || {};
    const searchable = [
      procedureType.code,
      procedureType.name,
      procedureType.categoryName,
      getProcedureGroupName(procedure),
      getProcedureLimitLabel(procedure),
      getFrequencyLabel(procedure)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(search);
  });
});

const groupedPlanProcedureGroups = computed(() => {
  const groupMap = filteredPlanProcedures.value.reduce((groups, procedure) => {
    const group = getProcedureGroupName(procedure);
    if (!groups[group]) groups[group] = [];

    groups[group].push(procedure);
    return groups;
  }, {} as Record<string, HospitalProcedureListingType[]>);

  return Object.entries(groupMap).map(([group, procedures]) => {
    const categoryMap = procedures.reduce((categories, procedure) => {
      const category = getProcedureCategoryName(procedure);
      if (!categories[category]) categories[category] = [];

      categories[category].push(procedure);
      return categories;
    }, {} as Record<string, HospitalProcedureListingType[]>);

    return {
      group,
      procedures,
      categories: Object.entries(categoryMap).map(([category, categoryProcedures]) => ({
        category,
        procedures: categoryProcedures
      }))
    };
  });
});

const statusValue = computed(() =>
  props.healthPlan?.status || (props.healthPlan?.enabled === false ? "INACTIVE" : "ACTIVE")
);

const getProcedureType = (procedure: HospitalProcedureListingType) =>
  procedure.hospitalProcedureType || {};

const getProcedureName = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).name || "-";

const getProcedureCode = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).code || "";

const getProcedureCategoryName = (procedure: HospitalProcedureListingType) =>
  getProcedureType(procedure).categoryName || t("t-procedures");

const getProcedureGroupName = (procedure: HospitalProcedureListingType) => {
  const group = procedure.hospitalProcedureGroup;
  if (!group) return "-";
  return typeof group === "object" ? group.name || "-" : String(group);
};

const formatPlanMoney = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${amountFormate(Number(value))} MT`;
};

const formatPlanPercent = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}%`;
};

const humanizeEnum = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

const getTranslatedEnum = (prefix: string, value: string | null | undefined) => {
  if (!value) return "";
  const key = `${prefix}-${value.toString().toLowerCase().replace(/_/g, "-")}`;
  const translated = t(key);
  return translated === key ? humanizeEnum(value) : translated;
};

const getHealthPlanStatusLabel = (value: string | null | undefined) =>
  getTranslatedEnum("t", value) || "-";

const getHealthPlanLimitLabel = (value: string | null | undefined) =>
  healthPlanLimitOptions.find(option => option.value === value)?.label || (value ? humanizeEnum(value) : "-");

const getLimitTypeDefinitionLabel = (value: string | null | undefined) =>
  value ? limitTypeDefinitionOptions.find(option => option.value === value)?.label || humanizeEnum(value) : "";

const getProcedureSource = (procedure: HospitalProcedureListingType) => {
  const item = procedure as any;
  return item.companyHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedures
    || item.contractHealthPlanHospitalProcedure
    || item;
};

type DisplayValue = number | string | null | undefined;

const firstDefined = (...values: DisplayValue[]): DisplayValue =>
  values.find(value => value !== null && value !== undefined && value !== "");

const procedureUsesGroupLimit = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  return Boolean(
    source.belongsToGroup
    || firstDefined(source.groupFixedAmount, source.groupPercentage, source.hospitalProcedureGroupLimit)
  );
};

const getProcedureFixedAmount = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupFixedAmount, source.fixedAmount)
    : firstDefined(source.fixedAmount, source.groupFixedAmount);
};

const getProcedurePercentage = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  return procedureUsesGroupLimit(procedure)
    ? firstDefined(source.groupPercentage, source.percentage)
    : firstDefined(source.percentage, source.groupPercentage);
};

const getProcedureLimitLabel = (procedure: HospitalProcedureListingType) =>
  getLimitTypeDefinitionLabel(procedureUsesGroupLimit(procedure)
    ? getProcedureSource(procedure).hospitalProcedureGroupLimit
    : getProcedureSource(procedure).limitTypeDefinition)
  || getTranslatedEnum("t-limit-type", getProcedureSource(procedure).limitType)
  || "-";

const getFrequencyLabel = (procedure: HospitalProcedureListingType) => {
  const source = getProcedureSource(procedure);
  const allowedFrequencyUse = firstDefined(source.allowedFrequencyUse, procedure.allowedFrequencyUse);
  const frequencyInterval = firstDefined(source.frequencyInterval, procedure.frequencyInterval);
  if (!allowedFrequencyUse || !frequencyInterval) return "-";

  const limitTypeLabel = getTranslatedEnum("t-limit-type", source.limitType || (procedure as any).limitType);
  return limitTypeLabel
    ? `${allowedFrequencyUse}/${frequencyInterval} ${limitTypeLabel}`
    : `${allowedFrequencyUse}/${frequencyInterval}`;
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="1180" scrollable>
    <v-card class="health-plan-preview" elevation="12">
      <div class="health-plan-preview__hero">
        <div>
          <div class="text-overline text-primary font-weight-bold mb-1">
            {{ $t('t-health-plan') }}
          </div>
          <h3 class="text-h5 font-weight-bold mb-2">
            {{ activePlanCoveragePeriod }}
          </h3>
          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip color="success" variant="flat" size="small">
              {{ getHealthPlanStatusLabel(statusValue) }}
            </v-chip>
            <span class="text-muted">
              {{ contextLabel || healthPlan?.company?.name || healthPlan?.companyName || '-' }}
            </span>
          </div>
        </div>

        <div class="d-flex align-center ga-2">
          <v-btn
            color="primary"
            variant="tonal"
            :disabled="activePlanProcedures.length === 0"
            :loading="exporting"
            @click="$emit('export')"
          >
            <i class="ph-file-pdf me-1" /> Exportar PDF
          </v-btn>

          <v-btn icon variant="text" @click="dialog = false">
            <i class="ph-x" />
          </v-btn>
        </div>
      </div>

      <v-card-text class="pt-0">
        <v-row class="mt-1">
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-health-plan-limit') }}</span>
              <strong>{{ getHealthPlanLimitLabel(healthPlan?.healthPlanLimit) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-fixed-amount') }}</span>
              <strong>{{ formatPlanMoney(healthPlan?.fixedAmount) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric plan-metric--success">
              <span>{{ $t('t-percentage') }}</span>
              <strong>{{ formatPlanPercent(healthPlan?.companyContributionPercentage) }}</strong>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="plan-metric">
              <span>{{ $t('t-procedures') }}</span>
              <strong>{{ activePlanProcedures.length }}</strong>
            </div>
          </v-col>
        </v-row>

        <div class="d-flex align-center justify-space-between flex-wrap ga-3 mt-5 mb-4">
          <div>
            <h4 class="text-subtitle-1 font-weight-bold mb-1">
              {{ $t('t-procedures') }}
            </h4>
            <p class="text-muted mb-0">{{ activePlanProcedures.length }} {{ $t('t-procedures').toLowerCase() }}</p>
          </div>

          <v-text-field
            v-model="healthPlanProcedureSearch"
            class="plan-search"
            density="compact"
            hide-details
            variant="outlined"
            prepend-inner-icon="ph-magnifying-glass"
            :placeholder="$t('t-search-for-hospital-procedures')"
          />
        </div>

        <v-progress-linear v-if="loading" color="primary" indeterminate rounded class="mb-4" />

        <v-alert
          v-if="!loading && filteredPlanProcedures.length === 0"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          {{ $t('t-no-procedures-found') }}
        </v-alert>

        <div v-else class="procedure-table-wrap">
          <v-table density="compact" fixed-header height="560" class="procedure-table">
            <thead>
              <tr>
                <th style="width: 12%">Codigo</th>
                <th>{{ $t('t-procedures') }}</th>
                <th style="width: 15%">{{ $t('t-fixed-amount') }}</th>
                <th style="width: 12%">{{ $t('t-percentage') }}</th>
                <th style="width: 18%">{{ $t('t-limit-type') }}</th>
                <th style="width: 14%">{{ $t('t-frequency-interval') }}</th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="group in groupedPlanProcedureGroups"
                :key="group.group"
              >
                <tr class="group-row">
                  <td colspan="6">
                    <div class="d-flex align-center justify-space-between">
                      <span>
                        <i class="ph-stack me-2" />
                        {{ group.group }}
                      </span>
                      <v-chip color="secondary" variant="flat" size="x-small">
                        {{ group.procedures.length }}
                      </v-chip>
                    </div>
                  </td>
                </tr>

                <template
                  v-for="category in group.categories"
                  :key="`${group.group}-${category.category}`"
                >
                  <tr class="category-row">
                    <td colspan="6">
                      <div class="d-flex align-center justify-space-between">
                        <span>
                          <i class="ph-folder-open me-2" />
                          {{ category.category }}
                        </span>
                        <span class="text-caption">{{ category.procedures.length }} {{ $t('t-procedures').toLowerCase() }}</span>
                      </div>
                    </td>
                  </tr>

                  <tr
                    v-for="procedure in category.procedures"
                    :key="procedure.id"
                    class="procedure-row"
                  >
                    <td class="font-weight-medium text-primary">
                      {{ getProcedureCode(procedure) || '-' }}
                    </td>
                    <td>
                      <div class="font-weight-medium">{{ getProcedureName(procedure) }}</div>
                    </td>
                    <td>{{ formatPlanMoney(getProcedureFixedAmount(procedure)) }}</td>
                    <td>{{ formatPlanPercent(getProcedurePercentage(procedure)) }}</td>
                    <td>{{ getProcedureLimitLabel(procedure) }}</td>
                    <td>{{ getFrequencyLabel(procedure) }}</td>
                  </tr>
                </template>
              </template>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.health-plan-preview {
  border-radius: 18px;
  overflow: hidden;
}

.health-plan-preview__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 20px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-secondary), 0.08)),
    rgb(var(--v-theme-surface));
}

.plan-metric {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  padding: 16px;
}

.plan-metric span {
  display: block;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.78rem;
  margin-bottom: 4px;
}

.plan-metric strong {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.15rem;
}

.plan-metric--success strong {
  color: rgb(var(--v-theme-success));
}

.plan-search {
  max-width: 360px;
  min-width: 260px;
}

.procedure-table-wrap {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  overflow: hidden;
}

.procedure-table :deep(thead tr),
.procedure-table :deep(thead th) {
  background: rgb(var(--v-theme-primary)) !important;
}

.procedure-table :deep(thead th) {
  border-bottom: 3px solid rgba(var(--v-theme-on-primary), 0.32) !important;
  box-shadow: 0 3px 10px rgba(var(--v-theme-primary), 0.24);
  color: rgb(var(--v-theme-on-primary)) !important;
  font-size: 0.72rem;
  font-weight: 900 !important;
  height: 52px;
  letter-spacing: 0.01em;
  line-height: 1.25;
  padding: 12px 14px;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  vertical-align: middle;
  z-index: 3;
}

.procedure-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.procedure-table :deep(td) {
  font-size: 0.76rem;
  line-height: 1.35;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

.procedure-table :deep(th) {
  white-space: normal;
}

.group-row td {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.4;
  padding: 12px 14px;
  vertical-align: middle;
}

.category-row td {
  background: rgba(var(--v-theme-on-surface), 0.032);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 700;
  line-height: 1.4;
  padding: 11px 14px;
  vertical-align: middle;
}

.procedure-row td {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.procedure-row:hover td {
  background: rgba(var(--v-theme-primary), 0.045);
}

@media (max-width: 600px) {
  .health-plan-preview__hero {
    padding: 20px;
  }

  .plan-search {
    max-width: 100%;
    min-width: 100%;
  }
}
</style>
