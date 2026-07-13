<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(["update:modelValue", "onConfirm"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false
  },
  titleKey: {
    type: String,
    default: "t-reverse-invoice-notes-title"
  },
  labelKey: {
    type: String,
    default: "t-invoice-action-notes-label"
  },
  placeholderKey: {
    type: String,
    default: "t-reverse-invoice-notes-placeholder"
  },
  requiredKey: {
    type: String,
    default: "t-reverse-invoice-notes-required"
  },
  submitKey: {
    type: String,
    default: "t-submit-reverse"
  },
  submitColor: {
    type: String,
    default: "warning"
  }
});

const notes = ref("");
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    notes.value = "";
  }
});

const requiredRules = {
  notes: [(value: string) => !!value?.trim() || t(props.requiredKey)]
};

const submit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  const trimmedNotes = notes.value.trim();
  if (!valid || !trimmedNotes) {
    toast.error(t("t-validation-error"));
    return;
  }

  emit("onConfirm", trimmedNotes);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <v-form ref="form" @submit.prevent="submit">
      <Card :title="$t(titleKey)" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn type="button" icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>

        <v-divider />

        <v-card-text class="overflow-y-auto" style="max-height: 45vh">
          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ t(labelKey) }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextArea
                v-model="notes"
                :placeholder="$t(placeholderKey)"
                :rules="requiredRules.notes"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn type="button" color="danger" class="me-1" @click="dialogValue = false">
              <i class="ph-x me-1" /> {{ $t("t-close") }}
            </v-btn>
            <v-btn type="submit" :color="submitColor" variant="elevated" :loading="loading" :disabled="loading">
              {{ $t(submitKey) }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
