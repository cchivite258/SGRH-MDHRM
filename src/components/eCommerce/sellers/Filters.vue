<script lang="ts" setup>
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { categoriesOptions } from "@/components/eCommerce/sellers/utils";
import { computed, ref } from "vue";

const emit = defineEmits(["update:modelValue", "onAdd"]);
const prop = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});
const temp = ref("");
const query = computed({
  get() {
    return prop.modelValue;
  },
  set(newVal: string) {
    emit("update:modelValue", newVal);
  },
});
</script>
<template>
  <v-row justify="space-between">
    <v-col cols="auto">
      <v-btn color="primary" class="" elevation="0" @click="emit('onAdd')">
        <i class="ph-plus-circle me-1" /> Add Sellers
      </v-btn>
    </v-col>
    <v-col lg="4">
      <div class="d-flex align-center">
        <div class="w-100 me-2">
          <QuerySearch
            v-model="query"
            placeholder="Search for sellers & owner name"
          />
        </div>
        <v-select
          v-model="temp"
          :items="categoriesOptions"
          placeholder="Select Categories"
          variant="plain"
          rounded
          density="compact"
          hide-details
          class="seller-filter-select-item filter-select-item"
        />
      </div>
    </v-col>
  </v-row>
</template>
