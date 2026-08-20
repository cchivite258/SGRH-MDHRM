<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { PERMISSIONS } from "@/app/permissions/constants";
import { formateDate } from "@/app/common/dateFormate";
import { usePermissions } from "@/composables/usePermissions";
import { reports } from "@/components/ammReports/list/utils";
import type { ReportType } from "@/components/ammReports/types";
import { useReportPreviewFiltersStore } from "@/store/reports/reportPreviewFiltersStore";
import type { ReportPreviewParameterType } from "@/store/reports/reportPreviewFiltersStore";
import ReportPreviewDialogsHost from "@/components/ammReports/list/ReportPreviewDialogsHost.vue";

const props = defineProps<{
  currentReportId: string;
  report?: unknown;
}>();

const { t } = useI18n();
const router = useRouter();
const { canAny } = usePermissions();
const previewFiltersStore = useReportPreviewFiltersStore();
const previewDialogsHost = ref<InstanceType<typeof ReportPreviewDialogsHost> | null>(null);

type PreviewReportOption = ReportType & {
  translatedTitle: string;
};

const getReportPermission = (report: ReportType) => {
  return PERMISSIONS.REPORTS.BY_ID[report.id as keyof typeof PERMISSIONS.REPORTS.BY_ID] || PERMISSIONS.REPORTS.VIEW;
};

const canReadReport = (report: ReportType) => {
  return canAny([PERMISSIONS.REPORTS.VIEW, getReportPermission(report)]);
};

const availableReports = computed<PreviewReportOption[]>(() => {
  return reports
    .filter((report) => canReadReport(report))
    .map((report) => ({
      ...report,
      translatedTitle: t(`t-${report.title}`),
    }));
});

const currentIndex = computed(() => {
  return availableReports.value.findIndex((report) => report.id === props.currentReportId);
});

const currentReport = computed(() => {
  return availableReports.value[currentIndex.value] || availableReports.value.find((report) => report.id === props.currentReportId);
});

const previousReport = computed(() => {
  if (currentIndex.value <= 0) return undefined;
  return availableReports.value[currentIndex.value - 1];
});

const nextReport = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= availableReports.value.length - 1) return undefined;
  return availableReports.value[currentIndex.value + 1];
});

const reportRows = computed<Record<string, any>[]>(() => {
  if (!props.report) return [];
  if (Array.isArray(props.report)) return props.report.filter((item) => item && typeof item === "object");
  if (typeof props.report === "object") return [props.report as Record<string, any>];
  return [];
});

const firstReportRow = computed(() => reportRows.value[0] || {});

const formatParameterDate = (date?: Date | string) => {
  return formateDate(date) || "";
};

const pushParameter = (
  list: ReportPreviewParameterType[],
  label: string,
  value: unknown
) => {
  const normalizedValue = String(value ?? "").trim();
  if (!normalizedValue || normalizedValue === "-") return;

  if (list.some((item) => item.label === label && item.value === normalizedValue)) return;
  list.push({ label, value: normalizedValue });
};

const joinDefined = (values: unknown[], separator = " / ") => {
  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(separator);
};

const derivedParameters = computed<ReportPreviewParameterType[]>(() => {
  const first = firstReportRow.value;
  const list: ReportPreviewParameterType[] = [];

  const contractName = first.contractName
    || first.contract?.name
    || first.organization?.name
    || first.contract?.organization?.name
    || first.contract?.companyDetails?.name;
  const coverageName = first.coveragePeriodName || first.coveragePeriod?.name;
  const providerName = props.currentReportId === "100005"
    ? joinDefined(reportRows.value.map((row) => row.serviceProviderName || row.serviceProvider?.name))
    : first.serviceProviderName || first.serviceProvider?.name;
  const employeeName = joinDefined([
    first.employeeName,
    [first.employeeFirstName, first.employeeLastName].filter(Boolean).join(" "),
    [first.employee?.firstName, first.employee?.lastName].filter(Boolean).join(" "),
  ], "");
  const startDate = first.coveragePeriod?.startDate
    || first.coveragePeriodStartDate
    || first.startDate
    || first.fromDate
    || first.issueDateFrom;
  const endDate = first.coveragePeriod?.endDate
    || first.coveragePeriodEndDate
    || first.endDate
    || first.toDate
    || first.issueDateTo;

  pushParameter(list, t("t-institution"), contractName);
  pushParameter(list, t("t-coverage-period"), coverageName);
  pushParameter(list, t("t-service-provider"), providerName);
  pushParameter(list, t("t-employee"), employeeName);
  pushParameter(list, t("t-invoice-reference"), first.invoiceReferenceNumber);
  pushParameter(list, t("t-start-period"), formatParameterDate(startDate));
  pushParameter(list, t("t-end-period"), formatParameterDate(endDate));

  return list;
});

const parameters = computed(() => {
  const savedParameters = previewFiltersStore.parametersByReportId[props.currentReportId] || [];
  return savedParameters.length ? savedParameters : derivedParameters.value;
});

// Abre filtros sobre o preview actual, mantendo o utilizador no mesmo contexto
// em vez de envia-lo para a listagem.
const openPreviewDialog = (reportId: string) => {
  previewDialogsHost.value?.openPreviewDialog(reportId);
};

const goToReport = (report?: PreviewReportOption) => {
  if (!report || report.id === props.currentReportId) return;
  openPreviewDialog(report.id);
};

const changeCurrentParameters = () => {
  openPreviewDialog(props.currentReportId);
};

const goToReportsList = () => {
  router.push({ name: "ReportsList" });
};
</script>

