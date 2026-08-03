<script lang="ts" setup>
import { computed } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";
import { EMPLOYEE_FORM_TABS, getAllowedFormTabs } from "@/app/permissions/formTabs";
import { usePermissions } from "@/composables/usePermissions";

const emit = defineEmits(["update:modelValue"]);
const prop = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  }
});

const { canAny } = usePermissions();

const step = computed({
  get() {
    return prop.modelValue;
  },
  set(step: string | number) {
    emit("update:modelValue", Number(step));
  },
});

const tabs = computed(() => getAllowedFormTabs(EMPLOYEE_FORM_TABS, canAny));
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação do formulário do colaborador"
  />
</template>
