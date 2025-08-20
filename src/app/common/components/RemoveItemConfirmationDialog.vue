<script lang="ts" setup>
import { computed } from "vue";

const emit = defineEmits(["update:modelValue", "onConfirm"]); 
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  width: {
    type: Number,
    default: 550,
  },
  loading: { 
    type: Boolean,
    default: false
  }
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});
</script>
<template>
  <v-dialog :width="width" v-model="dialogValue">
    <v-card>
      <v-card-title> {{ title }} </v-card-title>
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        @click="dialogValue = false"
      />

      <v-card-text class="text-center ma-md-5">
        <div class="text-danger">
          <i class="ph ph-trash ph-4x" />
        </div>
        <div class="mt-4">
          <h4 class="text-h6 font-weight-bold">
            <slot name="title"> {{ $t('t-dialog-title-confirm-delete') }}</slot>
          </h4>
          <p class="text-muted mx-4 mb-0 text-subtitle-1">
            <slot name="text">
              {{ $t('t-dialog-text-confirm-delete') }}
            </slot>
          </p>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-center mt-4 mb-7">
        <v-btn @click="dialogValue = false" class="me-2" flat variant="tonal">
          {{$t('t-close')}}
        </v-btn>
        <v-btn
          color="danger"
          flat
          variant="elevated"
          :loading="loading" 
          :disabled="loading"
          @click="emit('onConfirm')"
        >
          {{$t('t-yes-delete-it')}}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
