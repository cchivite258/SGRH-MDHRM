<script lang="ts" setup>
import { computed, type PropType } from "vue";

import Status from "@/app/common/components/Status.vue";
import ContractAttachments from "@/components/institution/create/ContractAttachments.vue";
import { formateDate } from "@/app/common/dateFormate";
import type { CoveragePeriodExtensionType } from "@/components/institution/types";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object as PropType<CoveragePeriodExtensionType | null>,
    default: null
  },
  contractId: {
    type: [String, Number] as PropType<string | number | null>,
    default: null
  }
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="760" scrollable>
    <Card :title="$t('t-period-extension')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: calc(90vh - 132px)">
        <v-row>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-start-date') }}</div>
            <div>{{ formateDate(data?.startDate || undefined) || '-' }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-end-date') }}</div>
            <div>{{ formateDate(data?.endDate || undefined) || '-' }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-status') }}</div>
            <Status :status="data?.status || 'INACTIVE'" />
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-budget-amount') }}</div>
            <div>{{ data?.budgetAmount ?? '-' }}</div>
          </v-col>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-reason') }}</div>
            <div>{{ data?.reason?.name || data?.reasonId || '-' }}</div>
          </v-col>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-notes') }}</div>
            <div>{{ data?.notes || '-' }}</div>
          </v-col>
        </v-row>

        <ContractAttachments
          v-if="data?.id"
          class="mt-4"
          :contract-id="String(contractId || '')"
          :coverage-period-extension-id="data.id"
          :title="$t('t-addendum-documents')"
          document-type="CONTRACT_ADDENDUM"
          :show-document-type="false"
          :allow-attach="false"
        />
      </v-card-text>

      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t('t-close') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
