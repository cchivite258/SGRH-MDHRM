export type PaymentOrderPeriodId = string;

export type PaymentOrderPeriodStatus =
  | "OPEN"
  | "GENERATED"
  | "SUBMITTED"
  | "QUEUED"
  | "SENDING"
  | "RETRY_SCHEDULED"
  | "NEEDS_INTERVENTION"
  | "INTEGRATED"
  | "PROCESSED"
  | "POSTED";

export type PaymentOrderLineType = "DEDUCTION" | "REFUND";

export type PaymentOrderWorkflowAction =
  | "generate"
  | "submit"
  | "resend"
  | "reopen"
  | "process"
  | "unprocess";

export type BatchConfirmationAction =
  | "generate"
  | "regenerate"
  | "submit"
  | "resend"
  | "reopen"
  | "process"
  | "unprocess"
  | "settle"
  | "leave";

export type PaymentOrderEmployeeSummary = {
  id: string;
  employeeNumber?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  erpCode?: string | null;
};

export type PaymentOrderInvoiceSummary = {
  id?: string;
  invoiceNumber?: string | null;
  issueDate?: string | Date | null;
  serviceProvisionDate?: string | Date | null;
  totalAmount?: number | null;
  invoiceStatus?: string | null;
  isEmployeeInvoice?: boolean | null;
  employee?: PaymentOrderEmployeeSummary | null;
  dependent?: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  serviceProvider?: {
    id?: number | string;
    name?: string | null;
  } | null;
};

export type PaymentOrderLine = {
  id: string;
  paymentOrderPeriodId?: string;
  startDate?: string | null;
  endDate?: string | null;
  employeeId?: string | null;
  employeeNumber?: string | null;
  employeeName?: string | null;
  type?: PaymentOrderLineType;
  totalRefund?: number | null;
  totalDeduction?: number | null;
  previousBalance?: number | null;
  amountToPay?: number | null;
  amountSettled?: number | null;
  calculatedAmountSettled?: number | null;
  balance?: number | null;
  billedAmount?: number | null;
  amountCovered?: number | null;
  memberPaidAmount?: number | null;
  notes?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  invoice?: PaymentOrderInvoiceSummary | null;
  serviceProviderId?: number | null;
  serviceProviderName?: string | null;
  serviceProvisionDate?: string | null;
  employee?: PaymentOrderEmployeeSummary | null;
  details?: PaymentOrderLineDetail[] | null;
  removable?: boolean;
  enabled?: boolean;
};

export type PaymentOrderLineDetail = {
  id: string;
  paymentOrderId?: string | null;
  invoiceId?: string | null;
  type?: PaymentOrderLineType | null;
  amount?: number | null;
  invoice?: PaymentOrderInvoiceSummary | null;
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
  processedAt?: string | null;
  processedBy?: string | null;
  postedAt?: string | null;
  postedBy?: string | null;
  externalBatchNumber?: string | null;
  externalPayablesBatchNumber?: string | null;
  sentBy?: string | null;
  sentAt?: string | null;
  integrationError?: string | null;
  notes?: string | null;
  contract?: PaymentOrderContractSummary | null;
  paymentOrders?: PaymentOrderLine[];
  removable?: boolean;
  enabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PaymentOrderPeriodHistoryAction =
  | "CREATE"
  | "GENERATE"
  | "SUBMIT"
  | "REOPEN"
  | "SEND"
  | "INTEGRATE"
  | "SCHEDULE_RETRY"
  | "REQUIRE_INTERVENTION"
  | "RESEND"
  | "PROCESS"
  | "UNPROCESS"
  | "POST";

export type PaymentOrderLedger = "ACCOUNTS_PAYABLE" | "GENERAL_LEDGER";

export type PaymentOrderIntegrationOperation = "LOOKUP" | "CREATE";

export type PaymentOrderIntegrationOutcome = "FOUND" | "NOT_FOUND" | "CREATED" | "FAILED";

export type PaymentOrderIntegrationAttempt = {
  id: string;
  attempt?: number | null;
  ledger?: PaymentOrderLedger | null;
  operation?: PaymentOrderIntegrationOperation | null;
  outcome?: PaymentOrderIntegrationOutcome | null;
  reference?: string | null;
  externalBatchNumber?: string | null;
  message?: string | null;
  triggeredBy?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
};

export type PaymentOrderPeriodInvoice = {
  id: string;
  paymentOrderPeriodId?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  serviceProvisionDate?: string | null;
  employeeId?: string | null;
  employeeNumber?: string | null;
  employeeName?: string | null;
  serviceProviderId?: number | null;
  serviceProviderName?: string | null;
  destination?: PaymentOrderLedger | null;
  externalBatchNumber?: string | null;
  billedAmount?: number | null;
  amountCovered?: number | null;
  memberPaidAmount?: number | null;
};

export type PaymentOrderPeriodHistory = {
  id: string;
  action: PaymentOrderPeriodHistoryAction;
  previousStatus?: PaymentOrderPeriodStatus | null;
  newStatus?: PaymentOrderPeriodStatus | null;
  successful?: boolean | null;
  message?: string | null;
  performedBy?: string | null;
  performedAt?: string | null;
};

export type PaymentOrderEntryDirection = "DEBIT" | "CREDIT";

export type PaymentOrderEntryRole = "COMPANY" | "EMPLOYEE" | "SUPPLIER";

export type PaymentOrderEntry = {
  id?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  employeeId?: string | null;
  employeeNumber?: string | null;
  direction?: PaymentOrderEntryDirection | null;
  role?: PaymentOrderEntryRole | null;
  accountNumber?: string | null;
  sourceLedger?: string | null;
  sourceType?: string | null;
  amount?: number | null;
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
  calculatedAmountSettled: number;
  balance: number;
  grossAmountToPay: number;
  grossAmountSettled: number;
  settledLines: number;
};
