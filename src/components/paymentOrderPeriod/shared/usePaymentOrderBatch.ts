import { ref } from "vue";
import { paymentOrderPeriodService, paymentOrderService } from "@/app/http/httpServiceProvider";
import type {
  PaymentOrderLine,
  PaymentOrderPeriodId,
  PaymentOrderPeriodListing,
} from "@/components/paymentOrderPeriod/types";

export const usePaymentOrderBatch = (periodId: PaymentOrderPeriodId) => {
  const period = ref<PaymentOrderPeriodListing | null>(null);
  const lines = ref<PaymentOrderLine[]>([]);
  const loading = ref(false);
  const loadError = ref<unknown>(null);

  const load = async () => {
    loading.value = true;
    loadError.value = null;

    try {
      const [periodResponse, periodLines] = await Promise.all([
        paymentOrderPeriodService.getPaymentOrderPeriodById(periodId),
        paymentOrderService.getAllByPeriod(periodId),
      ]);

      period.value = periodResponse.data;
      lines.value = periodLines;
    } catch (error) {
      loadError.value = error;
    } finally {
      loading.value = false;
    }
  };

  return {
    period,
    lines,
    loading,
    loadError,
    load,
  };
};
