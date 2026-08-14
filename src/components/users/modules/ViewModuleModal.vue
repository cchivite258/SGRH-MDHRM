<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";
import type { ModuleListingType } from "@/components/users/modules/types";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ModuleListingType>,
    required: true,
  },
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="640" scrollable>
    <Card :title="$t('t-view-module')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" class="text-right">
            <Status :status="data.enabled ? 'active' : 'unactive'" />
          </v-col>
          <v-col cols="12" lg="6" class="mt-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-name") }}</div>
            <div>{{ data.name || "-" }}</div>
          </v-col>
          <v-col cols="12" lg="6" class="mt-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-removable") }}</div>
            <div>{{ data.removable ? t("t-yes") : t("t-no") }}</div>
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
