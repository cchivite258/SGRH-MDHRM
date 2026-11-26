<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import TextArea from "@/app/common/validationComponents/TextArea.vue";
import { reasonService } from "@/app/http/httpServiceProvider";
import type { RefundDeductionReopenPayload } from "@/app/http/services/amm/refundDeductionPeriodService";

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "onConfirm", payload: RefundDeductionReopenPayload): void;
}>();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const { t } = useI18n();
const toast = useToast();

const reasonId = ref<number | string | null>(null);
const notes = ref("");
const reasonsLoading = ref(false);
const reasonOptions = ref<{ value: number | string; label: string }[]>([]);

const dialogValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (props.loading) return;
    emit("update:modelValue", value);
  },
});

const loadReasons = async () => {
  reasonsLoading.value = true;
  try {
    const { content } = await reasonService.getReasonsByType("REFUND_DEDUCTION_REOPEN");
    reasonOptions.value = (content || [])
      .filter(item => item.enabled !== false)
      .map(item => ({ value: Number(item.id), label: item.name }));
  } catch (error) {
    console.error("Erro ao carregar motivos de rejeição do lote:", error);
    reasonOptions.value = [];
    toast.error(t("t-message-save-error"));
  } finally {
    reasonsLoading.value = false;
  }
};

watch(
  () => props.modelValue,
  open => {
    if (!open) return;
    reasonId.value = null;
    notes.value = "";
    loadReasons();
  }
);

const confirm = () => {
  if (!reasonId.value) {
    toast.error(t("t-please-select-reject-batch-reason"));
    return;
  }

  const trimmed = notes.value.trim();
  if (!trimmed) {
    toast.error(t("t-please-enter-reject-batch-notes"));
    return;
  }

  emit("onConfirm", {
    reasonId: Number(reasonId.value),
    notes: trimmed,
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="520" :persistent="loading">
    <v-card>
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        :disabled="loading"
        @click="dialogValue = false"
      />
      <v-card-text class="mx-4 my-5">
        <div class="text-center text-error mb-4">
          <i class="ph ph-x-circle ph-4x" />
        </div>
        <h4 class="text-h6 font-weight-bold text-center">
          {{ $t("t-dialog-title-confirm-reopen-batch") }}
        </h4>
        <p class="text-muted text-center text-subtitle-1 mb-4">
          {{ $t("t-dialog-text-confirm-reopen-batch") }}
        </p>

        <div class="reject-batch-dialog__fields text-start">
          <div class="reject-batch-dialog__field">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t("t-reason") }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect
              v-model="reasonId"
              :items="reasonOptions"
              :placeholder="$t('t-select-reason')"
              :disabled="loading || reasonsLoading"
            />
          </div>
          <div class="reject-batch-dialog__field">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t("t-notes") }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextArea
              v-model="notes"
              :placeholder="$t('t-enter-notes')"
              :disabled="loading"
            />
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center pb-5">
        <v-btn color="secondary" variant="outlined" :disabled="loading" @click="dialogValue = false">
          {{ $t("t-cancel") }}
        </v-btn>
        <v-btn color="error" variant="elevated" :loading="loading" @click="confirm">
          {{ $t("t-yes-reopen-batch") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.confirm-close-icon {
  position: absolute;
  right: 8px;
  top: 8px;
  z-index: 1;
}

.reject-batch-dialog__fields :deep(.menu-select-filter),
.reject-batch-dialog__fields :deep(.text-area-component) {
  width: 100%;
}

.reject-batch-dialog__field + .reject-batch-dialog__field {
  margin-top: 4px;
}

.reject-batch-dialog__fields :deep(.v-input__details) {
  display: none;
}

.reject-batch-dialog__fields :deep(.v-input) {
  margin-bottom: 0;
}
</style>
