<script lang="ts" setup>
import { computed } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
const prop = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
});
const emit = defineEmits(["update:modelValue"]);

const query = computed({
  get() {
    return prop.modelValue.query || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      query: updatedQuery,
    });
  },
});
</script>
<template>
  <v-row class="my-3">
    <v-col cols="12" lg="3">
      <QuerySearch
        v-model="query"
        placeholder="Search products, price etc..."
      />
    </v-col>
  </v-row>
</template>
