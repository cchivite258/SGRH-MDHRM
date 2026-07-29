<script lang="ts" setup>
import { PropType, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { CodeConfigListing } from "@/components/settings/codeConfig/types";
import {
  codeConfigSeparatorOptions,
  codeConfigTypeOptions,
} from "@/components/settings/codeConfig/listView/utils";

const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<CodeConfigListing>,
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
  const option = codeConfigTypeOptions.find(option => option.value === type);
  return option ? t(option.label) : type;
};

const getSeparatorLabel = (separator: string) => {
  const option = codeConfigSeparatorOptions.find(option => option.value === separator);
  return option ? t(option.label) : separator;
};

const booleanLabel = (value: boolean) => value ? t("t-yes") : t("t-no");
</script>

<template>
  <v-dialog v-model="dialogValue" width="560" scrollable>
    <Card :title="$t('t-view-contract-code-config')" title-class="py-0" style="overflow: hidden">
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
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-separator") }}</div>
            <div>{{ data.separator ? getSeparatorLabel(data.separator) : "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-prefix") }}</div>
            <div>{{ data.prefix || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-suffix") }}</div>
            <div>{{ data.suffix || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-sequence-length") }}</div>
            <div>{{ data.sequenceLength ?? "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-pattern") }}</div>
            <div>{{ data.pattern || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-includes-year") }}</div>
            <div>{{ booleanLabel(data.includesYear) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-includes-month") }}</div>
            <div>{{ booleanLabel(data.includesMonth) }}</div>
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
