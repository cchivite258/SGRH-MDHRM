<script lang="ts" setup>
import { ref } from "vue";
import darkLogo from "@/assets/images/logo-dark.png";
import ButtonNav from "@/components/forms/wizard/ButtonNav.vue";
import Step1 from "@/components/forms/wizard/Step1.vue";
import Step2 from "@/components/forms/wizard/Step2.vue";
import Step3 from "@/components/forms/wizard/Step3.vue";
const step = ref(1);

const onStepChange = (value: number) => {
  step.value = value;
};
</script>
<template>
  <Card title="Button Nav Steps">
    <v-card-text>
      <div class="text-center font-weight-bold text-subtitle-1 my-7">
        <v-img :src="darkLogo" height="25" />
      </div>
      <ButtonNav v-model="step" class="mb-5" />
      <Step1 v-if="step === 1" @onStepChange="onStepChange" />
      <Step2 v-if="step === 2" @onStepChange="onStepChange" />
      <Step3 v-if="step === 3" />
    </v-card-text>
  </Card>
</template>
