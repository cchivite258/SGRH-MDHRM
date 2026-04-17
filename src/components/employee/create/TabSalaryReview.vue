<script lang="ts" setup>
import type { PropType } from "vue";

import SalaryReview from "@/components/employee/view/TabSalaryReview.vue";

defineProps({
  employeeId: {
    type: String as PropType<string | null>,
    default: null
  },
  previousStep: {
    type: Number,
    default: 1
  },
  previousLabelKey: {
    type: String,
    default: "t-general-information"
  },
  nextStep: {
    type: Number,
    default: 4
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  (e: "onStepChange", step: number): void;
  (e: "salaryUpdated", value: number): void;
}>();

const onStepChange = (value: number) => {
  emit("onStepChange", value);
};

const onSalaryUpdated = (value: number) => {
  emit("salaryUpdated", value);
};
</script>

<template>
  <SalaryReview
    :employee-id="employeeId"
    :allow-edit="true"
    :previous-step="previousStep"
    :previous-label-key="previousLabelKey"
    :next-step="nextStep"
    :loading="loading"
    @on-step-change="onStepChange"
    @salary-updated="onSalaryUpdated"
  />
</template>
