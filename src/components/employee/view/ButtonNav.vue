<script lang="ts" setup>
import { computed } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";

const emit = defineEmits(["update:modelValue"]);
const prop = defineProps({
  modelValue: {
    type: Number,
    default: 1,
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

const tabs = [
  { value: 1, label: 't-general-information' },
  { value: 3, label: 't-salary-review' },
  { value: 4, label: 't-dependents' },
  { value: 5, label: 't-health-plan' },
  { value: 6, label: 't-expenses-per-procedure' }
];
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário do colaborador"
  />
</template>
