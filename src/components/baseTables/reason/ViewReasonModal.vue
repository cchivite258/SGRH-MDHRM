<script lang="ts" setup>
import { PropType, computed } from "vue";
import Status from "@/app/common/components/Status.vue";
import type { ReasonListing } from "@/components/baseTables/reason/types";
import { reasonTypeOptions } from "@/components/baseTables/reason/listView/utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ReasonListing>,
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

const typeLabel = computed(() => {
  const option = reasonTypeOptions.find(item => item.value === prop.data.type);
  return option ? t(option.label) : prop.data.type;
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="560" scrollable>
    <Card :title="$t('t-view-reason')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" class="text-right">
            <Status :status="data.enabled ? 'enabled' : 'disabled'" />
          </v-col>
          <v-col cols="12" lg="6" class="mt-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-name") }}</div>
            <div>{{ data.name || "-" }}</div>
          </v-col>
          <v-col cols="12" lg="6" class="mt-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-type") }}</div>
            <div>{{ typeLabel || "-" }}</div>
          </v-col>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-description") }}</div>
            <div>{{ data.description || "-" }}</div>
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

