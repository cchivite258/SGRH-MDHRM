import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";
import type { MenuSelectItemType } from "@/app/common/components/filters/types";
import type {
  PaymentOrderPeriodListing,
  PaymentOrderPeriodStatus,
} from "@/components/paymentOrderPeriod/types";

export type ProcessSection = "refunds-and-deductions" | "erp-integration";

export const PROCESS_SECTION_ROUTES: Record<ProcessSection, string> = {
  "refunds-and-deductions": "/payment-order-periods/list",
  "erp-integration": "/payment-order-periods/erp-integration",
};

export const PAYMENT_ORDER_PERIOD_LIST_ROUTE = PROCESS_SECTION_ROUTES["refunds-and-deductions"];

export const resolveProcessSection = (value: unknown): ProcessSection =>
  value === "refunds-and-deductions" || value === "erp-integration" ? value : "erp-integration";

export const processSectionRoute = (section: ProcessSection = "erp-integration") => PROCESS_SECTION_ROUTES[section];

export const sectionTitleKey = (section: ProcessSection) =>
  section === "erp-integration" ? "erp-integration" : "refunds-and-deductions";

export const sectionSubtitleKey = (section: ProcessSection) =>
  section === "erp-integration" ? "t-erp-integration-subtitle" : "t-payment-order-batches-subtitle";

export const listBreadcrumb = (section: ProcessSection): BreadcrumbType[] => [
  {
    title: "healthcare-management",
    disabled: false,
  },
  {
    title: "process",
    disabled: true,
  },
  {
    title: sectionTitleKey(section),
    disabled: true,
  },
];

const detailBreadcrumb = (section: ProcessSection, title: string): BreadcrumbType[] => [
  {
    title: "healthcare-management",
    disabled: false,
  },
  {
    title: "process",
    disabled: true,
  },
  {
    title: sectionTitleKey(section),
    disabled: false,
    to: processSectionRoute(section),
  },
  {
    title,
    disabled: true,
  },
];

export const viewBreadcrumbFor = (section: ProcessSection) => detailBreadcrumb(section, "view-payment-order-batch");
export const settleBreadcrumbFor = (section: ProcessSection) => detailBreadcrumb(section, "settle-payment-order-batch");

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
  "SUBMITTED",
  "QUEUED",
  "SENDING",
  "RETRY_SCHEDULED",
  "NEEDS_INTERVENTION",
  "INTEGRATED",
  "PROCESSED",
  "POSTED",
];

const viewOnly = ["view", "history"];

/** Integração ERP: Aberto -> Gerado -> submeter -> Agendado. Reenviar só em Precisa de intervenção. */
export const erpActionsByStatus: Record<PaymentOrderPeriodStatus, string[]> = {
  OPEN: ["view", "history", "generate", "delete"],
  GENERATED: ["view", "history", "generate", "submit", "delete"],
  SUBMITTED: viewOnly,
  QUEUED: viewOnly,
  SENDING: viewOnly,
  RETRY_SCHEDULED: viewOnly,
  NEEDS_INTERVENTION: ["view", "history", "resend"],
  INTEGRATED: viewOnly,
  PROCESSED: viewOnly,
  POSTED: viewOnly,
};

/** Reembolsos e descontos: regularização HR com submit/reopen/process/unprocess. */
export const refundsActionsByStatus: Record<PaymentOrderPeriodStatus, string[]> = {
  OPEN: ["view", "history", "generate", "delete"],
  GENERATED: ["view", "history", "generate", "submit", "delete"],
  SUBMITTED: ["view", "history", "settle", "reopen", "process"],
  QUEUED: viewOnly,
  SENDING: viewOnly,
  RETRY_SCHEDULED: viewOnly,
  NEEDS_INTERVENTION: viewOnly,
  INTEGRATED: viewOnly,
  PROCESSED: ["view", "history", "unprocess"],
  POSTED: viewOnly,
};

export const actionsByStatusFor = (section: ProcessSection): Record<PaymentOrderPeriodStatus, string[]> =>
  section === "refunds-and-deductions" ? refundsActionsByStatus : erpActionsByStatus;

/** @deprecated Prefer actionsByStatusFor(section). Mantido para a secção ERP. */
export const actionsByStatus = erpActionsByStatus;

/** Acções da listagem: consulta + gerar/refrescar/submeter/rejeitar/reverter. */
const LIST_MENU_ACTIONS = new Set([
  "view",
  "history",
  "generate",
  "submit",
  "settle",
  "reopen",
  "unprocess",
  "delete",
]);

export const listActionsByStatusFor = (section: ProcessSection): Record<PaymentOrderPeriodStatus, string[]> => {
  const byStatus = actionsByStatusFor(section);
  return Object.fromEntries(
    (Object.keys(byStatus) as PaymentOrderPeriodStatus[]).map(status => [
      status,
      (byStatus[status] ?? []).filter(action => LIST_MENU_ACTIONS.has(action)),
    ])
  ) as Record<PaymentOrderPeriodStatus, string[]>;
};

/** Processamento do lote (editar valor regularizado) só em Submetido. */
export const editableSettlementStatuses: PaymentOrderPeriodStatus[] = ["SUBMITTED"];

/** Só Submetido + permissão PROCESS; restantes estados ficam em consulta. */
export const canEditSettlementForStatus = (
  status: PaymentOrderPeriodStatus | null | undefined,
  options: { canProcess: boolean }
) => status === "SUBMITTED" && options.canProcess;

export const settleableStatuses: PaymentOrderPeriodStatus[] = (
  Object.keys(refundsActionsByStatus) as PaymentOrderPeriodStatus[]
).filter(status => refundsActionsByStatus[status].includes("settle"));

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
  SUBMITTED: "PENDING",
  QUEUED: "PENDING",
  SENDING: "RUNNING",
  RETRY_SCHEDULED: "PENDING",
  NEEDS_INTERVENTION: "high",
  INTEGRATED: "POSTED",
  PROCESSED: "DRAFT",
  POSTED: "POSTED",
};

/** Value understood by the shared `Status` component, which picks the chip colour from it. */
export const statusChipValue = (status?: PaymentOrderPeriodStatus | null) =>
  (status && STATUS_CHIP_VALUE[status]) || "entity-neutral";

export const statusChipVariant = (status?: PaymentOrderPeriodStatus | null): "tonal" | "elevated" =>
  status === "PROCESSED" || status === "NEEDS_INTERVENTION" ? "elevated" : "tonal";
