<script lang="ts" setup>
import { computed } from "vue";
import type { IntegrationConnectionTestResult } from "@/components/settings/integration/types";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps<{
  modelValue: boolean;
  result: IntegrationConnectionTestResult | null;
}>();

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const display = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const formatDuration = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  if (value < 1000) return `${value} ms`;

  return `${(value / 1000).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} s`;
};

const formatTestedAt = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="520">
    <Card :title="$t('t-integration-connection-result')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text v-if="result" class="text-center">
        <v-avatar
          size="72"
          :color="result.connected ? 'success' : 'danger'"
          variant="tonal"
          class="mt-2"
        >
          <i :class="result.connected ? 'ph-plugs-connected' : 'ph-plugs'" style="font-size: 30px" />
        </v-avatar>

        <div class="text-h6 font-weight-bold mt-4">
          {{ result.connected ? $t("t-integration-connection-success") : $t("t-integration-connection-failed") }}
        </div>
        <p v-if="result.message" class="text-medium-emphasis mt-2 mb-0">
          {{ result.message }}
        </p>

        <v-row class="text-start mt-6">
          <v-col cols="12" sm="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-code") }}</div>
            <div>{{ display(result.code) }}</div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-connection-duration") }}</div>
            <div>{{ formatDuration(result.durationMs) }}</div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-connection-tested-at") }}</div>
            <div>{{ formatTestedAt(result.testedAt) }}</div>
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
