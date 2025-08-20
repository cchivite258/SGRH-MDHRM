<script lang="ts" setup>
import { computed, ref } from "vue";

const emit = defineEmits(["update:modelValue"]);

const loading = ref<boolean>(false);
const prop = defineProps({
  placeholder: {
    type: String,
    default: "Search..."
  },
  modelValue: {
    type: String,
    default: ""
  }
});

const timeInterval = ref<any>(null);

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(query: string) {
    // loading.value = true;
    // if (timeInterval.value) {
    //   clearTimeout(timeInterval.value);
    // }
    emit("update:modelValue", query);
    // timeInterval.value = setTimeout(() => {
    //   loading.value = false;
    // }, 500);
  }
});
</script>
<template>
  <v-text-field
    v-model="query"
    :loading="loading"
    :placeholder="placeholder"
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
