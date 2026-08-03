<script lang="ts" setup>
import { computed } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";
import { CONTRACT_FORM_TABS, getAllowedFormTabs } from "@/app/permissions/formTabs";
import { usePermissions } from "@/composables/usePermissions";

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

const { canAny } = usePermissions();

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

const tabs = computed(() =>
  getAllowedFormTabs(CONTRACT_FORM_TABS, canAny).map((tab) => ({
    ...tab,
    disabled: isTabDisabled(tab.value),
  }))
);
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário de contrato"
  />
</template>
