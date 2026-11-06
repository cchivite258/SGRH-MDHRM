export type PaymentOrderPeriodId = string;

export type PaymentOrderPeriodStatus = "OPEN" | "GENERATED" | "CLOSED" | "POSTED";

export type PaymentOrderLineType = "DEDUCTION" | "REFUND";

export type BatchConfirmationAction =
  | "generate"
  | "regenerate"
  | "close"
  | "reopen"
  | "post"
  | "settle"
  | "leave";

export type PaymentOrderEmployeeSummary = {
  id: string;
  employeeNumber?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
};

export type PaymentOrderLine = {
  id: string;
  paymentOrderPeriodId?: string;
  startDate?: string | null;
  endDate?: string | null;
  employeeId?: string | null;
  type?: PaymentOrderLineType;
  totalRefund?: number | null;
  totalDeduction?: number | null;
  previousBalance?: number | null;
  amountToPay?: number | null;
  amountSettled?: number | null;
  balance?: number | null;
  notes?: string | null;
  employee?: PaymentOrderEmployeeSummary | null;
  removable?: boolean;
  enabled?: boolean;
};

export type PaymentOrderSettleItem = {
  id: string;
  amountSettled: number;
  notes?: string;
};

export type PaymentOrderContractSummary = {
  id: number | string;
  code?: string | null;
  erpCode?: string | null;
  name?: string | null;
  description?: string | null;
};

export type PaymentOrderPeriodForm = {
  contractId: number | string | null;
  year: number | null;
  month: number | null;
  notes: string;
};

export type PaymentOrderPeriodListing = {
  id: PaymentOrderPeriodId;
  contractId: number | string;
  year: number;
  month: number;
  startDate?: string | null;
  endDate?: string | null;
  periodConfigId?: number | null;
  status: PaymentOrderPeriodStatus;
  generatedAt?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  postedAt?: string | null;
  sentBy?: string | null;
  sentAt?: string | null;
  notes?: string | null;
  contract?: PaymentOrderContractSummary | null;
  paymentOrders?: PaymentOrderLine[];
  removable?: boolean;
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PaymentOrderPeriodOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: "asc" | "desc" }[];
  search: string;
};

export type PaymentOrderTotals = {
  lines: number;
  refunds: number;
  deductions: number;
  totalRefund: number;
  totalDeduction: number;
  previousBalance: number;
  amountToPay: number;
  amountSettled: number;
  balance: number;
  grossAmountToPay: number;
  grossAmountSettled: number;
  settledLines: number;
};
