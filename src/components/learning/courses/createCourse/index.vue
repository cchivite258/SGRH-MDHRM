<script lang="ts" setup>
import { ref } from "vue";
import Stepper from "@/components/learning/courses/createCourse/Stepper.vue";
import Step1 from "@/components/learning/courses/createCourse/Step1.vue";
import Step2 from "@/components/learning/courses/createCourse/Step2.vue";
import Step3 from "@/components/learning/courses/createCourse/Step3.vue";
const step = ref(1);

const onStepChange = (value: number) => {
  step.value = value;
};
</script>
<template>
  <Card title="Create Course">
    <v-card-text>
      <Stepper v-model="step" class="mb-5" />
      <Step1 v-if="step === 1" @onStepChange="onStepChange" />
      <Step2 v-if="step === 2" @onStepChange="onStepChange" />
      <Step3 v-if="step === 3" />
    </v-card-text>
  </Card>
</template>
