<script lang="ts" setup>
import { computed, ref } from "vue";

import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";

const emit = defineEmits(["update:modelValue", "onAdd"]);

const prop = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", updatedQuery);
  },
});
</script>
<template>
  <v-row justify="end" class="align-center">
    <v-col cols="12" lg="3">
      <QuerySearch
        v-model="query"
        placeholder="Search for instructors, email, contact number or something..."
      />
    </v-col>
    <v-col cols="auto">
      <v-btn color="secondary" @click="emit('onAdd')">
        <i class="ph-plus-circle" /> Add Instructor
      </v-btn>

      <v-btn
        class="ms-2"
        icon="ph-squares-four"
        color="primary"
        rounded
        density="comfortable"
      />
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            class="ms-2"
            icon="ph-list-bullets"
            color="primary"
            :variant="isHovering ? 'elevated' : 'tonal'"
            rounded
            density="comfortable"
            to="/instructors/list"
          />
        </template>
      </v-hover>
    </v-col>
  </v-row>
</template>
