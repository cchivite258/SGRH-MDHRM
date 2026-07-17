<script lang="ts" setup>
import { computed, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { reasonService } from "@/app/http/httpServiceProvider";
import type { ReasonListing, ReasonType } from "@/components/baseTables/reason/types";

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
  },
  reasonType: {
    type: String as PropType<ReasonType | "">,
    default: ""
  }
});

const notes = ref("");
const reasonId = ref("");
const reasons = ref<ReasonListing[]>([]);
const reasonsLoading = ref(false);
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
    reasonId.value = "";
    fetchReasons();
  }
});

const requiredRules = {
  notes: [(value: string) => !!value?.trim() || t(props.requiredKey)],
  reason: [(value: string) => !props.reasonType || !!value || t("t-please-select-reason")]
};

const reasonOptions = computed(() =>
  reasons.value
    .filter(reason => reason.enabled)
    .map(reason => ({
      label: reason.name,
      value: reason.id
    }))
);

const fetchReasons = async () => {
  if (!props.reasonType) return;

  reasonsLoading.value = true;
  try {
    const { content } = await reasonService.getReasonsByType(props.reasonType);
    reasons.value = content;
  } catch (error) {
    reasons.value = [];
    toast.error(t("t-message-load-error"));
  } finally {
    reasonsLoading.value = false;
  }
};

const submit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  const trimmedNotes = notes.value.trim();
  if (!valid || !trimmedNotes || (props.reasonType && !reasonId.value)) {
    toast.error(t("t-validation-error"));
    return;
  }

  if (props.reasonType) {
    emit("onConfirm", { notes: trimmedNotes, reasonId: reasonId.value });
    return;
  }

  emit("onConfirm", trimmedNotes);
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="560" scrollable>
    <v-form ref="form" @submit.prevent="submit">
      <Card :title="$t(titleKey)" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn type="button" icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>

        <v-divider />

        <v-card-text class="invoice-notes-dialog__body overflow-y-auto">
          <v-row class="invoice-notes-dialog__row">
            <v-col v-if="reasonType" cols="12" lg="12" class="invoice-notes-dialog__field">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-reason") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="reasonId"
                :items="reasonOptions"
                :placeholder="$t('t-select-reason')"
                :rules="requiredRules.reason"
                :disabled="loading || reasonsLoading"
              />
            </v-col>
            <v-col cols="12" lg="12" class="invoice-notes-dialog__field mt-n6">
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

<style scoped>
.invoice-notes-dialog__body {
  max-height: min(65vh, 520px);
  padding: 16px 24px 12px;
}

.invoice-notes-dialog__row {
  margin: -6px;
}

.invoice-notes-dialog__field {
  padding: 6px !important;
}
</style>
