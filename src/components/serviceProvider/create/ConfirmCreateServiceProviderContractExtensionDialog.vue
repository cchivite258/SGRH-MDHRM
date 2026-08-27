<script lang="ts" setup>
import { computed } from "vue";

const emit = defineEmits(["update:modelValue", "onConfirm"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 550
  }
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" :width="width">
    <v-card>
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        :disabled="loading"
        @click="dialogValue = false"
      />

      <v-card-text class="text-center ma-md-5">
        <div class="text-warning">
          <i class="ph ph-warning-circle ph-4x" />
        </div>
        <div class="mt-4">
          <h4 class="text-h6 font-weight-bold">
            {{ $t('t-dialog-title-confirm-create-contract-extension') }}
          </h4>
          <p class="text-muted mx-4 mb-0 text-subtitle-1">
            {{ $t('t-dialog-text-confirm-create-contract-extension') }}
          </p>
        </div>
      </v-card-text>

      <v-card-actions class="d-flex justify-center mt-4 mb-7">
        <v-btn class="me-2" flat variant="tonal" :disabled="loading" @click="dialogValue = false">
          {{ $t('t-close') }}
        </v-btn>
        <v-btn
          color="warning"
          flat
          variant="elevated"
          :loading="loading"
          :disabled="loading"
          @click="emit('onConfirm')"
        >
          {{ $t('t-yes-create-it') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
