<script lang="ts" setup>
import { computed } from "vue";
import type { BatchConfirmationAction } from "@/components/paymentOrderPeriod/types";

type ActionConfig = {
  icon: string;
  color: string;
  title: string;
  text: string;
  confirm: string;
  cancel?: string;
};

const actionConfigs: Record<BatchConfirmationAction, ActionConfig> = {
  generate: {
    icon: "ph-rows",
    color: "primary",
    title: "t-dialog-title-confirm-generate-batch",
    text: "t-dialog-text-confirm-generate-batch",
    confirm: "t-yes-generate-batch",
  },
  regenerate: {
    icon: "ph-arrows-clockwise",
    color: "warning",
    title: "t-dialog-title-confirm-generate-batch",
    text: "t-dialog-text-confirm-regenerate-batch",
    confirm: "t-yes-regenerate-batch",
  },
  close: {
    icon: "ph-lock",
    color: "danger",
    title: "t-dialog-title-confirm-close-batch",
    text: "t-dialog-text-confirm-close-batch",
    confirm: "t-yes-close-batch",
  },
  reopen: {
    icon: "ph-lock-open",
    color: "warning",
    title: "t-dialog-title-confirm-reopen-batch",
    text: "t-dialog-text-confirm-reopen-batch",
    confirm: "t-yes-reopen-batch",
  },
  post: {
    icon: "ph-check-circle",
    color: "info",
    title: "t-dialog-title-confirm-post-batch",
    text: "t-dialog-text-confirm-post-batch",
    confirm: "t-yes-post-batch",
  },
  settle: {
    icon: "ph-coins",
    color: "success",
    title: "t-dialog-title-confirm-settle-batch",
    text: "t-dialog-text-confirm-settle-batch",
    confirm: "t-yes-settle-batch",
  },
  leave: {
    icon: "ph-warning",
    color: "warning",
    title: "t-dialog-title-confirm-leave-batch",
    text: "t-dialog-text-confirm-leave-batch",
    confirm: "t-yes-leave-batch",
    cancel: "t-payment-order-keep-editing",
  },
};

const emit = defineEmits(["update:modelValue", "onConfirm"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  action: {
    type: String as () => BatchConfirmationAction,
    required: true,
  },
  textParams: {
    type: Object as () => Record<string, unknown>,
    default: () => ({}),
  },
  width: {
    type: Number,
    default: 500,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const config = computed(() => actionConfigs[prop.action]);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    if (prop.loading) return;
    emit("update:modelValue", dialog);
  },
});
</script>

<template>
  <v-dialog :width="width" v-model="dialogValue" :persistent="loading">
    <v-card>
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        :disabled="loading"
        @click="dialogValue = false"
      />

      <v-card-text class="text-center mx-4 my-5">
        <div :class="`text-${config.color}`">
          <i :class="['ph', config.icon, 'ph-4x']" />
        </div>
        <div class="mt-4">
          <h4 class="text-h6 font-weight-bold">
            <slot name="title">{{ $t(config.title) }}</slot>
          </h4>
          <p class="text-muted mx-4 mb-0 text-subtitle-1">
            <slot name="text">{{ $t(config.text, textParams) }}</slot>
          </p>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-center mt-2 mb-6">
        <v-btn class="me-2" flat variant="tonal" :disabled="loading" @click="dialogValue = false">
          {{ $t(config.cancel || "t-close") }}
        </v-btn>
        <v-btn
          :color="config.color"
          flat
          variant="elevated"
          :loading="loading"
          :disabled="loading"
          @click="emit('onConfirm')"
        >
          {{ $t(config.confirm) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
