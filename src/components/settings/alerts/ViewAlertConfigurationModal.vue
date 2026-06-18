<script lang="ts" setup>
import { PropType, computed } from "vue";
import Status from "@/app/common/components/Status.vue";
import type { AlertConfigurationListing } from "@/components/settings/alerts/types";
import { alertTypeOptions } from "@/components/settings/alerts/listView/utils";
import { useI18n } from "vue-i18n";
import { formateDate } from "@/app/common/dateFormate";

const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<AlertConfigurationListing>,
    required: true,
  },
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const formatDate = (value?: string | null) => {
  return formateDate(value || undefined) || "-";
};

const getAlertTypeLabel = (type: string) => {
  const option = alertTypeOptions.find(option => option.value === type);
  return option ? t(option.label) : type;
};

const executionStatusColor = (status?: string | null) => {
  if (status === "SCHEDULED") return "warning";
  if (status === "SUCCESS") return "success";
  if (status === "FAILURE") return "danger";
  if (status === "RUNNING") return "info";
  return "secondary";
};

const getExecutionStatusLabel = (status?: string | null) => {
  if (!status) return "-";

  const statusLabels: Record<string, string> = {
    SCHEDULED: t("t-scheduled-job-status-scheduled"),
    SUCCESS: t("t-cron-execution-status-success"),
    FAILURE: t("t-cron-execution-status-failure"),
    RUNNING: t("t-scheduled-job-status-running"),
  };

  return statusLabels[status] ?? status;
};

const getRepeatUnitLabel = (unit?: string | null) => {
  if (!unit) return "";

  const unitLabels: Record<string, string> = {
    MINUTES: t("t-repeat-unit-minutes"),
    HOURS: t("t-repeat-unit-hours"),
    DAYS: t("t-repeat-unit-days"),
    WEEKS: t("t-repeat-unit-weeks"),
    MONTHS: t("t-repeat-unit-months"),
  };

  return unitLabels[unit] ?? unit;
};

const getScheduleLabel = () => {
  if (prop.data.repeatValue && prop.data.repeatUnit) {
    return `${prop.data.repeatValue} ${getRepeatUnitLabel(prop.data.repeatUnit)}`;
  }

  return prop.data.cronExpression || "-";
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="560" scrollable>
    <Card :title="$t('t-view-alert')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" class="text-right">
            <Status :status="data.enabled ? 'enabled' : 'disabled'" />
          </v-col>

          <v-col cols="12" md="6" class="mt-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-name") }}</div>
            <div>{{ data.name || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6" class="mt-md-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-type") }}</div>
            <div>{{ data.type ? getAlertTypeLabel(data.type) : "-" }}</div>
          </v-col>

          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-description") }}</div>
            <div>{{ data.description || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-cron-expression") }}</div>
            <div>{{ getScheduleLabel() }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-max-retry-count") }}</div>
            <div>{{ data.maxRetryCount ?? "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-retry-count") }}</div>
            <div>{{ data.retryCount ?? "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-last-execution-status") }}</div>
            <v-chip
              v-if="data.lastStatus"
              density="compact"
              label
              variant="tonal"
              :color="executionStatusColor(data.lastStatus)"
            >
              <span class="status-chip">{{ getExecutionStatusLabel(data.lastStatus) }}</span>
            </v-chip>
            <span v-else>-</span>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-last-execution") }}</div>
            <div>{{ formatDate(data.lastExecution) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-next-execution") }}</div>
            <div>{{ formatDate(data.nextExecution) }}</div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
