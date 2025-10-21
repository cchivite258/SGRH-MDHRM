<script lang="ts" setup>
import { computed, ref } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";

const emit = defineEmits(["update:modelValue", "onAdd"]);

const prop = defineProps({
  modelValue: {
    type: String,
    default: ""
  }
});

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", updatedQuery);
  }
});
</script>
<template>
  <v-row justify="end" class="align-center">
    <v-col cols="12" md="6" lg="3">
      <QuerySearch
        v-model="query"
        placeholder="Search for instructors, email, contact number or something..."
      />
    </v-col>
    <v-col cols="auto">
      <v-btn color="secondary" @click="emit('onAdd')">
        <i class="ph-plus-circle" /> Add Instructor
      </v-btn>
    </v-col>
  </v-row>
</template>
