<script lang="ts" setup>
import { PropType, computed } from "vue";
import { CoveragePeriodInsertType, CoveragePeriodListingType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { formateDate } from "@/app/common/dateFormate";
import Status from "@/app/common/components/Status.vue"; 

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<CoveragePeriodInsertType | CoveragePeriodListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      name: "",
      startDate: new Date() ,
      endDate: new Date(),
      company: "",
      enabled: true
    })
  },
});

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
  <v-dialog v-model="dialogValue" width="500" >
    <Card :title="$t('t-view-coverage-period')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" /> 
      </template>

      <v-divider />

      <v-card-text>
        <v-row class="">
          <v-col cols="12" lg="12" class="text-right">
            <Status :status="props.data?.enabled ? 'enabled' : 'disabled'" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-name') }}</div>
            <div>{{ props.data?.name || '-' }}</div>
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-start-date') }}</div>
            <div>{{ props.data?.startDate ? formateDate(props.data.startDate) : '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-end-date') }}</div>
            <div>{{ props.data?.endDate ? formateDate(props.data.endDate) : '-' }}</div>
          </v-col>
        </v-row>
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
