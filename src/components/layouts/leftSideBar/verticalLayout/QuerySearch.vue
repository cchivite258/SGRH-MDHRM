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
