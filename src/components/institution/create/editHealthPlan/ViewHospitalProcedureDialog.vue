<script lang="ts" setup>
import { PropType, computed } from "vue";
import { HospitalProcedureListingType, HospitalProcedureInsertType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
  type: Object as PropType<HospitalProcedureListingType | HospitalProcedureInsertType | null>,
  required: false,
  default: () => ({
    id: undefined,
    fixedAmount: 0,
    percentage: 0,
    limitTypeDefinition: "",
    hospitalProcedureType: undefined,
    companyHealthPlan: undefined,
    company: undefined
  })
},
});

// Função para obter o label do tipo de limite
const getLimitTypeLabel = (value: string) => {
  const options = [
    { label: t('t-fixed-amount'), value: "FIXED_AMOUNT" },
    { label: t('t-percentage'), value: "PERCENTAGE" }
  ];
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

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
    <Card :title="$t('t-view-hospital-procedure')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-hospital-procedure-type') }}</div>
            <div>{{ props.data?.hospitalProcedureType?.name || '-' }}</div>
          </v-col>
        </v-row>

        <v-row class="mt-3">
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-limit-type-definition') }}</div>
            <div>{{ getLimitTypeLabel(props.data?.limitTypeDefinition || '') || '-' }}</div>
          </v-col>
        </v-row>

        <v-row class="mt-3">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-fixed-amount') }}</div>
            <div>{{ props.data?.fixedAmount || '0' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-percentage') }}</div>
            <div>{{ props.data?.percentage || '0' }}</div>
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