<template>
  <v-container class="report-preview-navigator-wrap pb-0" max-width="1000px">
    <div class="report-preview-navigator">
      <div class="report-preview-top">
        <div class="report-preview-current">
          <v-btn
            icon
            rounded
            color="primary"
            variant="tonal"
            density="comfortable"
            class="report-preview-back"
            @click="goToReportsList"
          >
            <i class="ph-arrow-left"></i>
            <v-tooltip activator="parent" location="bottom">
              {{ $t("t-reports-list") }}
            </v-tooltip>
          </v-btn>

          <div class="report-preview-title-block">
            <div class="report-preview-eyebrow">
              <i class="ph-file-text"></i>
              <span>{{ $t("t-preview-report") }}</span>
            </div>
            <div class="report-preview-title">
              {{ currentReport?.translatedTitle || $t("t-report") }}
            </div>
          </div>
        </div>

        <div class="report-preview-actions">
          <v-btn
            icon
            rounded
            variant="outlined"
            density="comfortable"
            class="report-preview-step"
            :disabled="!previousReport"
            @click="goToReport(previousReport)"
          >
            <i class="ph-caret-left"></i>
            <v-tooltip activator="parent" location="bottom">
              {{ previousReport?.translatedTitle || $t("t-back") }}
            </v-tooltip>
          </v-btn>

          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                color="primary"
                variant="outlined"
                class="report-preview-menu-btn"
              >
                <i class="ph-squares-four me-2"></i>
                <span class="report-preview-menu-label">{{ $t("t-switch-report") }}</span>
                <span class="report-preview-code">#{{ currentReportId }}</span>
                <i class="ph-caret-down ms-2"></i>
              </v-btn>
            </template>

            <v-list density="compact" class="report-preview-list">
              <v-list-item
                v-for="report in availableReports"
                :key="report.id"
                :active="report.id === currentReportId"
                :disabled="report.id === currentReportId"
                class="report-preview-list-item"
                @click="goToReport(report)"
              >
                <template #prepend>
                  <v-avatar size="28" color="primary" variant="tonal">
                    <i :class="report.img"></i>
                  </v-avatar>
                </template>
                <v-list-item-title class="report-preview-list-title">
                  {{ report.translatedTitle }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  #{{ report.id }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn
            icon
            rounded
            variant="outlined"
            density="comfortable"
            class="report-preview-step"
            :disabled="!nextReport"
            @click="goToReport(nextReport)"
          >
            <i class="ph-caret-right"></i>
            <v-tooltip activator="parent" location="bottom">
              {{ nextReport?.translatedTitle || $t("t-report") }}
            </v-tooltip>
          </v-btn>

          <v-btn
            color="primary"
            variant="tonal"
            class="report-preview-change-btn"
            @click="changeCurrentParameters"
          >
            <i class="ph-sliders-horizontal me-2"></i>
            {{ $t("t-change-parameters") }}
          </v-btn>
        </div>
      </div>

      <div v-if="parameters.length" class="report-preview-parameters">
        <div class="report-preview-parameters-label">
          <i class="ph-funnel"></i>
          <span>{{ $t("t-selected-parameters") }}</span>
        </div>

        <div class="report-preview-parameter-list">
          <span
            v-for="parameter in parameters"
            :key="`${parameter.label}-${parameter.value}`"
            class="report-preview-parameter"
          >
            <span class="report-preview-parameter-label">{{ parameter.label }}</span>
            <span class="report-preview-parameter-value">{{ parameter.value }}</span>
          </span>
        </div>
      </div>
    </div>
  </v-container>

  <ReportPreviewDialogsHost ref="previewDialogsHost" />
</template>

<style scoped>
.report-preview-navigator-wrap {
  padding-top: 18px;
}

.report-preview-navigator {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-surface), 0.96)),
    rgb(var(--v-theme-surface));
  box-shadow: 0 8px 22px rgba(var(--v-theme-on-surface), 0.06);
}

.report-preview-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.report-preview-current,
.report-preview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.report-preview-title-block {
  min-width: 0;
}

.report-preview-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.report-preview-title {
  color: rgb(var(--v-theme-on-surface));
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-preview-back,
.report-preview-step {
  border: 1px solid rgba(var(--v-theme-primary), 0.24);
  box-shadow: none;
}

.report-preview-menu-btn {
  min-height: 38px;
  border-color: rgba(var(--v-theme-primary), 0.38);
  box-shadow: none;
}

.report-preview-code {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.13);
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 700;
}

.report-preview-change-btn {
  min-height: 38px;
  box-shadow: none;
}

.report-preview-parameters {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.report-preview-parameters-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-height: 26px;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 12px;
  font-weight: 700;
}

.report-preview-parameter-list {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.report-preview-parameter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 26px;
  padding: 3px 9px;
  border: 1px solid rgba(var(--v-theme-primary), 0.22);
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-on-surface));
  font-size: 12px;
}

.report-preview-parameter-label {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-weight: 700;
}

.report-preview-parameter-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-preview-list {
  width: min(420px, calc(100vw - 32px));
  max-height: 420px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(var(--v-theme-on-surface), 0.16);
}

.report-preview-list-item {
  min-height: 54px;
}

.report-preview-list-title {
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 700px) {
  .report-preview-top,
  .report-preview-navigator,
  .report-preview-parameters {
    align-items: stretch;
    flex-direction: column;
  }

  .report-preview-actions {
    justify-content: space-between;
    width: 100%;
  }

  .report-preview-menu-btn {
    flex: 1 1 auto;
    min-width: 0;
  }

  .report-preview-menu-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .report-preview-change-btn {
    width: 100%;
  }
}
</style>
