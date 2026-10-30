<script lang="ts" setup>
import { PropType, computed } from "vue";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";
import type { PeriodConfigListing } from "@/components/settings/periodConfig/types";
import {
  formatPeriodBound,
  periodConfigTypeOptions,
} from "@/components/settings/periodConfig/listView/utils";

const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<PeriodConfigListing>,
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

const getTypeLabel = (type: string) => {
  const option = periodConfigTypeOptions.find(option => option.value === type);
  return option ? t(option.label) : type;
};

const startLabel = computed(() =>
  formatPeriodBound(t, prop.data.startDayOfMonth, prop.data.startMonthReference)
);

const endLabel = computed(() =>
  formatPeriodBound(
    t,
    prop.data.endDayOfMonth,
    prop.data.endMonthReference,
    Boolean(prop.data.endDayLastDayOfMonth)
  )
);
</script>

<template>
  <v-dialog v-model="dialogValue" width="640" scrollable>
    <Card :title="$t('t-view-period-config')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-type") }}</div>
            <div>{{ data.type ? getTypeLabel(data.type) : "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-status") }}</div>
            <Status :status="data.active ? 'active' : 'INACTIVE'" />
          </v-col>

          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-description") }}</div>
            <div>{{ data.description || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-period-start") }}</div>
            <div>{{ startLabel }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-period-end") }}</div>
            <div>{{ endLabel }}</div>
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
