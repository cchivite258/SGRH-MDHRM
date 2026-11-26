import type {
  RefundDeductionReopenPayload,
  RefundDeductionUnprocessPayload,
} from "@/app/http/services/amm/refundDeductionPeriodService";
import { PERMISSIONS, type PermissionRequirement } from "@/app/permissions/constants";
import { actionsByStatusFor, type ProcessSection } from "@/components/paymentOrderPeriod/listView/utils";
import { periodServiceFor } from "@/components/paymentOrderPeriod/shared/sectionApi";
import type {
  BatchConfirmationAction,
  PaymentOrderPeriodId,
  PaymentOrderPeriodStatus,
  PaymentOrderWorkflowAction,
} from "@/components/paymentOrderPeriod/types";

export type RefundDeductionWorkflowPayload =
  | RefundDeductionUnprocessPayload
  | RefundDeductionReopenPayload;

const erpWorkflowActions: PaymentOrderWorkflowAction[] = ["generate", "submit", "resend"];
const refundsWorkflowActions: PaymentOrderWorkflowAction[] = [
  "generate",
  "submit",
  "reopen",
  "process",
  "unprocess",
];

export const workflowActionsFor = (section: ProcessSection): PaymentOrderWorkflowAction[] =>
  section === "refunds-and-deductions" ? refundsWorkflowActions : erpWorkflowActions;

export const isWorkflowAction = (value: string, section: ProcessSection = "erp-integration"): value is PaymentOrderWorkflowAction =>
  (workflowActionsFor(section) as string[]).includes(value);

const erpWorkflowPermissions: Record<PaymentOrderWorkflowAction, PermissionRequirement> = {
  generate: PERMISSIONS.PAYMENT_ORDER_PERIODS.GENERATE,
  submit: PERMISSIONS.PAYMENT_ORDER_PERIODS.SUBMIT,
  resend: PERMISSIONS.PAYMENT_ORDER_PERIODS.RESEND,
  reopen: PERMISSIONS.PAYMENT_ORDER_PERIODS.REOPEN,
  process: PERMISSIONS.PAYMENT_ORDER_PERIODS.PROCESS,
  unprocess: PERMISSIONS.PAYMENT_ORDER_PERIODS.PROCESS,
};

const refundsWorkflowPermissions: Record<PaymentOrderWorkflowAction, PermissionRequirement> = {
  generate: PERMISSIONS.REFUND_DEDUCTION_PERIODS.GENERATE,
  submit: PERMISSIONS.REFUND_DEDUCTION_PERIODS.SUBMIT,
  resend: PERMISSIONS.PAYMENT_ORDER_PERIODS.RESEND,
  reopen: PERMISSIONS.REFUND_DEDUCTION_PERIODS.REOPEN,
  process: PERMISSIONS.REFUND_DEDUCTION_PERIODS.PROCESS,
  unprocess: PERMISSIONS.REFUND_DEDUCTION_PERIODS.UNPROCESS,
};

/** @deprecated Prefer workflowPermissionsFor(section). Mantido para a secção ERP. */
export const workflowPermissions = erpWorkflowPermissions;

export const workflowPermissionsFor = (
  section: ProcessSection = "erp-integration"
): Record<PaymentOrderWorkflowAction, PermissionRequirement> =>
  section === "refunds-and-deductions" ? refundsWorkflowPermissions : erpWorkflowPermissions;

export const sectionPeriodPermissions = (section: ProcessSection = "erp-integration") =>
  section === "refunds-and-deductions"
    ? PERMISSIONS.REFUND_DEDUCTION_PERIODS
    : PERMISSIONS.PAYMENT_ORDER_PERIODS;

export const workflowButtons: Record<
  Exclude<PaymentOrderWorkflowAction, "generate">,
  { label: string; icon: string; color: string }
> = {
  submit: { label: "t-payment-order-submit-batch", icon: "ph-paper-plane-tilt", color: "warning" },
  resend: { label: "t-payment-order-resend-batch", icon: "ph-arrow-clockwise", color: "error" },
  reopen: { label: "t-payment-order-reopen-batch", icon: "ph-x-circle", color: "error" },
  process: { label: "t-payment-order-process-batch", icon: "ph-gear-six", color: "primary" },
  unprocess: { label: "t-payment-order-unprocess-batch", icon: "ph-arrow-u-up-left", color: "error" },
};

export const workflowSuccessKeys: Record<PaymentOrderWorkflowAction, string> = {
  generate: "t-payment-order-batch-generated",
  submit: "t-payment-order-batch-submitted",
  resend: "t-payment-order-batch-resent",
  reopen: "t-payment-order-batch-reopened",
  process: "t-payment-order-batch-processed",
  unprocess: "t-payment-order-batch-unprocessed",
};

export const workflowSuccessKey = (
  action: PaymentOrderWorkflowAction,
  section: ProcessSection = "erp-integration"
) => {
  if (action === "submit" && section === "refunds-and-deductions") {
    return "t-refund-deduction-batch-submitted";
  }
  return workflowSuccessKeys[action];
};

export const allowedWorkflowActions = (
  status: PaymentOrderPeriodStatus | null | undefined,
  section: ProcessSection = "erp-integration"
) => {
  const allowed = actionsByStatusFor(section);
  return workflowActionsFor(section).filter(action => !!status && allowed[status]?.includes(action));
};

export const confirmationActionFor = (
  action: PaymentOrderWorkflowAction,
  _status?: PaymentOrderPeriodStatus | null
): BatchConfirmationAction => action;

export const runWorkflowAction = (
  id: PaymentOrderPeriodId,
  action: PaymentOrderWorkflowAction,
  section: ProcessSection = "erp-integration",
  payload?: RefundDeductionWorkflowPayload
) => {
  const service = periodServiceFor(section);

  switch (action) {
    case "generate":
      return service.generatePaymentOrderPeriod(id);
    case "submit":
      return service.submitPaymentOrderPeriod(id);
    case "resend":
      if (!("resendPaymentOrderPeriod" in service)) {
        return Promise.resolve({ status: "error" as const, error: undefined });
      }
      return (service as any).resendPaymentOrderPeriod(id);
    case "reopen":
      if (
        !payload
        || !("reasonId" in payload)
        || !payload.reasonId
        || !("notes" in payload)
        || !payload.notes?.trim()
      ) {
        return Promise.resolve({ status: "error" as const, error: undefined });
      }
      return (service as any).reopenPaymentOrderPeriod(id, payload);
    case "process":
      return (service as any).processPaymentOrderPeriod(id);
    case "unprocess":
      if (!payload || !("reasonId" in payload)) {
        return Promise.resolve({ status: "error" as const, error: undefined });
      }
      return (service as any).unprocessPaymentOrderPeriod(id, payload);
  }
};
