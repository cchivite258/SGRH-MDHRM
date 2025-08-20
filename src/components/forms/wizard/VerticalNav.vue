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

const getColor = (value: number) => {
  if (isActiveStep(value)) {
    return "primary";
  } else if (isVisited(value)) {
    return "success";
  }
};

const isActiveStep = (activeStep: number) => {
  return activeStep === step.value;
};

const isVisited = (value: number) => {
  return value < step.value;
};
const isPending = (value: number) => {
  return value > step.value;
};
</script>
<template>
  <div>
    <v-btn
      class="my-3"
      :color="getColor(1)"
      block
      variant="outlined"
      @click="step = 1"
    >
      <i v-if="isPending(1)" class="bx bxs-x-circle me-1" />
      <i v-else class="bx bxs-check-circle me-1" />
      <b class="me-2"> Step 1 </b> General
    </v-btn>
    <v-btn
      class="my-3"
      :color="getColor(2)"
      block
      variant="outlined"
      @click="step = 2"
    >
      <i v-if="isPending(2)" class="bx bxs-x-circle me-1 text-danger" />
      <i v-else class="bx bxs-check-circle me-1" />
      <b class="me-2">Step 2</b>
      Description
    </v-btn>
    <v-btn
      class="my-3"
      :color="getColor(3)"
      block
      variant="outlined"
      @click="step = 3"
    >
      <i v-if="isPending(3)" class="bx bxs-x-circle me-1 text-danger" />
      <i v-else class="bx bxs-check-circle me-1" />
      <b class="me-2">Step 3</b>
      Finish
    </v-btn>
  </div>
</template>
