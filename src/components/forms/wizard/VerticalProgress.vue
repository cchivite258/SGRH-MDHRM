<script lang="ts" setup>
import { ref } from "vue";
import VerticalNav from "@/components/forms/wizard/VerticalNav.vue";
import Step1 from "@/components/forms/wizard/Step1.vue";
import Step2 from "@/components/forms/wizard/Step2.vue";
import Step3 from "@/components/forms/wizard/Step3.vue";
const step = ref(1);

const onStepChange = (value: number) => {
  step.value = value;
};
</script>
<template>
  <Card title="Vertical Nav Steps">
    <v-card-text>
      <v-row>
        <v-col sm="12" md="4" lg="2">
          <VerticalNav v-model="step" class="mb-5" />
        </v-col>
        <v-col sm="12" md="8" lg="10">
          <Step1 v-if="step === 1" @onStepChange="onStepChange" />
          <Step2 v-if="step === 2" @onStepChange="onStepChange" />
          <Step3 v-if="step === 3" />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
