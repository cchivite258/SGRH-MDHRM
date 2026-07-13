<script lang="ts" setup>
import { computed, reactive, ref } from "vue";

const emit = defineEmits(["update:modelValue"]);

const prop = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
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
  <v-textarea
    class="text-area-component"
    v-model="fieldValue"
    variant="solo"
    :placeholder="prop.placeholder"
    :disabled="prop.disabled"
  />
</template>

<style scoped>
:deep(.v-messages__message) {
  font-size: 0.65rem;
  color: #ff5252;
  line-height: 1.2;
  margin-top: -3px;
}
</style>
