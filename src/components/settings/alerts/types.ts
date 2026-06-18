export type AlertConfigurationId = string | number;

export type CronType =
  | "SERVICE_PROVIDER_EXPIRING"
  | "SERVICE_PROVIDER_CONTRACT_EXPIRED"
  | "COVERAGE_PERIOD_EXPIRING"
  | "COVERAGE_PERIOD_EXPIRED";

export type CronExecutionStatus = "SUCCESS" | "FAILURE" | string | null;

export type AlertConfigurationForm = {
  id?: AlertConfigurationId;
  name: string;
  description: string | null;
  type: CronType;
  intervalDays: number | null;
  maxRetryCount: number | null;
  enabled?: boolean;
};

export type AlertConfigurationListing = {
  id: AlertConfigurationId;
  name: string;
  description: string | null;
  type: CronType;
  lastExecutionStatus: CronExecutionStatus;
  intervalDays: number | null;
  lastExecution: string | null;
  nextExecution: string | null;
  retryCount: number | null;
  maxRetryCount: number | null;
  removable: boolean;
  enabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
};

export type AlertConfigurationOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: "asc" | "desc" }[];
  search: string;
};
