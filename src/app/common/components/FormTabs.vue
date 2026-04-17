<script lang="ts" setup>
import { computed, type PropType } from "vue";

type FormTabValue = string | number;

type FormTab = {
  value: FormTabValue;
  label: string;
  disabled?: boolean;
};

const emit = defineEmits<{
  (event: "update:modelValue", value: FormTabValue): void;
}>();

const props = defineProps({
  modelValue: {
    type: [String, Number] as PropType<FormTabValue>,
    required: true
  },
  tabs: {
    type: Array as PropType<FormTab[]>,
    required: true
  },
  ariaLabel: {
    type: String,
    default: "Navegação do formulário"
  }
});

const activeValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: FormTabValue) {
    emit("update:modelValue", value);
  }
});
</script>

<template>
  <div class="form-tabs" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="form-tabs__item"
      :class="{ 'is-active': activeValue === tab.value }"
      :disabled="tab.disabled"
      role="tab"
      :aria-selected="activeValue === tab.value"
      @click="activeValue = tab.value"
    >
      {{ $t(tab.label) }}
    </button>
  </div>
</template>

<style scoped>
.form-tabs {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 8px 18px;
  overflow: visible;
  border-bottom: 1px solid #dbe4ef;
  padding: 0 2px;
}

.form-tabs__item {
  position: relative;
  flex: 0 0 auto;
  min-height: 36px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #475467;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.25;
  padding: 0 0 10px;
  transition: color 0.2s ease, opacity 0.2s ease;
  white-space: nowrap;
}

.form-tabs__item::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 999px 999px 0 0;
  background: #6f9fcb;
  content: "";
  opacity: 0;
  transform: scaleX(0.75);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.form-tabs__item.is-active {
  color: #6f9fcb;
}

.form-tabs__item.is-active::after {
  opacity: 1;
  transform: scaleX(1);
}

.form-tabs__item:hover:not(:disabled),
.form-tabs__item:focus-visible:not(:disabled) {
  color: #3478b7;
}

.form-tabs__item:focus-visible {
  outline: 2px solid rgba(111, 159, 203, 0.35);
  outline-offset: 3px;
}

.form-tabs__item:disabled {
  color: #98a2b3;
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 767px) {
  .form-tabs {
    gap: 8px 14px;
  }

  .form-tabs__item {
    min-height: 34px;
    font-size: 0.76rem;
    padding-bottom: 9px;
  }
}
</style>
