export type IntegrationDefinitionId = string | number;

export type IntegrationApplication = "SAGE" | "PRIMAVERA" | "SAPP";

export type IntegrationUsageType = "PAYMENT_ORDERS";

export type IntegrationDefinitionForm = {
  id?: IntegrationDefinitionId;
  code?: string | null;
  application: IntegrationApplication | "";
  name: string;
  description: string;
  baseUrl: string;
  apiVersion: string;
  tenant: string;
  companyCode: string;
  username: string;
  password?: string;
  timeoutSeconds: number | null;
  passwordConfigured?: boolean;
};

export type IntegrationDefinitionUsage = {
  id: IntegrationDefinitionId;
  integrationDefinitionId?: IntegrationDefinitionId;
  usage: IntegrationUsageType;
  sourceLedger?: string | null;
  sourceType?: string | null;
  removable?: boolean;
};

export type IntegrationDefinitionListing = Omit<IntegrationDefinitionForm, "password"> & {
  id: IntegrationDefinitionId;
  active?: boolean;
  removable?: boolean;
  enabled?: boolean;
  usages?: IntegrationDefinitionUsage[];
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
};

export type IntegrationDefinitionSummary = {
  id: IntegrationDefinitionId;
  code?: string | null;
  application?: IntegrationApplication | string | null;
  name?: string | null;
  description?: string | null;
  active?: boolean;
};

export type IntegrationDefinitionOption = {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: "asc" | "desc" }[];
  search: string;
};
