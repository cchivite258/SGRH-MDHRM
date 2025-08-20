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
</script>
<template>
  <div class="d-flex justify-space-between align-center">
    <v-row no-gutters>
      <v-col cols="4">
        <v-btn
          rounded="0"
          color="primary"
          block
          :variant="step === 1 ? 'elevated' : 'tonal'"
          @click="step = 1"
        >
          General
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn
          rounded="0"
          color="primary"
          block
          :variant="step === 2 ? 'elevated' : 'tonal'"
          @click="step = 2"
        >
          Description
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn
          rounded="0"
          color="primary"
          block
          :variant="step === 3 ? 'elevated' : 'tonal'"
          @click="step = 3"
        >
          Finish
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>
