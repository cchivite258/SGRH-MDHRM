<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  serviceProviderId: {
    type: String as PropType<string | null>,
    default: null
  },
  basicDataValidated: {
    type: Boolean,
    default: false
  },
  contractDataValidated: {
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
  if (props.serviceProviderId) return false;
  if (tabNumber === 2) return !props.basicDataValidated;
  if (tabNumber === 3) return !props.basicDataValidated || !props.contractDataValidated;
  return false;
};

const tabs = computed(() => [
  { value: 1, label: "t-general-information", disabled: isTabDisabled(1) },
  { value: 2, label: "t-contract", disabled: isTabDisabled(2) },
  { value: 3, label: "t-contacts-service-provider", disabled: isTabDisabled(3) }
]);
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário de provedor de serviço"
  />
</template>
