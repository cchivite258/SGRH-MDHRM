<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import ApiRecordErrorsDialog from "@/app/common/components/ApiRecordErrorsDialog.vue";
import { usePermissions } from "@/composables/usePermissions";
import { useApiRecordErrors } from "@/composables/useApiRecordErrors";
import { actionsByStatusFor, type ProcessSection } from "@/components/paymentOrderPeriod/listView/utils";
import BatchConfirmationDialog from "@/components/paymentOrderPeriod/shared/BatchConfirmationDialog.vue";
import { periodServiceFor } from "@/components/paymentOrderPeriod/shared/sectionApi";
import { sectionPeriodPermissions } from "@/components/paymentOrderPeriod/shared/workflow";
import type { PaymentOrderPeriodListing } from "@/components/paymentOrderPeriod/types";

const props = withDefaults(defineProps<{
  period: PaymentOrderPeriodListing;
  hasLines: boolean;
  section?: ProcessSection;
  disabled?: boolean;
  size?: "small" | "default";
  variant?: "tonal" | "elevated";
}>(), {
  section: "erp-integration",
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
const { recordErrorsDialog, recordErrors, recordErrorsMessage, showRecordErrors } = useApiRecordErrors();

const dialog = ref(false);
const loading = ref(false);

const visible = computed(() =>
  (actionsByStatusFor(props.section)[props.period.status] ?? []).includes("generate")
  && can(sectionPeriodPermissions(props.section).GENERATE)
);

const generate = async () => {
  loading.value = true;

  try {
    const response = await periodServiceFor(props.section).generatePaymentOrderPeriod(props.period.id);
    if (response.status === "error") throw response.error;

    toast.success(t("t-payment-order-batch-generated"));
    dialog.value = false;
    emit("generated");
  } catch (error) {
    if (showRecordErrors(error)) {
      dialog.value = false;
    } else {
      getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
    }
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

    <ApiRecordErrorsDialog
      v-model="recordErrorsDialog"
      :records="recordErrors"
      :message="recordErrorsMessage"
    />
  </template>
</template>
