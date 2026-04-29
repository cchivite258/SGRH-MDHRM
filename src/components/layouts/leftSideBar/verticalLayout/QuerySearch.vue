<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n(); // ⬅️ importa o método de tradução

const loading = ref<boolean>(false);

const prop = defineProps({
  placeholder: {
    type: String,
    default: ""
  },
  modelValue: {
    type: String,
    default: ""
  }
});

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(query: string) {
    emit("update:modelValue", query);
  }
});
</script>

<template>
  <v-text-field
    v-model="query"
    :loading="loading"
    :placeholder="placeholder || t('t-search-for-menu')"
    hide-details
    variant="solo"
    density="compact"
    class="filter-search text-field-component"
  >
    <template #prepend-inner>
      <i class="ph-magnifying-glass text-muted" />
    </template>
  </v-text-field>
  <v-progress-linear v-show="loading" height="1" color="primary" />
</template>

<style scoped>
.filter-search :deep(.v-field) {
  border: 1px solid rgba(125, 154, 189, 0.22);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: none;
}

.filter-search :deep(.v-field__input) {
  min-height: 42px;
  padding-top: 0;
  padding-bottom: 0;
  color: #d7e5f5;
  font-size: 0.8rem;
  font-weight: 500;
}

.filter-search :deep(.v-field__prepend-inner) {
  color: #96baf0;
  opacity: 1;
}

.filter-search :deep(.v-field input::placeholder) {
  color: #8ba3bf;
  opacity: 1;
}

.filter-search :deep(.v-field--focused) {
  border-color: rgba(79, 156, 247, 0.4);
  box-shadow: 0 0 0 3px rgba(79, 156, 247, 0.12);
}
</style>
