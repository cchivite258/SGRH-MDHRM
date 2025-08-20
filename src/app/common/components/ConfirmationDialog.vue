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
      <slot />
      <v-card-actions class="d-flex justify-center mt-4 mb-7">
        <v-btn
          color="light"
          @click="dialogValue = false"
          class="me-2"
          flat
          variant="elevated"
        >
          Close
        </v-btn>
        <v-btn
          color="danger"
          flat
          variant="elevated"
          @click="emit('onConfirm')"
        >
          Yes, Delete It!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
