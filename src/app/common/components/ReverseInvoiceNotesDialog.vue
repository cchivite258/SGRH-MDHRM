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
  }
});

const notes = ref("");
const showError = ref(false);
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
    showError.value = false;
  }
});

const requiredRules = {
  notes: [(value: string) => !!value?.trim() || t('t-reverse-invoice-notes-required')]
};

const submit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  const trimmedNotes = notes.value.trim();
  if (!valid || !trimmedNotes) {
    showError.value = true;
    toast.error(t("t-validation-error"));
    return;
  }

  emit("onConfirm", trimmedNotes);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <v-form ref="form" @submit.prevent="submit">
      <Card :title="$t('t-reverse-invoice-notes-title')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>

        <v-divider />

        <v-card-text class="overflow-y-auto" style="max-height: 45vh">
          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ t('t-reverse-invoice-notes-label') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextArea
                v-model="notes"
                :placeholder="$t('t-reverse-invoice-notes-placeholder')"
                :rules="requiredRules.notes"
                hide-details="auto"
              />
              <div v-if="showError" class="text-danger text-caption mt-1">
                {{ $t('t-reverse-invoice-notes-required') }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="dialogValue = false">
              <i class="ph-x me-1" /> {{ $t("t-close") }}
            </v-btn>
            <v-btn color="warning" variant="elevated" @click="submit" :loading="loading" :disabled="loading">
              {{ $t('t-submit-reverse') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
