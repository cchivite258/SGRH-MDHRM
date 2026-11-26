<script lang="ts" setup>
import { ref } from "vue";

withDefaults(defineProps<{
  label: string;
  placeholder?: string;
  modelValue?: string | null;
  rules?: Array<(value: unknown) => string | boolean>;
  disabled?: boolean;
  readonly?: boolean;
  errorMessages?: string[];
  loading?: boolean;
  showSave?: boolean;
  showTitle?: boolean;
  formId?: string;
}>(), {
  placeholder: "",
  modelValue: "",
  rules: () => [],
  disabled: false,
  readonly: false,
  errorMessages: () => [],
  loading: false,
  showSave: false,
  showTitle: true,
  formId: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  save: [];
}>();

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const submit = async () => {
  if (form.value) {
    const { valid } = await form.value.validate();
    if (!valid) return;
  }
  emit("save");
};
</script>

<template>
  <v-form :id="formId" ref="form" class="integration-data-form" @submit.prevent="submit">
    <Card v-if="showTitle" :title="$t('t-integration')" elevation="0" title-class="py-0">
      <template v-if="showSave && !readonly" #title-action>
        <v-btn color="secondary" variant="elevated" type="submit" :loading="loading" :disabled="disabled || loading">
          <i class="ph-floppy-disk me-2" />
          {{ $t("t-save") }}
        </v-btn>
      </template>

      <v-card-text class="integration-data-form__body">
        <div class="font-weight-bold mb-2">{{ label }}</div>
        <div v-if="readonly">{{ modelValue || "-" }}</div>
        <TextField
          v-else
          :model-value="modelValue || ''"
          :placeholder="placeholder"
          :rules="rules"
          :disabled="disabled"
          :error-messages="errorMessages"
          @update:model-value="emit('update:modelValue', $event)"
        />
      </v-card-text>
    </Card>

    <div v-else class="integration-data-form__body">
      <div class="font-weight-bold mb-2">{{ label }}</div>
      <div v-if="readonly">{{ modelValue || "-" }}</div>
      <TextField
        v-else
        :model-value="modelValue || ''"
        :placeholder="placeholder"
        :rules="rules"
        :disabled="disabled"
        :error-messages="errorMessages"
        hide-details="auto"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </v-form>
</template>

<style scoped>
.integration-data-form__body {
  padding-top: 8px;
  padding-bottom: 4px;
}
</style>
