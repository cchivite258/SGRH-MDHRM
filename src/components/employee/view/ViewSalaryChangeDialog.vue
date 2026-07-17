<script lang="ts" setup>
import { computed, type PropType } from "vue";

import { formatCurrency } from "@/app/common/currencyFormat";
import { formateDate } from "@/app/common/dateFormate";
import Status from "@/app/common/components/Status.vue";
import type { EmployeeBaseSalaryTrackType } from "@/components/employee/types";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object as PropType<EmployeeBaseSalaryTrackType | null>,
    default: null
  },
  reasonName: {
    type: String,
    default: ""
  }
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  }
});

const startDate = computed(() => props.data?.startDate || props.data?.stardDate);
</script>

<template>
  <v-dialog v-model="dialogValue" width="520">
    <Card :title="$t('t-salary-change-history')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-base-salary') }}</div>
            <div>{{ formatCurrency(data?.baseSalary || 0) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-status') }}</div>
            <Status :status="data?.status || 'INACTIVE'" />
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-start-date') }}</div>
            <div>{{ formateDate(startDate) || '-' }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-end-date') }}</div>
            <div>{{ formateDate(data?.endDate) || '-' }}</div>
          </v-col>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-reason') }}</div>
            <div>{{ reasonName || data?.reason?.name || '-' }}</div>
          </v-col>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-notes') }}</div>
            <div>{{ data?.notes || '-' }}</div>
          </v-col>
        </v-row>
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
