<script lang="ts" setup>
import { PropType, computed } from "vue";
import { BudgetInsertType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";
import { amountFormate } from "@/app/common/amountFormate";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<BudgetInsertType | null>,
    required: false,
    default: () => ({
      id: undefined,
      name: "",
      budgetAmount: 0,
      coveragePeriod: undefined,
      enabled: true,
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
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card :title="$t('t-view-budget')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 50vh">
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
        <v-row class="mt-3">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-budget-amount') }}</div>
            <div>{{ amountFormate(props.data?.budgetAmount) || '-' }}</div>
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
