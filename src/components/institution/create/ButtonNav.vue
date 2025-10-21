<script lang="ts" setup>
import { computed } from "vue";

const emit = defineEmits(["update:modelValue"]); 
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  institutionId: {
    type: [String],
    default: null
  },
  basicDataValidated: {
    type: Boolean,
    default: false
  }
});

const step = computed({
  get() {
    return props.modelValue;
  },
  set(step: number) {
    emit("update:modelValue", step);
  },
});

// Computed para determinar se uma tab deve estar desabilitada
const isTabDisabled = (tabNumber: number) => {
  // No modo edição (quando tem institutionId), todas tabs estão habilitadas
  if (props.institutionId) return false;
  
  // No modo criação:
  // - Tab 1 sempre habilitada
  // - Tabs 2-4 desabilitadas até basicDataValidated ser true
  return tabNumber > 1 && !props.basicDataValidated;
};
</script>

<template>
  <div class="d-flex justify-space-between align-center">
    <v-row no-gutters>
      <v-col cols="3">
        <v-btn 
          rounded="0" 
          color="primary" 
          block 
          :variant="step === 1 ? 'elevated' : 'tonal'" 
          @click="step = 1"
          :disabled="isTabDisabled(1)"
        >
          {{ $t('t-general-information') }}
        </v-btn>
      </v-col>
            <v-col cols="3">
        <v-btn 
          rounded="0" 
          color="primary" 
          block 
          :variant="step === 2 ? 'elevated' : 'tonal'" 
          @click="step = 2"
          :disabled="isTabDisabled(2)"
        >
          {{ $t('t-periods') }}
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn 
          rounded="0" 
          color="primary" 
          block 
          :variant="step === 3 ? 'elevated' : 'tonal'" 
          @click="step = 3"
          :disabled="isTabDisabled(2)"
        >
          {{ $t('t-health-plan') }}
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn 
          rounded="0" 
          color="primary" 
          block 
          :variant="step === 4 ? 'elevated' : 'tonal'" 
          @click="step = 4"
          :disabled="isTabDisabled(3)"
        >
          {{ $t('t-organizational-structure') }}
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn 
          rounded="0" 
          color="primary" 
          block 
          :variant="step === 5 ? 'elevated' : 'tonal'" 
          @click="step = 5"
          :disabled="isTabDisabled(4)"
        >
          {{ $t('t-contact') }}
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn 
          rounded="0" 
          color="primary" 
          block 
          :variant="step === 6 ? 'elevated' : 'tonal'" 
          @click="step = 6"
          :disabled="isTabDisabled(4)"
        >
          {{ $t('t-clinics') }}
        </v-btn>
      </v-col>
      <v-col cols="4">
        <v-btn 
          rounded="0" 
          color="primary" 
          block 
          :variant="step === 7 ? 'elevated' : 'tonal'" 
          @click="step = 7"
          :disabled="isTabDisabled(4)"
        >
          {{ $t('t-employees') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>