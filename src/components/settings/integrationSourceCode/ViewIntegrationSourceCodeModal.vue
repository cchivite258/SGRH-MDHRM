<script lang="ts" setup>
import { PropType, computed } from "vue";
import Status from "@/app/common/components/Status.vue";
import type { IntegrationSourceCodeListing } from "@/components/settings/integrationSourceCode/types";

const emit = defineEmits(["update:modelValue"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<IntegrationSourceCodeListing>,
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

const display = (value?: string | null) => value?.trim() || "-";
</script>

<template>
  <v-dialog v-model="dialogValue" width="640" scrollable>
    <Card :title="$t('t-view-integration-source-code')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-payment-order-entry-source-ledger") }}</div>
            <div>{{ display(data.sourceLedger) }}</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-payment-order-entry-source-type") }}</div>
            <div>{{ display(data.sourceType) }}</div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-status") }}</div>
            <Status :status="data.enabled ? 'enabled' : 'disabled'" />
          </v-col>

          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-description") }}</div>
            <div>{{ display(data.description) }}</div>
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
