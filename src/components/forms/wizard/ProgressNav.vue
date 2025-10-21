<script lang="ts" setup>
import { computed } from "vue";

const emit = defineEmits(["update:modelValue"]);
const prop = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
});

const step = computed({
  get() {
    return prop.modelValue;
  },
  set(step: number) {
    emit("update:modelValue", step);
  },
});

const is2ndStepVisited = computed(() => {
  return step.value <= 3 && step.value > 1;
});

const is3rdStepVisited = computed(() => {
  return step.value === 3;
});
</script>
<template>
  <div class="d-flex justify-space-between align-center">
    <v-btn
      icon
      :color="step <= 3 ? 'primary' : 'primary-subtle'"
      density="comfortable"
      @click="step = 1"
      >1</v-btn
    >
    <v-divider
      :color="is2ndStepVisited ? 'primary' : 'primary-subtle'"
      :class="is2ndStepVisited ? 'border-opacity-100' : ''"
    />
    <v-btn
      icon
      :color="is2ndStepVisited ? 'primary' : 'primary-subtle'"
      density="comfortable"
      @click="step = 2"
      >2</v-btn
    >
    <v-divider
      :color="is3rdStepVisited ? 'primary' : 'primary-subtle'"
      :class="is3rdStepVisited ? 'border-opacity-100' : ''"
    />
    <v-btn
      icon
      :color="is3rdStepVisited ? 'primary' : 'primary-subtle'"
      density="comfortable"
      @click="step = 3"
      >3</v-btn
    >
  </div>
</template>
