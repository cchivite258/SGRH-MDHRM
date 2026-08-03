<script lang="ts" setup>
import { computed } from "vue";
import FormTabs from "@/app/common/components/FormTabs.vue";
import { SERVICE_PROVIDER_FORM_TABS, getAllowedFormTabs } from "@/app/permissions/formTabs";
import { usePermissions } from "@/composables/usePermissions";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
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

const tabs = computed(() => getAllowedFormTabs(SERVICE_PROVIDER_FORM_TABS, canAny));
</script>

<template>
  <FormTabs
    v-model="step"
    :tabs="tabs"
    aria-label="Navegação da consulta de provedor de serviço"
  />
</template>
