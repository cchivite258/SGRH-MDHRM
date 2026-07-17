export type ReasonType =
  | "INVOICE_POSTING_FLAGGED"
  | "INVOICE_REVERSAL"
  | "INVOICE_CANCELATION"
  | "EMPLOYEE_CHANGE_BASE_SALARY"
  | "EMPLOYEE_TERMINATION"
  | "COVERAGE_PERIOD_EXTENSION"
  | "SERVICE_PROVIDER_CONTRACT_EXTENSION";

export type ReasonInsert = {
  id?: string;
  name: string;
  type: ReasonType;
  description: string | null;
  enabled: boolean;
};

export type ReasonListing = {
  id: string;
  name: string;
  type: ReasonType;
  description: string | null;
  enabled: boolean;
};

export type ReasonUpdate = {
  name: string;
  type: ReasonType;
  description: string | null;
  enabled: boolean;
};

export type ReasonResponse = {
  id: string;
  name: string;
  type: ReasonType;
  description: string | null;
  enabled: boolean;
};

export type ReasonOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: "asc" | "desc" }[];
  search: string;
};
