<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  modelValue: [Date, String, Array],
  rules: {
    type: Array as PropType<Array<(value: any) => boolean | string>>,
    default: () => [],
  },
  errorMessages: {
    type: [String, Array],
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Selecione a data'
  },
  format: {
    type: String,
    default: 'dd/MM/yyyy'
  },
  disabled: {  
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'update:error', 'blur']);

const internalError = ref('');
const internalValue = ref<Date | null>(null);
const isTouched = ref(false);

// Converter valor inicial para Date
const parseDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  return null;
};

// Atualizar valor interno quando o prop muda
watch(() => props.modelValue, (newVal) => {
  internalValue.value = parseDate(newVal);
}, { immediate: true });

// Função de validação
const validate = (value: any = internalValue.value) => {
  internalError.value = '';
  
  if (!props.rules || props.rules.length === 0) return true;

  for (const rule of props.rules) {
    const result = rule(value);
    if (typeof result === 'string') {
      internalError.value = result;
      emit('update:error', result);
      return false;
    }
  }

  emit('update:error', '');
  return true;
};

const handleUpdate = (value: Date | null) => {
  internalValue.value = value;
  const emitValue = value ? value.toISOString() : null;
  emit('update:modelValue', emitValue);
  
  if (isTouched.value) {
    validate(value);
  }
};

const handleBlur = () => {
  isTouched.value = true;
  validate();
  emit('blur');
};

// Expor a função validate para o componente pai
defineExpose({
  validate
});
</script>

<template>
  <div class="validated-datetime-picker">
    <VueDatePicker
      v-model="internalValue"
      :format="format"
      :placeholder="placeholder"
      :class="[{ 'error-border': internalError || errorMessages }, { 'is-disabled': disabled }]"
      :enable-time-picker="false"
      :disabled="disabled"
      auto-apply
      @update:model-value="handleUpdate"
      @blur="handleBlur"
    >
      
    </VueDatePicker>
    
    <div v-if="internalError || errorMessages" class="error-message">
      {{ internalError || errorMessages }}
    </div>
  </div>
</template>

<style scoped>
.validated-datetime-picker {
  position: relative;
  width: 100%;
}

.error-message {
  color: #ff5252;
  font-size: 0.65rem;
  margin-top: 4px;
  margin-left: 15px;
}

.error-border :deep(.dp__input) {
  border-color: #ff5252;
}

.is-disabled :deep(.dp__input) {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.4;
  border-color: #d3d3d3;
  color: #EEF0F7;
}

</style>