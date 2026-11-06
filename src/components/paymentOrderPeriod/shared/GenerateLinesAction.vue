<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { paymentOrderPeriodService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import { actionsByStatus } from "@/components/paymentOrderPeriod/listView/utils";
import BatchConfirmationDialog from "@/components/paymentOrderPeriod/shared/BatchConfirmationDialog.vue";
import type { PaymentOrderPeriodListing } from "@/components/paymentOrderPeriod/types";

const props = withDefaults(defineProps<{
  period: PaymentOrderPeriodListing;
  hasLines: boolean;
  disabled?: boolean;
  size?: "small" | "default";
  variant?: "tonal" | "elevated";
}>(), {
  disabled: false,
  size: "small",
  variant: "tonal",
});

const emit = defineEmits<{
  (event: "generated"): void;
}>();

const { t } = useI18n();
const toast = useToast();
const { can } = usePermissions();

const dialog = ref(false);
const loading = ref(false);

const visible = computed(() =>
  (actionsByStatus[props.period.status] ?? []).includes("generate")
  && can(PERMISSIONS.PAYMENT_ORDER_PERIODS.GENERATE)
);

const generate = async () => {
  loading.value = true;

  try {
    const response = await paymentOrderPeriodService.generatePaymentOrderPeriod(props.period.id);
    if (response.status === "error") throw response.error;

    toast.success(t("t-payment-order-batch-generated"));
    dialog.value = false;
    emit("generated");
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <template v-if="visible">
    <v-btn
      color="primary"
      :variant="variant"
      :size="size"
      :disabled="disabled || loading"
      :loading="loading"
      @click="dialog = true"
    >
      <i :class="[hasLines ? 'ph-arrows-clockwise' : 'ph-rows', 'me-1']" />
      {{ hasLines ? $t("t-payment-order-regenerate-lines") : $t("t-payment-order-generate-lines") }}
    </v-btn>

    <BatchConfirmationDialog
      v-model="dialog"
      :action="hasLines ? 'regenerate' : 'generate'"
      :loading="loading"
      @onConfirm="generate"
    />
  </template>
</template>
