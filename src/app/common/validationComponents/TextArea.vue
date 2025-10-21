<script lang="ts" setup>
import { computed, reactive, ref } from "vue";

const emit = defineEmits(["update:modelValue"]);

const prop = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const fieldValue = computed({
  get() {
    return prop.modelValue || "";
  },
  set(newValue: string) {
    emit("update:modelValue", newValue);
  },
});
</script>
<template>
  <v-textarea class="text-area-component" v-model="fieldValue" variant="solo" />
</template>
