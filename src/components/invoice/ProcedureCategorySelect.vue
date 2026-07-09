<script lang="ts" setup>
import { computed, ref } from "vue";
import type { PropType } from "vue";

type ValidationRule = (value: any) => boolean | string;

export type ProcedureCategorySelectItem = {
  value: string | number | undefined;
  label: string;
  categoryName?: string | null;
  searchText?: string;
};

const props = defineProps({
  placeholder: {
    type: String,
    default: "",
  },
  procedureTitle: {
    type: String,
    default: "Procedimento",
  },
  categoryTitle: {
    type: String,
    default: "Categoria",
  },
  items: {
    type: Array as PropType<ProcedureCategorySelectItem[]>,
    default: () => [],
  },
  modelValue: {
    type: [String, Number] as PropType<string | number | undefined>,
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
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "update:error"]);

const error = ref("");

const normalizedItems = computed(() =>
  props.items.map((item) => ({
    ...item,
    label: item.label || "-",
    categoryName: item.categoryName || "-",
    searchText: [item.label, item.categoryName].filter(Boolean).join(" "),
  }))
);

const selected = computed({
  get() {
    return props.modelValue;
  },
  set(value: string | number | undefined) {
    validate(value);
    emit("update:modelValue", value);
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

const computedErrorMessages = computed(() => {
  if (Array.isArray(props.errorMessages)) {
    return props.errorMessages.length > 0 ? props.errorMessages : error.value ? [error.value] : [];
  }

  return props.errorMessages ? [props.errorMessages] : error.value ? [error.value] : [];
});

const onClear = () => {
  emit("update:modelValue", "");
  validate("");
};
</script>

<template>
  <v-autocomplete
    v-model="selected"
    class="menu-select-filter menu-select-autocomplete procedure-category-select"
    variant="solo"
    :items="normalizedItems"
    density="compact"
    clearable
    hide-selected
    :error-messages="computedErrorMessages"
    :rules="rules"
    item-title="searchText"
    item-value="value"
    single-line
    :placeholder="placeholder"
    :disabled="disabled"
    clear-icon="ph-x"
    :item-height="36"
    @click:clear="onClear"
    @blur="validate(selected)"
  >
    <template #prepend-item>
      <div class="procedure-category-select__header">
        <span>{{ procedureTitle }}</span>
        <span>{{ categoryTitle }}</span>
      </div>
      <v-divider />
    </template>

    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" class="procedure-category-select__item">
        <template #title>
          <div class="procedure-category-select__row">
            <span class="procedure-category-select__procedure">{{ item.raw.label }}</span>
            <span class="procedure-category-select__category">{{ item.raw.categoryName || "-" }}</span>
          </div>
        </template>
      </v-list-item>
    </template>

    <template #selection="{ item }">
      <span class="procedure-category-select__selection">{{ item.raw.label }}</span>
    </template>
  </v-autocomplete>
</template>

<style scoped>
:deep(.v-messages__message) {
  font-size: 0.65rem;
  color: #ff5252;
  line-height: 1.2;
  margin-top: -3px;
}

.procedure-category-select__header,
.procedure-category-select__row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(80px, 0.75fr);
  gap: 10px;
  align-items: center;
}

.procedure-category-select__header {
  padding: 6px 16px 5px;
  font-size: 0.58rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.64);
  text-transform: uppercase;
}

.procedure-category-select__item {
  min-height: 36px;
}

.procedure-category-select__header span,
.procedure-category-select__procedure,
.procedure-category-select__category,
.procedure-category-select__selection {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.procedure-category-select__procedure {
  font-weight: 500;
  font-size: 0.78rem;
}

.procedure-category-select__category {
  color: rgba(var(--v-theme-on-surface), 0.64);
  font-size: 0.7rem;
}

.procedure-category-select__selection {
  font-size: 0.82rem;
}
</style>
