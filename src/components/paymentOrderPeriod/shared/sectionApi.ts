import {
  paymentOrderPeriodService,
  paymentOrderService,
  refundDeductionOrderService,
  refundDeductionPeriodService,
} from "@/app/http/httpServiceProvider";
import type { ProcessSection } from "@/components/paymentOrderPeriod/listView/utils";

export const periodServiceFor = (section: ProcessSection) =>
  section === "refunds-and-deductions" ? refundDeductionPeriodService : paymentOrderPeriodService;

export const orderServiceFor = (section: ProcessSection) =>
  section === "refunds-and-deductions" ? refundDeductionOrderService : paymentOrderService;

export const isRefundsSection = (section?: ProcessSection | null) => section === "refunds-and-deductions";
