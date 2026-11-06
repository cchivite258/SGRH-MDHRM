import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";
import type {
  PaymentOrderPeriodListing,
  PaymentOrderPeriodStatus,
} from "@/components/paymentOrderPeriod/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "healthcare-management",
    disabled: false,
  },
  {
    title: "payment-order-batches",
    disabled: true,
  },
];

export const PAYMENT_ORDER_PERIOD_LIST_ROUTE = "/payment-order-periods/list";

const detailBreadcrumb = (title: string): BreadcrumbType[] => [
  {
    title: "healthcare-management",
    disabled: false,
  },
  {
    title: "payment-order-batches",
    disabled: false,
    to: PAYMENT_ORDER_PERIOD_LIST_ROUTE,
  },
  {
    title,
    disabled: true,
  },
];

export const viewBreadcrumb = detailBreadcrumb("view-payment-order-batch");
export const settleBreadcrumb = detailBreadcrumb("settle-payment-order-batch");

export const listViewHeader: DataTableHeaderType[] = [
  { title: "contract", key: "contract.name", sortable: true },
  { title: "period", key: "year", sortable: true },
  { title: "start-date", key: "startDate", sortable: true },
  { title: "end-date", key: "endDate", sortable: true },
  { title: "status", key: "status", sortable: true },
  { title: "action", sortable: false, align: "center" },
];

export const paymentOrderPeriodStatuses: PaymentOrderPeriodStatus[] = [
  "OPEN",
  "GENERATED",
  "CLOSED",
  "POSTED",
];

// Fluxo: Aberto -> Gerado -> Fechado -> Lançado. Reabrir só a partir de Fechado.
export const actionsByStatus: Record<PaymentOrderPeriodStatus, string[]> = {
  OPEN: ["view", "generate", "delete"],
  GENERATED: ["view", "settle", "generate", "close", "delete"],
  CLOSED: ["view", "settle", "reopen", "post"],
  POSTED: ["view"],
};

/** Statuses where the settlement screen can be opened (read-only when not editable). */
export const settleableStatuses: PaymentOrderPeriodStatus[] = (Object.keys(actionsByStatus) as PaymentOrderPeriodStatus[])
  .filter(status => actionsByStatus[status].includes("settle"));

/** Statuses where settled amounts and notes can still be edited. */
export const editableSettlementStatuses: PaymentOrderPeriodStatus[] = ["GENERATED"];

export const monthOptions = (): MenuSelectItemType[] =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const name = new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(new Date(2024, index, 1));
    return {
      value: month,
      label: name.charAt(0).toUpperCase() + name.slice(1),
    };
  });

export const formatMonthYear = (month?: number | null, year?: number | null) => {
  if (!month || !year) return "-";
  const name = new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(new Date(year, month - 1, 1));
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ${year}`;
};

export const formatIsoDate = (value?: string | null) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const contractLabel = (item: Pick<PaymentOrderPeriodListing, "contract" | "contractId">) =>
  item.contract?.name || item.contract?.code || (item.contractId != null ? String(item.contractId) : "-");

export const statusLabelKey = (status?: PaymentOrderPeriodStatus | null) =>
  status ? `t-payment-order-status-${status.toLowerCase()}` : "-";

const STATUS_CHIP_VALUE: Record<PaymentOrderPeriodStatus, string> = {
  OPEN: "open",
  GENERATED: "DRAFT",
  CLOSED: "CLOSED",
  POSTED: "POSTED",
};

/** Value understood by the shared `Status` component, which picks the chip colour from it. */
export const statusChipValue = (status?: PaymentOrderPeriodStatus | null) =>
  (status && STATUS_CHIP_VALUE[status]) || "entity-neutral";
