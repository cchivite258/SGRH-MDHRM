export type AlertConfigurationId = string | number;

export type CronType =
  | "SERVICE_PROVIDER_EXPIRING"
  | "COVERAGE_PERIOD_EXPIRING";

export type ScheduledJobRepeatUnit = "MINUTES" | "HOURS" | "DAYS" | "WEEKS" | "MONTHS";

export type ScheduledJobStatus = "SCHEDULED" | "SUCCESS" | "FAILURE" | "RUNNING" | string | null;

export type ScheduledJobExecution = {
  id: AlertConfigurationId;
  scheduledJobId: AlertConfigurationId;
  startedAt: string | null;
  finishedAt: string | null;
  status: ScheduledJobStatus;
  errorMessage: string | null;
};

export type ScheduledJobParameter = {
  id: AlertConfigurationId;
  scheduledJobId: AlertConfigurationId;
  type: string;
  value: string;
};

export type ScheduledParameterType =
  | "DAYS_BEFORE_EXPIRATION"
  | "WEEKS_BEFORE_EXPIRATION"
  | "MONTHS_BEFORE_EXPIRATION"
  | "YEARS_BEFORE_EXPIRATION";

export type ScheduledParameterForm = {
  id?: AlertConfigurationId;
  scheduledJobId: AlertConfigurationId;
  type: ScheduledParameterType;
  value: string;
};

export type ScheduledParameterListing = ScheduledParameterForm & {
  id: AlertConfigurationId;
  scheduledJob?: {
    id: AlertConfigurationId;
    name: string;
    description: string | null;
    type: CronType;
    retryCount: number | null;
    maxRetryCount: number | null;
    lastStatus: ScheduledJobStatus;
    lastExecution: string | null;
    nextExecution: string | null;
    cronExpression: string | null;
  };
  removable: boolean;
  enabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
};

export type AlertConfigurationForm = {
  id?: AlertConfigurationId;
  name: string;
  description: string | null;
  type: CronType;
  maxRetryCount: number | null;
  enabled: boolean;
  repeatUnit: ScheduledJobRepeatUnit;
  repeatValue: number | null;
};

export type AlertConfigurationListing = {
  id: AlertConfigurationId;
  name: string;
  description: string | null;
  type: CronType;
  lastExecution: string | null;
  nextExecution: string | null;
  cronExpression: string | null;
  executions: ScheduledJobExecution[];
  parameters: ScheduledJobParameter[];
  lastStatus: ScheduledJobStatus;
  retryCount: number | null;
  maxRetryCount: number | null;
  repeatUnit?: ScheduledJobRepeatUnit;
  repeatValue?: number | null;
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
