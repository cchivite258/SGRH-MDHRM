<script lang="ts" setup>
import { onMounted, PropType, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";
import { integrationSourceCodeService } from "@/app/http/httpServiceProvider";
import type { IntegrationDefinitionListing } from "@/components/settings/integration/types";
import { integrationUsageOptions } from "@/components/settings/integration/listView/utils";
import { integrationSourceCodeLabel } from "@/components/settings/integrationSourceCode/listView/utils";
import type { IntegrationSourceCodeId, IntegrationSourceCodeListing } from "@/components/settings/integrationSourceCode/types";

const emit = defineEmits(["update:modelValue", "onTestConnection"]);
const { t } = useI18n();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<IntegrationDefinitionListing>,
    required: true,
  },
  canTest: {
    type: Boolean,
    default: false,
  },
  testing: {
    type: Boolean,
    default: false,
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

const display = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const sourceCodes = ref<IntegrationSourceCodeListing[]>([]);

const usageLabel = (usage: string) => {
  const option = integrationUsageOptions.find(item => item.value === usage);
  return option ? t(option.label) : usage;
};

const sourceCodeLabelFor = (id?: IntegrationSourceCodeId | null) => {
  if (id === null || id === undefined || id === "") return "";
  const code = sourceCodes.value.find(item => String(item.id) === String(id));
  return code ? integrationSourceCodeLabel(code) : String(id);
};

onMounted(async () => {
  try {
    sourceCodes.value = await integrationSourceCodeService.getAvailableIntegrationSourceCodes();
  } catch {
    sourceCodes.value = [];
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="760" scrollable>
    <Card :title="$t('t-view-integration')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" md="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-code") }}</div>
            <div>{{ display(data.code) }}</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-application") }}</div>
            <div>{{ display(data.application) }}</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-status") }}</div>
            <Status :status="data.active ? 'active' : 'INACTIVE'" />
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-name") }}</div>
            <div>{{ display(data.name) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-company-code") }}</div>
            <div>{{ display(data.companyCode) }}</div>
          </v-col>

          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-description") }}</div>
            <div>{{ display(data.description) }}</div>
          </v-col>

          <v-col cols="12" md="8">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-base-url") }}</div>
            <div>{{ display(data.baseUrl) }}</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-api-version") }}</div>
            <div>{{ display(data.apiVersion) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-tenant") }}</div>
            <div>{{ display(data.tenant) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-integration-timeout") }}</div>
            <div>{{ display(data.timeoutSeconds) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-username") }}</div>
            <div>{{ display(data.username) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-password") }}</div>
            <div>{{ data.passwordConfigured ? $t("t-yes") : $t("t-no") }}</div>
          </v-col>

          <v-col v-if="data.usages?.length" cols="12">
            <div class="font-weight-bold text-caption mb-2">{{ $t("t-integration-usages") }}</div>
            <div v-for="usage in data.usages" :key="usage.id" class="integration-usage">
              <span>{{ usageLabel(usage.usage) }}</span>
              <span v-if="sourceCodeLabelFor(usage.integrationSourceCodeId)" class="integration-usage__meta">
                {{ sourceCodeLabelFor(usage.integrationSourceCodeId) }}
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />
      <v-card-actions class="d-flex" :class="canTest ? 'justify-space-between' : 'justify-end'">
        <v-btn
          v-if="canTest"
          color="primary"
          variant="tonal"
          :loading="testing"
          :disabled="testing"
          @click="emit('onTestConnection')"
        >
          <i class="ph-plugs-connected me-1" /> {{ $t("t-test-integration-connection") }}
        </v-btn>
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>

<style scoped>
.integration-usage {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 8px 0;
}

.integration-usage + .integration-usage {
  border-top: 1px solid #eef2f7;
}

.integration-usage__meta {
  color: #64748b;
  font-size: 0.82rem;
}
</style>
