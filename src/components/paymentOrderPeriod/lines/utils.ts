import { amountFormate } from "@/app/common/amountFormate";
import type {
  PaymentOrderLine,
  PaymentOrderLineType,
  PaymentOrderTotals,
} from "@/components/paymentOrderPeriod/types";

export type PaymentOrderLineFilter = "all" | "pending" | "settled" | "changed";

export const toAmount = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const roundAmount = (value: number) => Math.round(value * 100) / 100;

export const formatAmount = (value: unknown) => `${amountFormate(toAmount(value))} MT`;

export const employeeName = (line: PaymentOrderLine) => {
  const employee = line.employee;
  const name = [employee?.firstName, employee?.middleName, employee?.lastName]
    .map(part => part?.trim())
    .filter(Boolean)
    .join(" ");
  return name || "-";
};

export const employeeNumber = (line: PaymentOrderLine) => line.employee?.employeeNumber || "-";

export const lineTypeColor = (type?: PaymentOrderLineType | null) => {
  if (type === "REFUND") return "success";
  if (type === "DEDUCTION") return "danger";
  return "secondary";
};

export const lineTypeIcon = (type?: PaymentOrderLineType | null) => {
  if (type === "REFUND") return "ph-arrow-circle-down";
  if (type === "DEDUCTION") return "ph-arrow-circle-up";
  return "ph-circle";
};

/** Value understood by the shared `Status` component (success for refunds, danger for deductions). */
export const lineTypeStatusValue = (type?: PaymentOrderLineType | null) => {
  if (type === "REFUND") return "active";
  if (type === "DEDUCTION") return "INACTIVE";
  return "entity-neutral";
};

export const lineTypeLabelKey = (type?: PaymentOrderLineType | null) => {
  if (type === "REFUND") return "t-payment-order-type-refund";
  if (type === "DEDUCTION") return "t-payment-order-type-deduction";
  return "-";
};

const hasAmount = (value: unknown) => value !== null && value !== undefined && String(value).trim() !== "";

type BalanceSource = Pick<PaymentOrderLine, "type" | "amountToPay" | "amountSettled">;

/** The settled amount is always handled as positive, even if stored with a sign. */
export const settledAmount = (line: Pick<PaymentOrderLine, "amountSettled">) =>
  roundAmount(Math.abs(toAmount(line.amountSettled)));

/**
 * `amountSettled` is always positive: refunds (positive amount to pay) subtract it,
 * deductions (negative amount to pay) add it.
 */
export const lineBalance = (line: BalanceSource) => {
  const amountToPay = toAmount(line.amountToPay);
  const amountSettled = settledAmount(line);
  return roundAmount(line.type === "DEDUCTION" ? amountToPay + amountSettled : amountToPay - amountSettled);
};

export const isLineSettled = (line: BalanceSource) =>
  hasAmount(line.amountSettled) && roundAmount(lineBalance(line)) === 0;

export const matchesLineSearch = (line: PaymentOrderLine, search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [employeeName(line), employeeNumber(line), line.notes || ""]
    .some(value => value.toLowerCase().includes(term));
};

export const computeTotals = (lines: PaymentOrderLine[]): PaymentOrderTotals =>
  lines.reduce<PaymentOrderTotals>(
    (totals, line) => {
      totals.lines += 1;
      if (line.type === "REFUND") totals.refunds += 1;
      if (line.type === "DEDUCTION") totals.deductions += 1;
      totals.totalRefund += toAmount(line.totalRefund);
      totals.totalDeduction += toAmount(line.totalDeduction);
      totals.previousBalance += toAmount(line.previousBalance);
      totals.amountToPay += toAmount(line.amountToPay);
      totals.amountSettled += settledAmount(line);
      totals.balance += lineBalance(line);
      totals.grossAmountToPay += Math.abs(toAmount(line.amountToPay));
      totals.grossAmountSettled += settledAmount(line);
      if (isLineSettled(line)) totals.settledLines += 1;
      return totals;
    },
    {
      lines: 0,
      refunds: 0,
      deductions: 0,
      totalRefund: 0,
      totalDeduction: 0,
      previousBalance: 0,
      amountToPay: 0,
      amountSettled: 0,
      balance: 0,
      grossAmountToPay: 0,
      grossAmountSettled: 0,
      settledLines: 0,
    }
  );

/** Uses absolute amounts so refunds (positive) and deductions (negative) don't cancel each other out. */
export const settlementPercent = (totals: Pick<PaymentOrderTotals, "grossAmountToPay" | "grossAmountSettled">) => {
  if (totals.grossAmountToPay <= 0) return totals.grossAmountSettled > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round((totals.grossAmountSettled / totals.grossAmountToPay) * 100)));
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
