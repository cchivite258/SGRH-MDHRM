import { ref } from "vue";
import type { ProcessSection } from "@/components/paymentOrderPeriod/listView/utils";
import { orderServiceFor, periodServiceFor } from "@/components/paymentOrderPeriod/shared/sectionApi";
import type {
  PaymentOrderLine,
  PaymentOrderPeriodId,
  PaymentOrderPeriodListing,
} from "@/components/paymentOrderPeriod/types";

export const usePaymentOrderBatch = (
  periodId: PaymentOrderPeriodId,
  section: ProcessSection = "erp-integration"
) => {
  const period = ref<PaymentOrderPeriodListing | null>(null);
  const lines = ref<PaymentOrderLine[]>([]);
  const loading = ref(false);
  const loadError = ref<unknown>(null);

  const load = async () => {
    loading.value = true;
    loadError.value = null;

    try {
      const periodService = periodServiceFor(section);
      const orderService = orderServiceFor(section);
      const [periodResponse, periodLines] = await Promise.all([
        periodService.getPaymentOrderPeriodById(periodId),
        orderService.getAllByPeriod(periodId),
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
