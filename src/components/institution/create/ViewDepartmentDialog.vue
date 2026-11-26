<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { DepartmentListingType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]); 

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<DepartmentListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      name: "",
      description: "",
      costCenterAccount: "",
      company: ""
    })
  },
});

const activeTab = ref("general");

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="640" >
    <Card :title="$t('t-view-department')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text>
        <v-tabs v-model="activeTab" color="primary" density="comfortable">
          <v-tab value="general">{{ $t('t-general-information') }}</v-tab>
          <v-tab value="integration">{{ $t('t-integration') }}</v-tab>
        </v-tabs>
        <v-window v-model="activeTab" class="department-window mt-4">
          <v-window-item value="general">
            <v-row class="mx-0">
              <v-col cols="12" class="text-right">
                <Status :status="props.data?.enabled ? 'enabled' : 'disabled'" />
              </v-col>
            </v-row>
            <v-row class="mx-0 mt-n6">
              <v-col cols="12">
                <div class="font-weight-bold text-caption mb-1">{{ $t('t-name') }}</div>
                <div>{{ props.data?.name || '-' }}</div>
              </v-col>
            </v-row>
            <v-row class="mx-0 mt-3">
              <v-col cols="12">
                <div class="font-weight-bold text-caption mb-1">{{ $t('t-description') }}</div>
                <div>{{ props.data?.description || '-' }}</div>
              </v-col>
            </v-row>
          </v-window-item>
          <v-window-item value="integration">
            <v-row class="mx-0">
              <v-col cols="12">
                <div class="font-weight-bold text-caption mb-1">{{ $t('t-cost-center-account') }}</div>
                <div>{{ props.data?.costCenterAccount || '-' }}</div>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>

<style scoped>
.department-window {
  overflow: visible;
}

.department-window :deep(.v-window__container) {
  overflow: visible;
}
</style>
