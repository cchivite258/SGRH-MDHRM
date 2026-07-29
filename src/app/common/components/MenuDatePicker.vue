<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: [Date, String] as PropType<Date | string | null | undefined>,
    default: undefined
  },
  rules: {
    type: Array as PropType<Array<(value: any) => boolean | string>>,
    default: () => []
  },
  errorMessages: {
    type: [String, Array],
    default: ""
  },
  placeholder: {
    type: String,
    default: "Selecione a data"
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue", "update:error", "blur"]);

const menuOpen = ref(false);
const selectedDate = ref<Date | null>(null);
const internalError = ref("");
const isTouched = ref(false);

const externalError = computed(() => {
  if (Array.isArray(props.errorMessages)) return props.errorMessages[0] || "";
  return props.errorMessages || "";
});

const displayedError = computed(() => internalError.value || externalError.value);

const parseDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const normalizedValue = value.includes("T") ? value.split("T")[0] : value;
  const parsedDate = new Date(`${normalizedValue}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const toInputDateValue = (value: Date | string | null | undefined) => {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const displayValue = computed(() => {
  if (!selectedDate.value) return "";

  const day = String(selectedDate.value.getDate()).padStart(2, "0");
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
  const year = selectedDate.value.getFullYear();
  return `${day}/${month}/${year}`;
});

watch(() => props.modelValue, (value) => {
  selectedDate.value = parseDate(value);
}, { immediate: true });

const validate = (value: Date | null = selectedDate.value) => {
  internalError.value = "";

  for (const rule of props.rules) {
    const result = rule(value);
    if (typeof result === "string") {
      internalError.value = result;
      emit("update:error", result);
      return false;
    }
  }

  emit("update:error", "");
  return true;
};

const openMenu = () => {
  if (props.disabled) return;
  menuOpen.value = true;
};

const closeMenu = () => {
  menuOpen.value = false;
  isTouched.value = true;
  validate();
  emit("blur");
};

const clearDate = () => {
  if (props.disabled) return;

  selectedDate.value = null;
  emit("update:modelValue", "");
  menuOpen.value = false;
  isTouched.value = true;
  validate(null);
};

const selectDate = (value: Date | string | null) => {
  selectedDate.value = parseDate(value);
  emit("update:modelValue", toInputDateValue(selectedDate.value));
  isTouched.value = true;
  validate(selectedDate.value);
  menuOpen.value = false;
};

defineExpose({ validate });
</script>

<template>
  <div class="menu-date-picker">
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom end"
      origin="top end"
      offset="4"
      scroll-strategy="reposition"
      @update:model-value="(value) => !value && closeMenu()"
    >
      <template #activator="{ props: menuProps }">
        <button
          v-bind="menuProps"
          type="button"
          class="menu-date-picker__field"
          :class="{
            'menu-date-picker__field--error': displayedError,
            'menu-date-picker__field--disabled': disabled
          }"
          :disabled="disabled"
          @click.stop="openMenu"
        >
          <i class="ph-calendar menu-date-picker__icon" />
          <span
            class="menu-date-picker__value"
            :class="{ 'menu-date-picker__value--placeholder': !displayValue }"
          >
            {{ displayValue || placeholder }}
          </span>
          <i
            v-if="displayValue && !disabled"
            class="ph-x menu-date-picker__clear"
            role="button"
            tabindex="0"
            aria-label="Limpar data"
            @click.stop="clearDate"
            @keydown.enter.stop.prevent="clearDate"
            @keydown.space.stop.prevent="clearDate"
          />
        </button>
      </template>

      <v-card class="menu-date-picker__menu" elevation="8">
        <v-date-picker
          v-model="selectedDate"
          color="primary"
          hide-header
          show-adjacent-months
          @update:model-value="selectDate"
        />
      </v-card>
    </v-menu>

    <div v-if="displayedError" class="menu-date-picker__error">
      {{ displayedError }}
    </div>
  </div>
</template>

<style scoped>
.menu-date-picker {
  position: relative;
  width: 100%;
}

.menu-date-picker__field {
  align-items: center;
  background-color: var(--tb-secondary-bg);
  border: thin solid var(--tb-border-color);
  border-radius: 3px;
  color: var(--tb-body-color);
  cursor: pointer;
  display: flex;
  font-size: 12px;
  height: 2.63rem;
  padding: 0 12px;
  text-align: left;
  width: 100%;
}

.menu-date-picker__field--error {
  border-color: #ff5252;
}

.menu-date-picker__field--disabled {
  background-color: #f5f5f5;
  border-color: #d3d3d3;
  color: #eef0f7;
  cursor: not-allowed;
  opacity: 0.4;
}

.menu-date-picker__icon {
  color: #6c757d;
  font-size: 16px;
  margin-right: 8px;
}

.menu-date-picker__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-date-picker__value--placeholder {
  color: #9aa0ac;
}

.menu-date-picker__clear {
  align-items: center;
  border-radius: 50%;
  color: #6c757d;
  display: inline-flex;
  font-size: 14px;
  height: 22px;
  justify-content: center;
  margin-left: 8px;
  width: 22px;
}

.menu-date-picker__clear:hover {
  background-color: rgba(108, 117, 125, 0.12);
  color: var(--tb-body-color);
}

.menu-date-picker__menu {
  overflow: hidden;
}

.menu-date-picker__menu :deep(.v-picker-title),
.menu-date-picker__menu :deep(.v-date-picker-header) {
  display: none;
}

.menu-date-picker__error {
  color: #ff5252;
  font-size: 0.65rem;
  margin-left: 15px;
  margin-top: 4px;
}
</style>
