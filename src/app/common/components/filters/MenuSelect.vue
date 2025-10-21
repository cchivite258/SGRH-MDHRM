<script lang="ts" setup>
import { computed, ref } from "vue";
import type { PropType } from 'vue';


// Define o tipo para as regras de validação
type ValidationRule = (value: any) => boolean | string;


const props = defineProps({
  placeholder: {
    type: String,
    default: "",
  },
  items: {
    type: Array,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [String, Array, Number, Boolean, Date] as PropType<string | number | any[] | boolean | Date>,
    default: "",
  },
  rules: {
    type: Array as PropType<ValidationRule[]>,
    default: () => [],
  },
  errorMessages: {
    type: [String, Array] as PropType<string | string[]>,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "update:error"]);

const error = ref("");

const selected = computed({
  get() {
    return props.modelValue;
  },
  set(selected: string | any) {
    validate(selected);
    emit("update:modelValue", selected);
  },
});

const validate = (value: any) => {
  if (!props.rules || props.rules.length === 0) return true;

  for (const rule of props.rules) {
    const result = rule(value);
    if (typeof result === "string") {
      error.value = result;
      emit("update:error", result);
      return false;
    }
  }

  error.value = "";
  emit("update:error", "");
  return true;
};

const errorMessages = computed(() => {
  if (Array.isArray(props.errorMessages)) {
    return props.errorMessages.length > 0 ? props.errorMessages : error.value ? [error.value] : [];
  }
  return props.errorMessages || error.value ? [error.value] : [];
});

const onClear = () => {
  emit("update:modelValue", "");
  validate("");
};
</script>

<template>
  <v-autocomplete
    class="menu-select-filter menu-select-autocomplete"
    v-model="selected"
    variant="solo"
    :items="items"
    density="compact"
    clearable
    hide-selected
    :error-messages="errorMessages"
    :rules="rules"
    item-title="label"
    item-value="value"
    closable-chips
    single-line
    :chips="multiple"
    :multiple="multiple"
    :placeholder="placeholder"
    clear-icon="ph-x"
    :item-height="30"
    @click:clear="onClear"
    @blur="validate(selected)"
  >
    
  </v-autocomplete>
</template>

<style scoped>
/* Estilo para as mensagens de validação */
:deep(.v-messages__message) {
  font-size: 0.65rem;
  color: #ff5252;
  line-height: 1.2;
  margin-top: -3px;
}

.v-autocomplete .v-field__input {
  font-size: 16px !important;
}

</style>