<script lang="ts" setup>
import { computed } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";

const emit = defineEmits(["update:modelValue"]);
const prop = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  employeeId: {
    type: [String],
    default: null
  },
  basicDataValidated: {
    type: Boolean,
    default: false
  }
});

const step = computed({
  get() {
    return prop.modelValue;
  },
  set(step: string | number) {
    emit("update:modelValue", Number(step));
  },
});

const isTabDisabled = (tabNumber: number) => {
  if (prop.employeeId) return false;
  return tabNumber > 1 && !prop.basicDataValidated;
};

const tabs = computed(() => [
  { value: 1, label: 't-general-information', disabled: isTabDisabled(1) },
  { value: 3, label: 't-salary-review', disabled: isTabDisabled(3) },
  { value: 4, label: 't-dependents', disabled: isTabDisabled(4) },
  { value: 5, label: 't-health-plan', disabled: isTabDisabled(5) },
  { value: 6, label: 't-expenses-per-procedure', disabled: isTabDisabled(6) }
]);
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário do colaborador"
  />
</template>
