<script lang="ts" setup>
import { computed } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  serviceProviderId: {
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
  if (props.serviceProviderId) return false;
  return tabNumber > 1 && !props.basicDataValidated;
};

const tabs = computed(() => [
  { value: 1, label: "t-general-information", disabled: isTabDisabled(1) },
  { value: 2, label: "t-contacts-service-provider", disabled: isTabDisabled(2) }
]);
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário de provedor de serviço"
  />
</template>
