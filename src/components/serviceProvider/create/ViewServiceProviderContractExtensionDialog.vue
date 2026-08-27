<script lang="ts" setup>
import { computed, type PropType } from "vue";

import Status from "@/app/common/components/Status.vue";
import ServiceProviderAttachments from "@/components/serviceProvider/create/ServiceProviderAttachments.vue";
import { formateDate } from "@/app/common/dateFormate";
import type { ServiceProviderContractExtensionType } from "@/components/serviceProvider/types";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object as PropType<ServiceProviderContractExtensionType | null>,
    default: null
  },
  serviceProviderId: {
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
  <v-dialog v-model="dialogValue" width="620" scrollable>
    <Card :title="$t('t-contract-addendum')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: calc(90vh - 132px)">
        <v-row>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-contract-previous-end-date') }}</div>
            <div>{{ formateDate(data?.contractStartDate || undefined) || '-' }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-new-contract-end-date') }}</div>
            <div>{{ formateDate(data?.contractEndDate || undefined) || '-' }}</div>
          </v-col>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-status') }}</div>
            <Status :status="data?.status || 'INACTIVE'" />
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

        <ServiceProviderAttachments
          v-if="data?.id"
          class="mt-4"
          :service-provider-id="String(serviceProviderId || '')"
          :service-provider-contract-extension-id="data.id"
          :title="$t('t-addendum-documents')"
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
