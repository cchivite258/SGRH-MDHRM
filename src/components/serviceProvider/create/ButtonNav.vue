<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";
import { SERVICE_PROVIDER_FORM_TABS, getAllowedFormTabs } from "@/app/permissions/formTabs";
import { usePermissions } from "@/composables/usePermissions";

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
  if (props.serviceProviderId) return false;
  if (tabNumber === 2) return !props.basicDataValidated;
  if (tabNumber === 3) return !props.basicDataValidated || !props.contractDataValidated;
  return false;
};

const tabs = computed(() =>
  getAllowedFormTabs(SERVICE_PROVIDER_FORM_TABS, canAny).map((tab) => ({
    ...tab,
    disabled: isTabDisabled(tab.value),
  }))
);
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário de provedor de serviço"
  />
</template>
