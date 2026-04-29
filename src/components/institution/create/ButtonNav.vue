<script lang="ts" setup>
import { computed } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  institutionId: {
    type: String,
    default: null
  },
  basicDataValidated: {
    type: Boolean,
    default: false
  }
});

const step = computed({
  get() {
    return props.modelValue;
  },
  set(step: string | number) {
    emit("update:modelValue", Number(step));
  }
});

const isTabDisabled = (tabNumber: number) => {
  if (props.institutionId || props.basicDataValidated) return false;
  return tabNumber > 1;
};

const tabs = computed(() => [
  { value: 1, label: "t-institution-information", disabled: isTabDisabled(1) },
  { value: 2, label: "t-periods", disabled: isTabDisabled(2) },
  { value: 3, label: "t-health-plan", disabled: isTabDisabled(3) },
  { value: 4, label: "t-organizational-structure", disabled: isTabDisabled(4) },
  { value: 5, label: "t-contact", disabled: isTabDisabled(5) },
  { value: 6, label: "t-service-providers", disabled: isTabDisabled(6) },
  { value: 7, label: "t-employees", disabled: isTabDisabled(7) }
]);
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário de contrato"
  />
</template>
