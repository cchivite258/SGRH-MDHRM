<script setup lang="ts">
import { ref, watch } from "vue";
import { formatCurrency } from "@/app/common/currencyFormat";

interface Props {
  modelValue: number | string | null;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

// estado interno do input (string para suportar formatação)
const displayValue = ref(props.modelValue ? formatCurrency(props.modelValue) : "");

// sempre que o valor externo mudar, atualizamos a exibição
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== null && newVal !== undefined && newVal !== "") {
      displayValue.value = formatCurrency(newVal);
    } else {
      displayValue.value = "";
    }
  }
);

// handler quando o usuário digita
function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;

  // remove tudo que não for número ou vírgula/ponto
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");

  const numericValue = parseFloat(cleaned);

  // atualiza v-model
  if (!isNaN(numericValue)) {
    emit("update:modelValue", numericValue);
    displayValue.value = formatCurrency(numericValue);
  } else {
    emit("update:modelValue", null);
    displayValue.value = "";
  }
}
</script>

<template>
  <v-text-field
    v-model="displayValue"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    type="text"
    @input="onInput"
    hide-details
    class="mb-2"
  />
</template>
